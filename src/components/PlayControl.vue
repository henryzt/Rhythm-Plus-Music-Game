<template>
  <div class="control">
    <select
      id="songSelect"
      @change="toggleVisualizer($event.target.value)"
      v-if="playData.visualizerInstance"
      :value="playData.visualizerInstance.currentVisualizer"
      style="width:200px"
    >
      <option
        v-for="visualizer in playData.visualizerInstance.visualizerArr"
        :value="visualizer"
        :key="visualizer"
      >{{visualizer}}</option>
    </select>
    <input
      type="checkbox"
      id="blur"
      name="blur"
      value="blur"
      v-model="playData.visualizerInstance.blur"
    />
    <label for="blur">Blur</label>
    <br />
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
      score - {{playData.result.score}} | combo - {{playData.result.combo}} | max combo - {{playData.result.maxCombo}}
      <br />
      perfect - {{playData.result.marks.perfect}} | good - {{playData.result.marks.good}} | offbeat - {{playData.result.marks.offbeat}} | miss
      - {{playData.result.marks.miss}}
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
    toggleVisualizer(name) {
      this.playData.visualizerInstance.setVisualizerByKey(name)
    }
  }
};
</script>

<style scoped>
</style>
