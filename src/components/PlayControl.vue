<template>
  <div class="control">
    <a @click="$parent.showControl = !$parent.showControl">Toggle Control</a> |
    <a
      @click="toggleVisualizer"
    >{{$parent.visualizerInstance?$parent.visualizerInstance.currentVisualizer:''}}</a>
    <div v-show="$parent.showControl">
      <br />
      <button @click="$parent.audio.play()">Play</button>
      <button @click="$parent.audio.pause()">Pause</button>
      <br />
      <div id="mode">{{$parent.playMode ? "Play Mode" : "Create Mode"}}</div>
      <br />
      <div id="speed">
        Speed
        <input v-model="$parent.noteSpeedInSec" placeholder="Speed" type="number" />
      </div>
      <!-- load youtube -->
      <div>
        <input v-model="youtubeId" placeholder="enter youtube id" />
        <button @click="$parent.instance.loadYoutubeVideo(youtubeId)">Load</button>
      </div>
      <br />
      <!-- 3d -->
      <input type="checkbox" id="3d" name="3d" value="3d" v-model="$parent.perspective" />
      <label for="3d">3D Perspective</label>
      <input type="checkbox" id="vibrate" name="vibrate" value="vibrate" v-model="$parent.vibrate" />
      <label for="vibrate">Vibration</label>
      <br />
      <br />
      Current Mode - {{$parent.srcMode}}
      <br />
      <button @click="$parent.srcMode='youtube'">Youtube Mode</button>
      <button @click="$parent.srcMode='url'">URL Mode</button>
      <button @click="$parent.instance.playVideo()">Play Youtube</button>
      <br />
      <br />
      <button @click="$parent.instance.startSong()">Start</button>
      <button @click="$parent.instance.resetPlaying(true)">Reset</button>
      <!-- score -->
      <br />
      <div>
        score - {{$parent.score}} | combo - {{$parent.combo}} | max combo - {{$parent.maxCombo}}
        <br />
        perfect - {{$parent.marks.perfect}} | good - {{$parent.marks.good}} | offbeat - {{$parent.marks.offbeat}} | miss
        - {{$parent.marks.miss}}
      </div>
    </div>
  </div>
</template>

<script>


export default {
  name: 'PlayControl',
  props: [],
  data: function(){
    return {
        youtubeId: "",
    }
  },
  methods: {
    toggleVisualizer() {
      this.$parent.visualizerInstance.switchNextVisualizer()
    }
  }
};
</script>

<style scoped>
</style>
