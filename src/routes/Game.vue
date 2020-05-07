<template>
   <div class="game">
      <PlayControl ref="control"></PlayControl>

      <div class="center" ref="hitIndicator">
        {{markJudge}} {{combo>=5?combo:''}}
      </div>

      <canvas ref="mainCanvas"></canvas>

      <!-- visualizer space -->
      <div class="visualizer">
        <div class="blurFilter" v-if="visualizer==4"></div>
        <div ref="visualizerSpace" id="visualizer"></div>
      </div>

    <div v-show="srcMode==='youtube'">
        <Youtube id="ytPlayer" ref="youtube" :video-id="youtubeId" :player-vars="{controls: 0, rel: 0 }"></Youtube>
    </div>
      
    </div>
</template>

<script>
import PlayControl from '../components/PlayControl.vue';
import GameInstance from '../javascript/gameInstance';
import { Youtube } from 'vue-youtube'


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
        Youtube
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
            score: 0,
            combo: 0,
            maxCombo: 0,
            marks: { perfect: 0, good: 0, offbeat: 0, miss: 0 },
            markJudge: "",
            showControl: false,
            visualizer: 2,
            visualizerArr,
            srcMode: "youtube",
            instance: null,
            youtubeId: "ALZHF5UqnU4"
        }
    },
    computed: {
        mode() {
            return this.playMode ? "Play Mode" : "Create Mode";
        },
        ytPlayer() {
            return this.$refs.youtube.player;
        }
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
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // get audio element
        this.audio = this.$refs.control.$refs.audioElement;

        this.instance = new GameInstance(this);

    },
    methods:{

    }
};
</script>

<style>
</style>
