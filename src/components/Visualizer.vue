<template>
  <div class="visualizer">
    <!-- visualizer space -->
    <div class="blurFilter" v-if="visualizer===4"></div>
    <canvas ref="visualizerCanvas" v-show="visualizer===2"></canvas>
    <div ref="visualizerSpace" id="visualizer" v-show="visualizer!=0 && visualizer!=2"></div>
  </div>
</template>


<script>
import renderBarVisualizer from '../visualizers/visualizerBar';
import fixAudioContext from '../helpers/fixAudioContext';
import { initSpaceVisualizer, renderSpaceVisualizer } from '../visualizers/visualizerSpace';

// visualizers
const visualizerArr = [
  "Visualizer Off",
  "Space Visualizer",
  "Bar Visualizer",
  "Space with Polygon",
  "Space Blurred",
];


export default {
  name: 'Visualizer',
  props: ["audio", "autoUpdate", "setVisualizerNo"],
  data: function(){
    return {
        audioData:{
            audioCtx: null,
            src: null,
            analyser: null,
            bufferLength: null,
            dataArray: null
        },
        visualizer: 2,
        visualizerArr,
        visualizerLoaded: false, // visualizer loaded indicator
        canvas: null,
        ctx: null
    }
  },
  mounted() {
        this.canvas = this.$refs.visualizerCanvas;
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if(this.autoUpdate)
            this.update();
        if(this.setVisualizerNo)
            this.visualizer = this.setVisualizerNo;
    },
  methods: {
    initVisualizerData() {
        this.audio.crossOrigin = "anonymous"
        let audioCtx = new (window.AudioContext || window.webkitAudioContext);
        this.audioData.src = audioCtx.createMediaElementSource(this.audio);
        let analyser = audioCtx.createAnalyser();
        
        this.audioData.src.connect(analyser);
        analyser.connect(audioCtx.destination);
        // this.audioData.src.connect(audioCtx.destination);

        analyser.fftSize = 256;

        this.audioData.bufferLength = analyser.frequencyBinCount;

        this.audioData.dataArray = new Uint8Array(this.audioData.bufferLength);

        this.audioData.audioCtx = audioCtx;
        this.audioData.analyser = analyser;
        fixAudioContext(audioCtx);
    },
    initAllVisualizersIfRequried() {
        if (!this.audioData.audioCtx && !this.visualizerLoaded) {
            this.initVisualizerData();
            initSpaceVisualizer(this.audioData, this.$refs.visualizerSpace);
            this.visualizerLoaded = true;
        }
    },
    renderVisualizer() {
        if (!this.visualizerLoaded) return;
        switch (this.visualizer) {
        case 1:
            renderSpaceVisualizer();
            break;
        case 2:
            this.ctx.fillStyle = "rgba(10,10,44,0.2)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            renderBarVisualizer(this.canvas, this.ctx, this.audioData);
            break;
        case 3:
            renderSpaceVisualizer(true);
            break;
        case 4:
            renderSpaceVisualizer(true);
            break;
        default:
            this.ctx.fillStyle = "black";
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    },
    switchNextVisualizer(){
        this.visualizer = this.visualizer == this.visualizerArr.length - 1 ? 0 : this.visualizer + 1;
    },
    update() {
        if(!this.autoUpdate) return;
        requestAnimationFrame(this.update.bind(this));
        this.renderVisualizer();
    }
  },
    watch : {
        audio: function(){
            this.initAllVisualizersIfRequried()
        },
        setVisualizerNo: function(){
            this.visualizer = this.setVisualizerNo;
        }
    },
    computed:{
        currentVisualizer: function(){
            return this.visualizerArr[this.visualizer]
        }
    }
};
</script>

<style scoped>
</style>