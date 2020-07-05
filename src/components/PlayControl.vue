<template>
  <div class="control" :class="{formStyle, settingStyle}">
    <p v-if="playData.srcMode==='url' && playData.visualizerInstance">
      <label>Visualizer</label>
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
    </p>

    <p>
      <label>Note Speed</label>
      <span>
        <vue-slider
          style="padding:20px 0;"
          :value="3.01-playData.noteSpeedInSec"
          :interval="0.01"
          :min="0.01"
          :max="3"
          :contained="true"
          :tooltip-formatter="val => val.toFixed(1)+'x'"
          @change="changeSpeed"
        ></vue-slider>
      </span>
    </p>

    <p>
      <label></label>
      <Checkbox label="Vibration" :model="playData" modelKey="vibrate" :cbStyle="cbStyle"></Checkbox>
    </p>
    <p>
      <label></label>
      <Checkbox label="Blur Background" :model="playData" modelKey="blur" :cbStyle="cbStyle"></Checkbox>
    </p>
    <p>
      <label></label>
      <Checkbox label="3D Perspective" :model="playData" modelKey="perspective" :cbStyle="cbStyle"></Checkbox>
    </p>

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
import Checkbox from './Checkbox.vue';


export default {
  name: 'PlayControl',
  props: ["playData", "formStyle", "settingStyle"],
  data: function(){
    return {
        youtubeId: "",
    }
  },
  components:{
    VueSlider,
    Checkbox
  },
  methods: {
    toggleVisualizer(name) {
      this.playData.visualizerInstance.setVisualizerByKey(name)
    },
    changeSpeed(speed){
      this.playData.noteSpeedInSec = 3.01 - speed;
    }
  },
  computed:{
    cbStyle(){
      return this.formStyle? 'form' : 'no-bg';
    }
  }
};
</script>

<style scoped>
.control {
  text-align: left;
  margin: auto;
  width: 240px;
}
.formStyle {
  display: table;
  width: 100%;
  vertical-align: middle;
}
.settingStyle p {
  display: table-row;
  width: 100%;
}
.settingStyle label {
  display: table-cell;
  width: 25%;
  text-align: right;
  padding-right: 10px;
  vertical-align: middle;
}
.settingStyle input {
  display: table-cell;
}
</style>
