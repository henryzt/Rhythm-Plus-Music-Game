import {
  dbi,
  songsCollection,
  sheetsCollection,
  functions,
  resultsCollection,
} from "../helpers/firebaseConfig"; //usersCollection
import { store } from "../helpers/store";

export function createSong(songInfo) {
  const { title, artist, image, youtubeId, url } = songInfo;
  let randomId = btoa(parseInt(Date.now() * Math.random())).slice(0, 9);
  let songId = songInfo.title.trim() + "-" + songInfo.artist.trim();
  songId =
    songId.replace(/ /gi, "-").replace(/[^a-z0-9-]/gi, "") + "-" + randomId;
  let dateCreated = dbi.Timestamp.now();
  let dateUpdated = dateCreated;
  let createdBy = store.state.currentUser?.uid;
  console.log(songId);
  return new Promise((resolve, reject) => {
    songsCollection
      .doc(songId)
      .set({
        title,
        artist,
        image,
        youtubeId,
        url,
        dateCreated,
        dateUpdated,
        createdBy,
      })
      .then(function () {
        console.log("Document successfully written!");
        resolve();
      })
      .catch(function (error) {
        console.error("Error writing document: ", error);
        reject(error);
      });
  });
}

export function getSongList() {
  return new Promise((resolve, reject) => {
    songsCollection
      .where("visibility", "==", "public")
      .get()
      .then((querySnapshot) => {
        let res = [];
        querySnapshot.forEach((doc) => {
          let song = filterSongData(doc);

          res.push(song);
          // doc.data() is never undefined for query doc snapshots
          console.log(doc.id, " => ", doc.data());
        });
        resolve(res);
      })
      .catch(function (error) {
        console.error("Error getting document:", error);
        reject(error);
      });
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

export function createSheet(sheetInfo) {
  const {
    title,
    song,
    visualizerNo,
    srcMode,
    youtubeId,
    url,
    sheet,
  } = sheetInfo;
  let dateCreated = dbi.Timestamp.now();
  let dateUpdated = dateCreated;
  let createdBy = store.state.currentUser?.uid;
  return new Promise((resolve, reject) => {
    sheetsCollection
      .doc()
      .set({
        songId: song,
        title: title ?? null,
        visualizerNo: visualizerNo ?? null,
        srcMode: srcMode ?? null,
        youtubeId: youtubeId ?? null,
        url: url ?? null,
        sheet: JSON.stringify(sheet),
        dateCreated,
        dateUpdated,
        createdBy,
      })
      .then(() => {
        console.log("Document successfully written!");
        resolve();
      })
      .catch((error) => {
        console.error("Error writing document: ", error);
        reject();
      });
  });
}

export function getSheetList(songId) {
  return new Promise((resolve, reject) => {
    sheetsCollection
      .where("songId", "==", songId)
      .where("visibility", "==", "public")
      .get()
      .then((querySnapshot) => {
        let res = [];
        querySnapshot.forEach((doc) => {
          let sheet = doc.data();
          sheet.id = doc.id;
          res.push(sheet);
          // doc.data() is never undefined for query doc snapshots
          console.log(doc.id, " => ", doc.data());
        });
        resolve(res);
      })
      .catch(function (error) {
        console.error("Error getting document:", error);
        reject(error);
      });
  });
}

export async function getSheet(sheetId) {
  try {
    let doc = await sheetsCollection.doc(sheetId).get();
    if (doc.exists) {
      let sheet = doc.data();
      let song = await getSong(sheet.songId);
      // fallback sheet data
      sheet.youtubeId = sheet.youtubeId ?? song.youtubeId;
      sheet.url = sheet.url ?? song.url;
      sheet.title = sheet.title ?? song.title + " - " + song.artist;
      sheet.image = song.image;
      sheet.song = song;
      sheet.sheet = JSON.parse(sheet.sheet);
      sheet.sheetId = doc.id;
      console.log("Sheet data:", sheet);
      return sheet;
    } else {
      console.error("No such document");
      return new Error("No such document");
    }
  } catch (error) {
    console.error(error);
    return new Error("Error reading document");
  }
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
      return new Error("No such document");
    }
  } catch (error) {
    console.error(error);
    return new Error("Error reading document");
  }
}
