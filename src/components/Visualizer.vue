<template>
  <div class="visualizer" v-if="audioDataLoaded && vComponent">
    <div class="blurFilter" v-if="blur"></div>
    <component ref="visualizerIns" :is="vComponent" :name="vComponent" :audioData="audioData"></component>
  </div>
</template>


<script>
import BarVisualizer from '../visualizers/BarVisualizer.vue';
import SpaceVisualizer from '../visualizers/SpaceVisualizer.vue';

// visualizers
const visualizerArr = [
  "Visualizer Off",
  "Space Visualizer",
  "Bar Visualizer",
  "Space with Polygon",
  "Space Blurred",
  "Blurred",
];


export default {
  name: 'Visualizer',
  props: ["autoUpdate", "setVisualizerNo", "blur"],
  components:{
      'bar' : BarVisualizer,
      'space' : SpaceVisualizer,
      'spacePoly' : SpaceVisualizer
  },
  data: function(){
    return {
        visualizer: 2,
        vComponent: 'space',
        visualizerArr,
        audioDataLoaded: false,
        destroyed: false
    }
  },
  mounted() {
        window.addEventListener("resize", this.resizeCanvas, false);
        window.addEventListener("orientationchange",this.resizeCanvas,false);
        if(this.autoUpdate)
            this.update();
        if(this.setVisualizerNo)
            this.visualizer = this.setVisualizerNo;
    },
    beforeDestroy(){
        window.removeEventListener("resize", this.resizeCanvas);
        window.removeEventListener("orientationchange",this.resizeCanvas);
        this.audioDataLoaded = false
        this.destroyed = true
    },
  methods: {
    renderVisualizer() {
        if (!this.audioDataLoaded) return;
        this.$refs.visualizerIns.update()
    },
    switchNextVisualizer(){
        this.visualizer = this.visualizer == this.visualizerArr.length - 1 ? 0 : this.visualizer + 1;
    },
    update() {
        if(!this.autoUpdate || this.destroyed) return;
        if(!this.audioDataLoaded) console.warn("not loaded")
        requestAnimationFrame(this.update.bind(this));
        this.renderVisualizer();
    },
    resizeCanvas(){
        if (!this.audioDataLoaded) return;
        this.$refs.visualizerIns.resizeCanvas()
    }
  },
    watch : {
        audioData: () => {
            // required to watch vuex change
        },
        setVisualizerNo: function(){
            this.visualizer = this.setVisualizerNo;
        }
    },
    computed:{
        currentVisualizer() {
            return this.visualizerArr[this.visualizer]
        },
        audioData() {
            let data = this.$store.state.audio.audioData;
            if(!this.visualizerLoaded && data.analyser)
                this.audioDataLoaded = true
            return data;
        }
    }
};
</script>

<style scoped>
</style>
