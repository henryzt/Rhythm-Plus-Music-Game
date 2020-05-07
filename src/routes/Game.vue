<template>
   <div class="game">
      <PlayControl ref="control"></PlayControl>

      <div class="center" ref="hitIndicator">
        {{lastMark}} {{combo>=5?combo:''}}
      </div>

      <canvas ref="mainCanvas"></canvas>

      <!-- visualizer space -->
      <div class="visualizer">
        <div class="blurFilter" v-if="visualizer==4"></div>
        <div ref="visualizerSpace" id="visualizer"></div>
      </div>

      <div id="ytPlayer" v-show="srcMode=='youtube'"></div>
    </div>
</template>

<script>
import PlayControl from '../components/PlayControl.vue';
import GameInstance from '../javascript/gameInstance';
import { demo, startDemo1, startDemo2 } from "../javascript/demo";


// visualizers
const visualizerArr = [
  "Visualizer Off",
  "Space Visualizer",
  "Bar Visualizer",
  "Space with Polygon",
  "Space Blurred",
];


export default {
    name: 'Game',
    components: {
        PlayControl,
    },
    data(){
        return {
            audio: null,
            canvas: null,
            ctx: null,
            checkHitLineY: null, // hit line postion (white line)
            noteSpeedPxPerSec: null, // note speed
            visualizerLoaded: false, // visualizer loaded indicator
            playMode: false, // play or edit mode
            noteSpeedInSec: 2,
            currentSong: "",
            loadFrom: "",
            saveTo: "",
            score: 0,
            combo: 0,
            maxCombo: 0,
            marks: { perfect: 0, good: 0, offbeat: 0, miss: 0 },
            lastMark: "",
            demoList: Object.keys(demo),
            currentDemoNotes: "",
            showControl: false,
            visualizer: 2,
            visualizerArr,
            srcMode: "url",
            instance: null
        }
    },
    computed: {
        mode() {
            return this.playMode ? "Play Mode" : "Create Mode";
        },
    },
    watch: {
        currentSong: function() {
            this.audio.load();
        },
        noteSpeedInSec: function() {
            this.instance.reposition();
        }
    },
    mounted() {
        this.canvas = this.$refs.mainCanvas;
        this.ctx = this.canvas.getContext("2d");
        // const { canvas } = app;
        // const ctx = app.canvasCtx;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // get audio element
        this.audio = this.$refs.control.$refs.audioElement;
        // let { audio } = app;

        this.instance = new GameInstance(this);

    },
    methods:{
        startDemo(num){
            if(num===1)
                startDemo1(this.instance)
            if(num===2)
                startDemo2(this.instance)
        }
    }
};
</script>

<style>
</style>
