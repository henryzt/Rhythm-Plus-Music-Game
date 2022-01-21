import {
  firestore,
  songsCollection,
  sheetsCollection,
  usersCollection,
  functions,
  resultsCollection,
  tagsCollection,
  playsCollection,
  playlistsCollection,
} from "../helpers/firebaseConfig"; //usersCollection
import { store } from "../helpers/store";
import { Validator } from "jsonschema";

const assetsBaseUrl = "https://assets.rhythm-plus.com/songs";

const v = new Validator();
const songSchema = require("../../public/schema/song.schema.json");

const action = {
  READ: "reading",
  WRITE: "writing",
  UPDATE: "updating",
};

const errorMsgs = {
  READ: "Error reading document",
  WRITE: "Error writing / updating document",
  NOT_FOUND: "No such document",
  UNAUTHORIZED: "User not logged in",
};

function reportError(error, action) {
  Logger.error(`DB - Error ${action ?? "handling"} document: `, error);
}

function reportSuccess(action, msg) {
  Logger.info(`DB - Document ${action ?? "handling"} succeed.`, msg);
}

function validate(instance, schema) {
  const res = v.validate(instance, schema);
  if (res.errors.length > 0) {
    reportError(res.errors);
    throw new Error("Validator error");
  }
}

export function createSong(songInfo) {
  const {
    title,
    subtitle,
    artist,
    image,
    youtubeId,
    url,
    srcMode,
    tags,
  } = songInfo;
  let randomId = btoa(parseInt(Date.now() * Math.random())).slice(0, 9);
  let songId = songInfo.title.trim() + "-" + songInfo.artist.trim();
  songId =
    songId.replace(/ /gi, "-").replace(/[^a-z0-9-]/gi, "") + "-" + randomId;
  let dateCreated = firestore.Timestamp.now();
  let dateUpdated = dateCreated;
  let createdBy = store.state.currentUser?.uid;
  let visibility = "private";
  Logger.log(songId);

  const song = {
    title,
    artist,
    image: image ?? null,
    youtubeId: youtubeId ?? null,
    url: url ?? null,
    tags: tags ? updateTagArray(tags) : null,
    subtitle: subtitle ?? null,
    srcMode,
    visibility,
    dateCreated,
    dateUpdated,
    createdBy,
  };

  validate(song, songSchema);

  return new Promise((resolve, reject) => {
    songsCollection
      .doc(songId)
      .set(song)
      .then(function () {
        reportSuccess(action.WRITE);
        resolve(songId);
      })
      .catch(function (error) {
        reportError(error, action.WRITE);
        reject(error);
      });
  });
}

export async function getSongListCached() {
  try {
    return await fetch("https://cache.rhythm-plus.com/songs").then((res) =>
      res.json()
    );
  } catch (e) {
    Logger.error("fall back to firebase", e);
    // fall back
    return getSongList();
  }
}

export function getSongList(getPrivate, getAll, filterIdArr) {
  return new Promise((resolve, reject) => {
    let collection = songsCollection;

    const processRes = (querySnapshot) => {
      let res = [];
      querySnapshot.forEach((doc) => {
        let song = filterSongData(doc);
        res.push(song);
      });
      resolve(res);
    };

    const processErr = (error) => {
      reportError(error, action.READ);
      reject(error);
    };

    if (filterIdArr) {
      collection
        .where(firestore.FieldPath.documentId(), "in", filterIdArr)
        .get()
        .then(processRes)
        .catch(processErr);
    } else if (getPrivate) {
      let level = getAll
        ? ["public", "private", "unlisted"]
        : ["private", "unlisted"];
      collection
        .where("createdBy", "==", store.state.currentUser?.uid)
        .where("visibility", "in", level)
        .get()
        .then(processRes)
        .catch(processErr);
    } else {
      collection
        .where("visibility", "==", "public")
        .get()
        .then(processRes)
        .catch(processErr);
    }
  });
}

export async function getSongsInIdArray(getPrivate, getAll, idArray) {
  const chunk = 10;
  const len = idArray.length;
  let songArray = [];
  for (let i = 0; i < len; i += chunk) {
    let idArrChunk = idArray.slice(i, i + chunk);
    const list = await getSongList(getPrivate, getAll, idArrChunk);
    songArray = songArray.concat(list);
  }
  Logger.log(songArray);

  return songArray;
}

function filterSongData(doc) {
  let song = doc.data();
  replaceBaseUrl(song);
  song.id = doc.id;
  song.image =
    !song.image && song.youtubeId
      ? `https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`
      : song.image;
  return song;
}

export function getSong(songId) {
  return new Promise((resolve, reject) => {
    songsCollection
      .doc(songId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          resolve(filterSongData(doc));
        } else {
          // doc.data() will be undefined in this case
          Logger.error(errorMsgs.NOT_FOUND);
          reject();
        }
      })
      .catch(function (error) {
        reportError(error, action.READ);
        reject(error);
      });
  });
}

