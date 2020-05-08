<template>
   <div>
        <audio ref="audioElement" src="songs/whywelose.mp3" volume="0.5" controls preload="auto"></audio>

        <Visualizer ref="visualizer" :audio="audio" :setVisualizerNo="2" :autoUpdate="true"></Visualizer>
    </div>
</template>

<script>
import Visualizer from '../components/Visualizer.vue';



export default {
    name: 'Home',
    components: {
        Visualizer,
    },
    data(){
        return {
            audio: null
        }
    },
    computed: {

    },
    watch: {

    },
    mounted() {
        this.audio = this.$refs.audioElement;
        this.audio.load();

    },
    methods:{

    }
};
</script>

<style>
</style>
