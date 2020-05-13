import {
  usersCollection,
  songsCollection,
  sheetsCollection,
} from "../helpers/firebaseConfig";

export function createSong(songInfo) {
  const { title, artist, image, youtubeId, url } = songInfo;
  let randomId = btoa(parseInt(Date.now() * Math.random())).slice(0, 9);
  let songId = songInfo.title + "-" + songInfo.artist;
  songId =
    songId.replace(/ /gi, "-").replace(/[^a-z0-9-]/gi, "") + "-" + randomId;
  console.log(songId);
  songsCollection
    .doc(songId)
    .set({
      title,
      artist,
      image,
      youtubeId,
      url,
    })
    .then(function () {
      console.log("Document successfully written!");
    })
    .catch(function (error) {
      console.error("Error writing document: ", error);
    });
}
