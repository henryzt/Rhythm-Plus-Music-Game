<template>
  <div class="visualizer" v-if="audioDataLoaded && vComponent">
    <div class="blurFilter" v-if="blur"></div>
    <component ref="visualizerIns" :is="vComponent" :name="vComponent" :audioData="audioData"></component>
  </div>
</template>


<script>
import BarVisualizer from '../visualizers/BarVisualizer.vue';
import SpaceVisualizer from '../visualizers/SpaceVisualizer.vue';


const visualizers = {
  "Visualizer Off" : null,
  "Space Visualizer" : "space",
  "Bar Visualizer" : "bar",
  "Space with Polygon" : "spacePoly",
};

export default {
  name: 'Visualizer',
  props: ["autoUpdate", "setVisualizer", "setBlur"],
  components:{
      'bar' : BarVisualizer,
      'space' : SpaceVisualizer,
      'spacePoly' : SpaceVisualizer
  },
  data: function(){
    return {
        visualizerArr: Object.keys(visualizers),
        vComponent: 'space',
        blur: false,
        audioDataLoaded: false,
        destroyed: false
    }
  },
  mounted() {
        window.addEventListener("resize", this.resizeCanvas, false);
        window.addEventListener("orientationchange",this.resizeCanvas,false);
        if(this.autoUpdate)
            this.update();
        if(this.setVisualizer)
            this.vComponent = this.setVisualizer;
        if(this.setBlur)
            this.blur = this.setBlur;
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
    setVisualizerByKey(name){
        this.vComponent = visualizers[name];
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
        setVisualizer: () => {
            this.vComponent = this.setVisualizer;
        },
        setBlur: () => {
            this.blur = this.setBlur;
        }
    },
    computed:{
        currentVisualizer() {
            return Object.keys(visualizers).find(key => visualizers[key] === this.vComponent);
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
