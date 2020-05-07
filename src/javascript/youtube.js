export default class YoutubePlayer {
  constructor(ytPlayer) {
    this.ytPlayer = ytPlayer;
  }

  loadYoutubeVideo(id) {
    this.ytPlayer.loadVideoByUrl(id, 0);
    this.ytPlayer.setVolume(100);
  }

  playVideo() {
    this.ytPlayer.playVideo();
  }

  resetVideo() {
    this.ytPlayer.seekTo(0);
    this.ytPlayer.pauseVideo();
  }

  getPlayerTime() {
    return this.ytPlayer.getCurrentTime();
  }
}
