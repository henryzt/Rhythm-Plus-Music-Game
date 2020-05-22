<template>
  <div class="control">
    <a
      @click="toggleVisualizer"
    >{{playData.visualizerInstance?playData.visualizerInstance.currentVisualizer:''}} (Tap to change)</a>
    <br />
    <button @click="playData.audio.play()">Play Audio</button>
    <button @click="playData.audio.pause()">Pause Audio</button>
    <br />
    <div id="mode">{{playData.playMode ? "Play Mode" : "Create Mode"}}</div>
    <br />
    <div id="speed">
      Speed
      <input v-model="playData.noteSpeedInSec" placeholder="Speed" type="number" />
    </div>
    <!-- load youtube -->
    <div>
      <input v-model="youtubeId" placeholder="enter youtube id" />
      <button @click="playData.instance.loadYoutubeVideo(youtubeId)">Load</button>
    </div>
    <br />
    <!-- 3d -->
    <input type="checkbox" id="3d" name="3d" value="3d" v-model="playData.perspective" />
    <label for="3d">3D Perspective</label>
    <input type="checkbox" id="vibrate" name="vibrate" value="vibrate" v-model="playData.vibrate" />
    <label for="vibrate">Vibration</label>
    <br />
    <br />
    Current Mode - {{playData.srcMode}}
    <br />
    <button @click="playData.srcMode='youtube'">Youtube Mode</button>
    <button @click="playData.srcMode='url'">URL Mode</button>
    <button @click="playData.instance.playVideo()">Play Youtube</button>
    <br />
    <br />
    <button @click="playData.instance.startSong()">Start</button>
    <button @click="playData.instance.resetPlaying(true)">Reset</button>
    <!-- score -->
    <br />
    <div>
      score - {{playData.score}} | combo - {{playData.combo}} | max combo - {{playData.maxCombo}}
      <br />
      perfect - {{playData.marks.perfect}} | good - {{playData.marks.good}} | offbeat - {{playData.marks.offbeat}} | miss
      - {{playData.marks.miss}}
    </div>
  </div>
</template>

<script>


export default {
  name: 'PlayControl',
  props: ["playData"],
  data: function(){
    return {
        youtubeId: "",
    }
  },
  methods: {
    toggleVisualizer() {
      this.playData.visualizerInstance.switchNextVisualizer()
    }
  }
};
</script>

<style scoped>
</style>
