<template>
    <!-- visualizer space -->
    <div class="visualizer">
        <div class="blurFilter" v-if="$parent.visualizer==4"></div>
        <div ref="visualizerSpace" id="visualizer"></div>
    </div>
</template>

<script>

import {renderBarVisualizer} from '../visualizers/visualizerBar';

export default {
  name: 'Visualizer',
  props: ["audio", "canvas", "ctx"],
  data: function(){
    return {
        audioData:{
            audioCtx: null,
            src: null,
            analyser: null,
            bufferLength: null,
            dataArray: null
        },
        canvas: null,
        ctx: null,
        audio: null
    }
  },
  mounted(){
    //   this.audio = this.$parent.audio;
    //   this.canvas = this.$parent.canvas;
    //   this.ctx = this.$parent.ctx;
    
  },
  methods: {
    initVisualizerData() {
        this.audio.crossOrigin = "anonymous"
        let audioCtx = new AudioContext();
        this.audioData.src = audioCtx.createMediaElementSource(this.audio);
        let analyser = audioCtx.createAnalyser();
        
        this.audioData.src.connect(analyser);
        analyser.connect(audioCtx.destination);

        analyser.fftSize = 256;

        this.audioData.bufferLength = analyser.frequencyBinCount;

        this.audioData.dataArray = new Uint8Array(this.audioData.bufferLength);

        this.audioData.audioCtx = audioCtx;
        this.audioData.analyser = analyser;
    },
    initAllVisualizersIfRequried() {
        console.log("NO")
        if (!this.audioData.audioCtx && !this.$parent.visualizerLoaded) {
            this.initVisualizerData();
            // initSpaceVisualizer();
            this.$parent.visualizerLoaded = true;
        }
    },
    renderVisualizer() {
        if (!this.$parent.visualizerLoaded) return;
        switch (this.$parent.visualizer) {
        case 1:
            // renderSpaceVisualizer();
            break;
        case 2:
            renderBarVisualizer(this.canvas, this.ctx, this.audioData);
            this.ctx.fillStyle = "rgba(10,10,44,0.2)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            break;
        case 3:
            // renderSpaceVisualizer(true);
            break;
        case 4:
            // renderSpaceVisualizer(true);
            break;
        default:
            this.ctx.fillStyle = "black";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
  },
    watch : {
        audio: function(){
            this.initAllVisualizersIfRequried()
        }
    }
};
</script>

<style scoped>

</style>