<template>
        <div class="control">
        <a onclick="toggleControl()">Toggle Control</a> | <a onclick="startDemo1()">Demo 1</a> |
        <a onclick="startDemo2()">Demo 2</a> |
        <a onclick="toggleVisualizer()">{{$parent.visualizerArr[$parent.visualizer]}}</a>
        <div :class="{hidden: !$parent.showControl}" style="transition: opacity 1s ease-in-out;">
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
              <option disabled value="">Please select song to play</option>
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
            <input v-model="$parent.loadFrom" placeholder="enter local saves" />
            <button onclick="loadFromLocal(app.loadFrom)">Load</button>
          </div>
          <div>
            <select id="loadFromDemo" v-model="$parent.currentDemoNotes">
              <option disabled value="">Or select demo note</option>
              <option v-for="option in $parent.demoList" :value="option">{{option}}</option>
            </select>
            <button onclick="loadFromDemo(app.currentDemoNotes)">Load</button>
          </div>
          <br />
          <!-- save song -->
          <div>
            <input v-model="$parent.saveTo" placeholder="enter name to save" />
            <button onclick="saveToLocal(app.saveTo)">Save</button>
          </div>
          <br />
          Current Mode {{$parent.srcMode}}<br>
          <button @click="$parent.srcMode='youtube'">Youtube Mode</button>
          <button @click="$parent.srcMode='url'">URL Mode</button>
          <button onclick="playVideo()">Play Youtube</button>
          <br /><br />
          <button onclick="playGame()">Start</button>
          <button onclick="resetPlaying()">Reset</button>
          <!-- score -->
          <br />
          <div>
            score - {{$parent.score}} | combo - {{$parent.combo}} | max combo - {{$parent.maxCombo}}<br />
            perfect - {{$parent.marks.perfect}} | good - {{$parent.marks.good}} | offbeat - {{$parent.marks.offbeat}} | miss
            - {{$parent.marks.miss}}
          </div>
        </div>
      </div>
</template>

<script>
console.log("OK")
export default {
  name: 'PlayControl',
  props: {
    msg: String,
  },
  data() {
    return {
      count: 0,
    };
  },
};
</script>

<style scoped>

</style>