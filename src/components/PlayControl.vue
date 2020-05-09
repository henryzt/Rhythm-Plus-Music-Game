<template>
  <div class="control">
    <a @click="$parent.showControl = !$parent.showControl">Toggle Control</a> |
    <a @click="startDemo(1)">Demo 1</a> |
    <a @click="startDemo(2)">2</a> |
    <a @click="startDemo(3)">3</a> |
    <a
      @click="toggleVisualizer"
    >{{$parent.visualizerInstance?$parent.visualizerInstance.currentVisualizer:''}}</a>
    <div v-show="$parent.showControl">
      <br />
      <audio ref="audioElement" :src="$parent.currentSong" volume="0.5" controls preload="auto"></audio>
      <div id="mode">{{$parent.playMode ? "Play Mode" : "Create Mode"}}</div>
      <br />
      <div id="speed">
        Speed
        <input v-model="$parent.noteSpeedInSec" placeholder="Speed" type="number" />
      </div>
      <!-- select song -->
      <div>
        <select id="song" v-model="$parent.currentSong">
          <option disabled value>Please select song to play</option>
          <option value="songs/myblood.mp3">My Blood - 21P</option>
          <option value="songs/police.mp3">Karma Police - RH</option>
          <option value="songs/nanana.mp3">NANANA - MCR</option>
          <option value="songs/sheepdog.mp3">Sheepdog MTV - MD</option>
          <option value="songs/whywelose.mp3">Why We Lose - CT</option>
        </select>
      </div>
      <br />
      <!-- load song -->
      <div>
        <input v-model="loadFrom" placeholder="enter local saves" />
        <button @click="$parent.instance.loadTimeArrFromLocal(loadFrom)">Load</button>
      </div>
      <div>
        <select id="loadFromDemo" v-model="currentDemoNotes">
          <option disabled value>Or select demo note</option>
          <option v-for="option in demoList" :value="option" :key="option">{{option}}</option>
        </select>
        <button @click="$parent.instance.loadTimeArrFromDemo(currentDemoNotes)">Load</button>
      </div>
      <br />
      <!-- save song -->
      <div>
        <input v-model="saveTo" placeholder="enter name to save" />
        <button @click="$parent.instance.saveCurrentTimeArrToLocal(saveTo)">Save</button>
      </div>
      <br />
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
      <button @click="$parent.instance.playGame()">Start</button>
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
import { demo, startDemo } from "../javascript/demo";

export default {
  name: 'PlayControl',
  props: [],
  data: function(){
    return {
        loadFrom: "",
        saveTo: "",
        demoList: Object.keys(demo),
        currentDemoNotes: "",
        youtubeId: "",
    }
  },
  methods: {
    toggleVisualizer() {
      this.$parent.visualizerInstance.switchNextVisualizer()
    },
    startDemo(num){
      startDemo(this.$parent.instance, num)
    }
  }
};
</script>

<style scoped>
</style>
