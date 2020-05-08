<template>
   <div>
        <audio ref="audioElement" src="songs/opening.mp3" autoplay preload="auto"></audio>

        <div class="center_logo">
            <img src="assets/logo.png" style="max-width: 500px; padding: 50px;"/>
        </div>

        <Visualizer ref="visualizer" :audio="audio" :setVisualizerNo="1" :autoUpdate="true"></Visualizer>
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

<style scoped>
    .center_logo{
        text-align: center;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%)
    }

</style>
