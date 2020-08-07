import {
  firestore,
  songsCollection,
  sheetsCollection,
  usersCollection,
  functions,
  resultsCollection,
} from "../helpers/firebaseConfig"; //usersCollection
import { store } from "../helpers/store";

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
  return new Promise((resolve, reject) => {
    songsCollection
      .doc(songId)
      .set({
        title,
        artist,
        image: image ?? null,
        youtubeId: youtubeId ?? null,
        url: url ?? null,
        tags: tags ?? null,
        subtitle: subtitle ?? null,
        srcMode,
        visibility,
        dateCreated,
        dateUpdated,
        createdBy,
      })
      .then(function () {
        Logger.log("Document successfully written!");
        resolve(songId);
      })
      .catch(function (error) {
        Logger.error("Error writing document: ", error);
        reject(error);
      });
  });
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
      Logger.error("Error getting document:", error);
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
          // Logger.log("Song data:", doc.data());
          resolve(filterSongData(doc));
        } else {
          // doc.data() will be undefined in this case
          Logger.error("No such document!");
          reject();
        }
      })
      .catch(function (error) {
        Logger.error("Error getting document:", error);
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
      Logger.log("Document successfully updated!");
    })
    .catch(function (error) {
      // The document probably doesn't exist.
      Logger.error("Error updating document: ", error);
    });
}

function cleanForUpdate(obj) {
  obj.dateUpdated = firestore.Timestamp.now();
  Object.keys(obj).forEach((key) => {
    if (obj[key] === undefined) {
      delete obj[key];
    }
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
        Logger.log("Document successfully written!");
        resolve(docRef.id);
      })
      .catch((error) => {
        Logger.error("Error writing document: ", error);
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
      Logger.log("Document successfully updated!");
    })
    .catch(function (error) {
      // The document probably doesn't exist.
      Logger.error("Error updating document: ", error);
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
        // doc.data() is never undefined for query doc snapshots
        // Logger.log(doc.id, " => ", doc.data());
      });
      resolve(res);
    };

    const processErr = (error) => {
      Logger.error("Error getting document:", error);
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
      Logger.error("No such document");
      throw new Error("No such document");
    }
  } catch (error) {
    Logger.error(error);
    throw new Error("Error reading document");
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
          Logger.error("No such document!");
          reject();
        }
      })
      .catch(function (error) {
        Logger.error("Error getting document:", error);
        reject(error);
      });
  });
}

function replaceBaseUrl(sheet) {
  sheet.url = sheet.url ? sheet.url.replace("{base}", "/audio/songs") : null; // replace local songs
}

export function uploadResult(data) {
  let uploader = functions.httpsCallable("uploadResult");
  return uploader(data);
}

export async function getResult(resultId) {
  try {
    let doc = await resultsCollection.doc(resultId).get();
    if (doc.exists) {
      let result = doc.data();
      return result;
    } else {
      Logger.error("No such document");
      throw new Error("No such document");
    }
  } catch (error) {
    Logger.error(error);
    throw new Error("Error reading document");
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
    throw new Error("Error reading document");
  }
}

export async function updateUserProfile(data) {
  const uid = store.state.currentUser?.uid;
  if (!uid) throw new Error("User not logged in");

  Logger.log(uid, data);

  cleanForUpdate(data);

  try {
    await usersCollection.doc(uid).set(data, { merge: true });
    Logger.log("Document successfully updated!");
  } catch (error) {
    // The document probably doesn't exist.
    Logger.error("Error updating document: ", error);
    throw error;
  }
}
