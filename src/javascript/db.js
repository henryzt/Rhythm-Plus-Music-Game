import {
  dbi,
  songsCollection,
  sheetsCollection,
  usersCollection,
  functions,
  resultsCollection,
} from "../helpers/firebaseConfig"; //usersCollection
import { store } from "../helpers/store";

export function createSong(songInfo) {
  const { title, artist, image, youtubeId, url, srcMode, tags } = songInfo;
  let randomId = btoa(parseInt(Date.now() * Math.random())).slice(0, 9);
  let songId = songInfo.title.trim() + "-" + songInfo.artist.trim();
  songId =
    songId.replace(/ /gi, "-").replace(/[^a-z0-9-]/gi, "") + "-" + randomId;
  let dateCreated = dbi.Timestamp.now();
  let dateUpdated = dateCreated;
  let createdBy = store.state.currentUser?.uid;
  let visibility = "private";
  console.log(songId);
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
        srcMode,
        visibility,
        dateCreated,
        dateUpdated,
        createdBy,
      })
      .then(function () {
        console.log("Document successfully written!");
        resolve(songId);
      })
      .catch(function (error) {
        console.error("Error writing document: ", error);
        reject(error);
      });
  });
}

export function getSongList(getPrivate) {
  return new Promise((resolve, reject) => {
    const processRes = (querySnapshot) => {
      let res = [];
      querySnapshot.forEach((doc) => {
        let song = filterSongData(doc);

        res.push(song);
        // doc.data() is never undefined for query doc snapshots
        // console.log(doc.id, " => ", doc.data());
      });
      resolve(res);
    };

    const processErr = (error) => {
      console.error("Error getting document:", error);
      reject(error);
    };

    if (getPrivate) {
      songsCollection
        .where("createdBy", "==", store.state.currentUser?.uid)
        .where("visibility", "in", ["private", "unlisted"])
        .get()
        .then(processRes)
        .catch(processErr);
    } else {
      songsCollection
        .where("visibility", "==", "public")
        .get()
        .then(processRes)
        .catch(processErr);
    }
  });
}

function filterSongData(doc) {
  let song = doc.data();

  song.id = doc.id;
  song.image = song.youtubeId
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
          console.log("Song data:", doc.data());
          resolve(filterSongData(doc));
        } else {
          // doc.data() will be undefined in this case
          console.error("No such document!");
          reject();
        }
      })
      .catch(function (error) {
        console.error("Error getting document:", error);
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
      console.log("Document successfully updated!");
    })
    .catch(function (error) {
      // The document probably doesn't exist.
      console.error("Error updating document: ", error);
    });
}

function cleanForUpdate(obj) {
  obj.dateUpdated = dbi.Timestamp.now();
  // FIXME handle this logic better
  for (let propName in obj) {
    if (obj[propName] === undefined) {
      delete obj[propName];
    }
  }
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
  let dateCreated = dbi.Timestamp.now();
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
        console.log("Document successfully written!");
        resolve(docRef.id);
      })
      .catch((error) => {
        console.error("Error writing document: ", error);
        reject();
      });
  });
}

export function updateSheet(info) {
  console.log(info);
  cleanForUpdate(info);
  console.log(info);

  return sheetsCollection
    .doc(info.id)
    .update(info)
    .then(function () {
      console.log("Document successfully updated!");
    })
    .catch(function (error) {
      // The document probably doesn't exist.
      console.error("Error updating document: ", error);
      throw error;
    });
}

export function getSheetList(songId, getPrivate) {
  return new Promise((resolve, reject) => {
    const processRes = (querySnapshot) => {
      let res = [];
      querySnapshot.forEach((doc) => {
        let sheet = doc.data();
        sheet.id = doc.id;
        res.push(sheet);
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
      });
      resolve(res);
    };

    const processErr = (error) => {
      console.error("Error getting document:", error);
      reject(error);
    };

    let songSheets = sheetsCollection.where("songId", "==", songId);

    if (getPrivate) {
      songSheets
        .where("createdBy", "==", store.state.currentUser?.uid)
        .where("visibility", "in", ["private", "unlisted"])
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
      console.log("Sheet data:", sheet);
      return sheet;
    } else {
      console.error("No such document");
      throw new Error("No such document");
    }
  } catch (error) {
    console.error(error);
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
          console.error("No such document!");
          reject();
        }
      })
      .catch(function (error) {
        console.error("Error getting document:", error);
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
      console.error("No such document");
      throw new Error("No such document");
    }
  } catch (error) {
    console.error(error);
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
    console.error(error);
    throw new Error("Error reading document");
  }
}

export async function updateUserProfile(data) {
  const uid = store.state.currentUser?.uid;
  if (!uid) throw new Error("User not logged in");

  console.log(uid, data);

  cleanForUpdate(data);

  try {
    await usersCollection.doc(uid).set(data, { merge: true });
    console.log("Document successfully updated!");
  } catch (error) {
    // The document probably doesn't exist.
    console.error("Error updating document: ", error);
    throw error;
  }
}
