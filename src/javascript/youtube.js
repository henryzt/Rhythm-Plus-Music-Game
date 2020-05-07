export default class YoutubePlayer {
  constructor(vm) {
    this.vm = vm;
    this.ytPlayer = vm.ytPlayer;
  }

  loadYoutubeVideo(id) {
    if (this.vm.srcMode !== "youtube") return;
    this.vm.youtubeId = id;
    this.ytPlayer.setVolume(100);
  }

  playVideo() {
    console.log(this.ytPlayer);
    if (this.vm.srcMode !== "youtube") return;
    this.ytPlayer.playVideo();
  }

  resetVideo() {
    if (this.vm.srcMode !== "youtube") return;
    this.ytPlayer.seekTo(0);
    this.ytPlayer.pauseVideo();
  }

  getPlayerTime() {
    if (this.vm.srcMode !== "youtube") return 0;
    return this.ytPlayer.getCurrentTime();
  }
}
