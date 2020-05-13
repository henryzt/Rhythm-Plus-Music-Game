import { dbi, usersCollection, songsCollection, sheetsCollection } from "../helpers/firebaseConfig";
import { store } from "../helpers/store";

export function createSong(songInfo) {
  const { title, artist, image, youtubeId, url } = songInfo;
  let randomId = btoa(parseInt(Date.now() * Math.random())).slice(0, 9);
  let songId = songInfo.title.trim() + "-" + songInfo.artist.trim();
  songId = songId.replace(/ /gi, "-").replace(/[^a-z0-9-]/gi, "") + "-" + randomId;
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
        reject();
      });
  });
}

export function getSongList() {
  return new Promise((resolve, reject) => {
    songsCollection.get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
      });
      resolve(querySnapshot);
    });
  });
}