export function updateSong(info) {
  cleanForUpdate(info);
  return songsCollection
    .doc(info.id)
    .update(info)
    .then(function () {
      reportSuccess(action.UPDATE);
    })
    .catch(function (error) {
      // The document probably doesn't exist.
      reportError(error, action.UPDATE);
    });
}

function cleanForUpdate(obj) {
  obj.dateUpdated = firestore.Timestamp.now();
  if (obj.tags) obj.tags = updateTagArray(obj.tags);
  Object.keys(obj).forEach((key) => {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  });
}

export function updateTagArray(tags) {
  let filteredTags = [];
  for (const tag of tags) {
    const filteredTag = tag.toLowerCase().trim().replace(" ", "-");
    createTag(filteredTag);
    filteredTags.push(filteredTag);
  }
  return filteredTags;
}

function createTag(tag) {
  let dateCreated = firestore.Timestamp.now();
  let dateUpdated = dateCreated;
  let createdBy = store.state.currentUser?.uid;
  let updatedBy = store.state.currentUser?.uid;
  let data = {
    tag,
    dateUpdated,
    createdBy,
    updatedBy,
  };
  return new Promise((resolve, reject) => {
    tagsCollection
      .doc(tag)
      .update({ ...data, updateCount: firestore.FieldValue.increment(1) })
      .then(() => {
        reportSuccess(action.UPDATE, tag);
        resolve();
      })
      .catch((error) => {
        Logger.warn("Update tag failed: ", error);
        // document does not exists
        tagsCollection
          .doc(tag)
          .set({ ...data, dateCreated, updateCount: 1 })
          .then(() => {
            reportSuccess(action.WRITE, tag);
            resolve();
          })
          .catch((error) => {
            reportError(error, action.WRITE);
            reject();
          });
      });
  });
}

export function getTags() {
  return new Promise((resolve, reject) => {
    tagsCollection
      .get()
      .then((snapshot) => {
        let tags = [];
        snapshot.forEach((doc) => tags.push(doc.data()));
        tags = tags
          .sort((a, b) => b.updateCount - a.updateCount)
          .map((a) => a.tag);
        resolve(tags);
      })
      .catch(function (error) {
        reportError(error, action.READ);
        reject(error);
      });
  });
}

export function getPlaylist(id) {
  return getDocById(playlistsCollection, id);
}

export function updatePlaylist(id, data) {
  return playlistsCollection
    .doc(id)
    .update(data)
    .then(function () {
      reportSuccess(action.UPDATE);
    })
    .catch(function (error) {
      // The document probably doesn't exist.
      reportError(error, action.UPDATE);
    });
}

export function createPlay(sheetId, songId) {
  let dateCreated = firestore.Timestamp.now();
  let dateUpdated = dateCreated;
  let createdBy = store.state.currentUser?.uid;
  const status = "started";
  const isAuthed = store.state.authed;
  let data = {
    sheetId,
    songId,
    dateCreated,
    dateUpdated,
    createdBy,
    status,
    isAuthed,
    visibility: "public",
  };
  return new Promise((resolve, reject) => {
    playsCollection
      .add(data)
      .then((docRef) => {
        reportSuccess(action.WRITE);
        resolve(docRef.id);
      })
      .catch((error) => {
        reportError(error, action.WRITE);
        reject();
      });
  });
}

export function updatePlay(playId, updateData) {
  let dateUpdated = firestore.Timestamp.now();
  let data = {
    ...updateData,
    dateUpdated,
  };
  return new Promise((resolve, reject) => {
    playsCollection
      .doc(playId)
      .update(data)
      .then(() => {
        reportSuccess(action.UPDATE);
        resolve();
      })
      .catch((error) => {
        reportError(error, action.UPDATE);
        reject();
      });
  });
}

export function getPlayCount(idKey, id) {
  return new Promise((resolve, reject) => {
    playsCollection
      .where(idKey, "==", id)
      .get()
      .then((snapshot) => {
        resolve(snapshot.size);
      })
      .catch((error) => {
        reportError(error, action.READ);
        reject(error);
      });
  });
}

export function createSheet(sheetInfo) {
  const {
    title,
    songId,
    visualizerName,
    srcMode,
    difficulty,
    youtubeId,
    url,
    keys,
    sheet,
  } = sheetInfo;
  let dateCreated = firestore.Timestamp.now();
  let dateUpdated = dateCreated;
  let createdBy = store.state.currentUser?.uid;
  return new Promise((resolve, reject) => {
    sheetsCollection
      .add({
        songId,
        title: title ?? null,
        visualizerName: visualizerName ?? null,
        difficulty: difficulty ?? null,
        srcMode: srcMode ?? null,
        youtubeId: youtubeId ?? null,
        url: url ?? null,
        sheet: sheet ? JSON.stringify(sheet) : null,
        visibility: "private",
        dateCreated,
        dateUpdated,
        keys,
        createdBy,
      })
      .then((docRef) => {
        reportSuccess(action.WRITE);
        resolve(docRef.id);
      })
      .catch((error) => {
        reportError(error, action.WRITE);
        reject();
      });
  });
}

