export default class YoutubePlayer {
  constructor(vm) {
    this.vm = vm;
    this.ytPlayer = vm.ytPlayer;
  }

  loadYoutubeVideo(id) {
    if (this.vm.srcMode !== "youtube" || !this.ytPlayer) return;
    this.vm.youtubeId = id;
    this.ytPlayer.setVolume(100);
    if (!this.vm.playMode) {
      setTimeout(() => {
        this.ytPlayer.playVideo();
      }, 1000);
    }
  }

  playVideo() {
    if (this.vm.srcMode !== "youtube" || !this.ytPlayer) return;
    this.ytPlayer.setVolume(100);
    this.ytPlayer.playVideo();
  }

  pauseVideo() {
    if (this.vm.srcMode !== "youtube" || !this.ytPlayer) return;
    this.ytPlayer.pauseVideo();
  }

  resetVideo(time) {
    if (this.vm.srcMode !== "youtube" || !this.ytPlayer) return;
    this.ytPlayer.seekTo(time ?? 0);
    this.ytPlayer.pauseVideo();
  }

  getPlayerTime() {
    if (this.vm.srcMode !== "youtube" || !this.ytPlayer) return 0;
    return this.ytPlayer.getCurrentTime();
  }
}
