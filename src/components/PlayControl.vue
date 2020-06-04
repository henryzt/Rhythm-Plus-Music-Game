<template>
  <div class="control">
    <div class="text">
      Visualizer
      <br />
      <select
        id="songSelect"
        @change="toggleVisualizer($event.target.value)"
        v-if="playData.visualizerInstance"
        :value="playData.visualizerInstance.currentVisualizer"
      >
        <option
          v-for="visualizer in playData.visualizerInstance.visualizerArr"
          :value="visualizer"
          :key="visualizer"
        >{{visualizer}}</option>
      </select>
    </div>

    <br />

    <div class="text">
      Note Speed
      <br />
      <input v-model="playData.noteSpeedInSec" placeholder="Speed" type="number" />
    </div>

    <br />

    <label class="cb_container">
      Vibration
      <input type="checkbox" v-model="playData.vibrate" />
      <span class="checkmark"></span>
    </label>

    <label class="cb_container">
      Blur Background
      <input type="checkbox" v-model="playData.visualizerInstance.blur" />
      <span class="checkmark"></span>
    </label>

    <label class="cb_container">
      3D Perspective
      <input type="checkbox" v-model="playData.perspective" />
      <span class="checkmark"></span>
    </label>

    <!-- create mode only -->
    <div v-if="!playData.playMode">
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
      <br />
      <br />
      <!-- load youtube -->
      <div>
        <input v-model="youtubeId" placeholder="enter youtube id" />
        <button @click="playData.instance.loadYoutubeVideo(youtubeId)">Load</button>
      </div>
      <br />
      <div id="mode">{{playData.playMode ? "Play Mode" : "Create Mode"}}</div>
      <br />
      <!-- score -->
      <div>
        score - {{playData.result.score}} | combo - {{playData.result.combo}} | max combo - {{playData.result.maxCombo}}
        <br />
        perfect - {{playData.result.marks.perfect}} | good - {{playData.result.marks.good}} | offbeat - {{playData.result.marks.offbeat}} | miss
        - {{playData.result.marks.miss}}
      </div>
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
.text {
  text-align: left;
  margin: auto;
  width: 240px;
}
</style>
