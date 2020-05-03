var ytPlayer;
function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player("ytPlayer", {
    height: "100%",
    width: "100%",
    videoId: "egG7fiE89IU",
    playerVars: { autoplay: 1, controls: 0, rel: 0 },
    events: {
      onReady: onPlayerReady,
    },
  });
  addWmode();
}

function onPlayerReady(event) {
  event.target.playVideo();
}

function addWmode() {
  let url = document.getElementById("ytPlayer").getAttribute("src");
  let char = url.indexOf("?") != -1 ? "&" : "?";
  document.getElementById("ytPlayer").setAttribute("src", url + char + "wmode=transparent");
}
