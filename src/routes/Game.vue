<template>
  <div class="game">
    <PlayControl ref="control"></PlayControl>

    <div class="center" ref="hitIndicator">{{markJudge}} {{combo>=5?combo:''}}</div>

    <div></div>
    <div class="gameWrapper">
      <canvas ref="mainCanvas" id="gameCanvas" :class="{perspective}"></canvas>
    </div>

    <Visualizer ref="visualizer"></Visualizer>

    <div v-show="srcMode==='youtube'">
      <Youtube
        id="ytPlayer"
        ref="youtube"
        :video-id="youtubeId"
        :player-vars="{controls: 0, rel: 0, playsinline: 1 }"
        @playing="songLoaded"
        @cued="videoCued"
      ></Youtube>
    </div>
    <Loading :show="instance && instance.loading"></Loading>
  </div>
</template>

<script>
import PlayControl from '../components/PlayControl.vue';
import Visualizer from '../components/Visualizer.vue';
import Loading from '../components/Loading.vue';
import GameInstance from '../javascript/gameInstance';
import { Youtube } from 'vue-youtube'
import { getSheet } from "../javascript/db"

export default {
    name: 'Game',
    components: {
        PlayControl,
        Visualizer,
        Youtube,
        Loading
    },
    data(){
        return {
            audio: null,
            canvas: null,
            ctx: null,
            checkHitLineY: null, // hit line postion (white line)
            noteSpeedPxPerSec: null, // note speed
            playMode: false, // play or edit mode
            noteSpeedInSec: 2,
            currentSong: "",
            score: 0,
            combo: 0,
            maxCombo: 0,
            marks: { perfect: 0, good: 0, offbeat: 0, miss: 0 },
            markJudge: "",
            showControl: false,
            srcMode: "url",
            instance: null,
            visualizerInstance: null,
            youtubeId: "jNQXAC9IVRw",
            perspective: false,
            vibrate: true,
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
            if(this.srcMode === "url")
                this.audio.loadSong(this.currentSong, false, this.songLoaded);
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
        this.visualizerInstance = this.$refs.visualizer;
        // get audio element
        this.audio = this.$store.state.audio;

        this.instance = new GameInstance(this);

        //FIXME add id and route validation
        if(this.$route.params.sheet && this.$route.params.sheet!="null"){
          this.instance.loading = true
          this.playWithId()
        }

    },
    destroyed(){
        this.instance.destroyInstance()
    },
    methods:{
      async playWithId(){
        let song = await getSheet(this.$route.params.sheet);
        this.instance.loadSong(song);
      },
      songLoaded(){
        if(this.instance.loading == true)
          this.instance.startSong()
        this.instance.loading = false;
      },
      videoCued(){
        this.ytPlayer.playVideo();
      }
    }
};
</script>

<style scoped>
* {
  overflow: hidden;
}
.gameWrapper {
  perspective: 600px;
}

#gameCanvas {
  transition: 2s;
}

.perspective {
  transform: rotateX(30deg) scaleY(1.5);
  transform-origin: 50% 100%;
}

@media only screen and (min-width: 800px) {
  .perspective {
    transform: rotateX(30deg) scale(1.5);
  }
}
</style>