export function updateSheet(info) {
  Logger.log(info);
  cleanForUpdate(info);
  Logger.log(info);

  return sheetsCollection
    .doc(info.id)
    .update(info)
    .then(function () {
      reportSuccess(action.UPDATE);
    })
    .catch(function (error) {
      reportError(error, action.UPDATE);
      throw error;
    });
}

export function getSheetList(songId, getUserOwned, getOnlyUnpublished) {
  return new Promise((resolve, reject) => {
    const processRes = (querySnapshot) => {
      let res = [];
      querySnapshot.forEach((doc) => {
        let sheet = doc.data();
        sheet.id = doc.id;
        res.push(sheet);
      });
      resolve(res);
    };

    const processErr = (error) => {
      reportError(error, action.READ);
      reject(error);
    };

    let songSheets = songId
      ? sheetsCollection.where("songId", "==", songId)
      : sheetsCollection;

    if (getUserOwned) {
      if (getOnlyUnpublished) {
        songSheets = songSheets.where("visibility", "in", [
          "private",
          "unlisted",
        ]);
      }
      songSheets
        .where("createdBy", "==", store.state.currentUser?.uid)
        .get()
        .then(processRes)
        .catch(processErr);
    } else {
      songSheets
        .where("visibility", "==", "public")
        .get()
        .then(processRes)
        .catch(processErr);
    }
  });
}

export async function getGameSheet(sheetId) {
  try {
    let doc = await sheetsCollection.doc(sheetId).get();
    if (doc.exists) {
      let sheet = doc.data();
      let song = await getSong(sheet.songId);
      // fallback sheet data
      sheet.youtubeId = sheet.youtubeId ?? song.youtubeId;
      sheet.url = sheet.url ?? song.url;
      sheet.srcMode = sheet.srcMode ?? song.srcMode;
      sheet.title = sheet.title ?? song.title + " - " + song.artist;
      sheet.image = song.image;
      sheet.song = song;
      sheet.sheet = JSON.parse(sheet.sheet);
      sheet.sheetId = doc.id;
      replaceBaseUrl(sheet);
      Logger.log("Sheet data:", sheet);
      return sheet;
    } else {
      Logger.error(errorMsgs.NOT_FOUND);
      throw new Error(errorMsgs.NOT_FOUND);
    }
  } catch (error) {
    Logger.error(error);
    throw new Error(errorMsgs.READ);
  }
}

export function getSheet(sheetId) {
  return new Promise((resolve, reject) => {
    sheetsCollection
      .doc(sheetId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          resolve(filterSongData(doc));
        } else {
          // doc.data() will be undefined in this case
          Logger.error(errorMsgs.NOT_FOUND);
          reject();
        }
      })
      .catch(function (error) {
        reportError(error, action.READ);
        reject(error);
      });
  });
}

function replaceBaseUrl(sheet) {
  sheet.url = sheet.url ? sheet.url.replace("{base}", assetsBaseUrl) : null; // replace local songs
}

export function uploadResult(data) {
  let uploader = functions.httpsCallable("uploadResult");
  return uploader(data);
}

export function getResult(resultId) {
  return getDocById(resultsCollection, resultId);
}

async function getDocById(collection, id) {
  try {
    let doc = await collection.doc(id).get();
    if (doc.exists) {
      let result = doc.data();
      return result;
    } else {
      reportError(errorMsgs.NOT_FOUND, action.READ);
      throw new Error(errorMsgs.NOT_FOUND);
    }
  } catch (error) {
    reportError(error, action.READ);
    throw new Error(errorMsgs.READ);
  }
}

export async function getBestScore(sheetId) {
  try {
    let snapshot = await resultsCollection
      .where("uid", "==", store.state.currentUser?.uid)
      .where("sheetId", "==", sheetId)
      .orderBy("result.score", "desc")
      .limit(1)
      .get();

    let res = null;
    snapshot.forEach((doc) => {
      if (doc.exists) {
        res = doc.data();
      }
    });

    return res;
  } catch (error) {
    Logger.error(error);
    throw new Error(errorMsgs.READ);
  }
}

export async function updateUserProfile(data) {
  const uid = store.state.currentUser?.uid;
  if (!uid) throw new Error(errorMsgs.UNAUTHORIZED);

  Logger.log(uid, data);

  cleanForUpdate(data);

  try {
    await usersCollection.doc(uid).set(data, { merge: true });
    reportSuccess(action.UPDATE);
  } catch (error) {
    // The document probably doesn't exist.
    reportError(error, action.UPDATE);
    throw error;
  }
}

export async function getUserProfile(uid) {
  try {
    const res = await usersCollection.doc(uid).get();
    reportSuccess(action.READ);
    return res.data();
  } catch (error) {
    // The document probably doesn't exist.
    reportError(error, action.READ);
    throw error;
  }
}
