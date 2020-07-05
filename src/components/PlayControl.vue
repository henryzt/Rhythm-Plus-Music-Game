<template>
  <div class="control">
    <div class="text" v-if="playData.srcMode==='url' && playData.visualizerInstance">
      Visualizer
      <br />
      <select
        id="songSelect"
        @change="toggleVisualizer($event.target.value)"
        :value="playData.visualizerInstance.currentVisualizer"
      >
        <option
          v-for="visualizer in Object.keys($store.state.visualizerArr)"
          :value="visualizer"
          :key="visualizer"
        >{{visualizer}}</option>
      </select>
    </div>

    <br />

    <div class="text">
      Note Speed
      <br />
      <br />
      <vue-slider
        :value="3.01-playData.noteSpeedInSec"
        :interval="0.01"
        :min="0.01"
        :max="3"
        :tooltip-formatter="val => val.toFixed(1)+'x'"
        @change="changeSpeed"
      ></vue-slider>
    </div>

    <br />

    <label class="cb_container">
      Vibration
      <input type="checkbox" v-model="playData.vibrate" />
      <span class="checkmark"></span>
    </label>

    <label class="cb_container">
      Blur Background
      <input type="checkbox" v-model="playData.blur" />
      <span class="checkmark"></span>
    </label>

    <label class="cb_container">
      3D Perspective
      <input type="checkbox" v-model="playData.perspective" />
      <span class="checkmark"></span>
    </label>

    <!-- create mode only -->
    <div v-if="playData.inEditor">
      <br />
      <br />
      <!-- score -->
      <div style="padding:15px">
        score - {{playData.result.score}}
        <br />
        combo - {{playData.result.combo}} | max combo - {{playData.result.maxCombo}}
        <br />
        perfect - {{playData.result.marks.perfect}} | good - {{playData.result.marks.good}} | offbeat - {{playData.result.marks.offbeat}} | miss
        - {{playData.result.marks.miss}}
        <br />
        <br />
        fever level - {{playData.fever.value}} | fever time - {{playData.fever.time}} s | fever up percent - {{playData.fever.percent.toFixed(2)}} |
      </div>
    </div>
  </div>
</template>

<script>
import VueSlider from 'vue-slider-component'


export default {
  name: 'PlayControl',
  props: ["playData"],
  data: function(){
    return {
        youtubeId: "",
    }
  },
  components:{
    VueSlider
  },
  methods: {
    toggleVisualizer(name) {
      this.playData.visualizerInstance.setVisualizerByKey(name)
    },
    changeSpeed(speed){
      this.playData.noteSpeedInSec = 3.01 - speed;
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
