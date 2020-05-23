<template>
  <div class="game">
    <!-- pause button -->
    <transition name="modal-fade">
      <a class="pause_button" @click="pauseGame" v-if="started && (instance && !instance.paused)">
        <v-icon name="regular/pause-circle" scale="1.5" />
      </a>
    </transition>

    <!-- mark indicator -->
    <div class="center" ref="hitIndicator">{{markJudge}} {{combo>=5?combo:''}}</div>

    <!-- game canvas -->
    <transition name="modal-fade">
      <div class="gameWrapper" v-show="!hideGameForYtButton">
        <canvas ref="mainCanvas" id="gameCanvas" :class="{perspective}"></canvas>
      </div>
    </transition>

    <!-- visualizer canvas -->
    <Visualizer ref="visualizer" v-show="!hideGameForYtButton"></Visualizer>

    <!-- youtube player -->
    <div v-show="srcMode==='youtube'">
      <Youtube
        id="ytPlayer"
        ref="youtube"
        :video-id="youtubeId"
        :player-vars="{controls: 0, rel: 0, playsinline: 1, disablekb: 1 }"
        @playing="songLoaded"
        @cued="videoCued"
        @buffering="ytBuffering"
        @error="ytError"
        @paused="ytPaused"
      ></Youtube>
    </div>

    <!-- play button -->
    <transition name="modal-fade">
      <div
        class="modal-backdrop"
        @click="startGame"
        :class="{'no-events':hideGameForYtButton}"
        v-if="showStartButton"
      >
        <div class="modal blurBackground" :class="{'darker':hideGameForYtButton}">
          <div class="modal-body">
            <v-icon name="play" scale="1.5" />Play
          </div>
        </div>
      </div>
    </transition>

    <!-- loading popup -->
    <Loading style="z-index:200" :show="instance && instance.loading">Song Loading...</Loading>

    <!-- pause menu modal -->
    <Modal ref="menu" :hideFooter="true" style="text-align:center;z-index:1000">
      <template v-slot:header>
        <div style="width:100%;font-size:23px">Pause Menu</div>
      </template>

      <template>
        <transition name="slide-fade" mode="out-in">
          <div v-if="!advancedMenuOptions" key="1">
            <div class="btn-action" @click="resumeGame">Resume</div>
            <div class="btn-action" @click="restartGame">Restart</div>
            <div class="btn-action" @click="advancedMenuOptions=true">Advanced</div>
            <div class="btn-action" @click="exitGame">Exit Game</div>
          </div>

          <div v-else key="2">
            <PlayControl :playData="$data"></PlayControl>
            <br />
            <hr />
            <div
              class="btn-action"
              style="display:inline-block"
              @click="advancedMenuOptions=false"
            >Back</div>
            <div class="btn-action" style="display:inline-block" @click="resumeGame">Done</div>
          </div>
        </transition>
      </template>
    </Modal>
  </div>
</template>

<script>
import PlayControl from '../components/PlayControl.vue';
import Visualizer from '../components/Visualizer.vue';
import Loading from '../components/Loading.vue';
import Modal from '../components/Modal.vue';
import GameInstance from '../javascript/gameInstance';
import { Youtube } from 'vue-youtube'
import { getSheet } from "../javascript/db"
import 'vue-awesome/icons/regular/pause-circle'
import 'vue-awesome/icons/play'

export default {
    name: 'Game',
    components: {
        PlayControl,
        Visualizer,
        Youtube,
        Loading,
        Modal
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
            advancedMenuOptions: false,
            started: false,
            showStartButton: false
        }
    },
    computed: {
        mode() {
          return this.playMode ? "Play Mode" : "Create Mode";
        },
        ytPlayer() {
          return this.$refs.youtube.player;
        },
        hideGameForYtButton(){
          return this.srcMode==='youtube' && this.showStartButton;
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

        window.addEventListener("blur", this.pauseGame);

    },
    destroyed(){
        window.removeEventListener("blur", this.pauseGame);
        this.instance.destroyInstance()
    },
    methods:{
      async playWithId(){
        let song = await getSheet(this.$route.params.sheet);
        this.instance.loadSong(song);
      },
      songLoaded(){
        console.log("playing")
        this.instance.loading = false
        if(!this.started){
          // first loaded
          this.showStartButton = true
          if(this.srcMode !== "youtube") return
          this.ytPlayer.setVolume(0)
          this.instance.startSong()
          this.showStartButton = false
        }else{
          this.resumeGame()
        }
      },
      videoCued(){
        if(this.srcMode !== "youtube") return
        console.log("cued")
        this.instance.loading = false
        this.showStartButton = true
      },
      ytBuffering(){
        console.log("buffering")
        if(this.showStartButton){
          this.startGame()
        }
      },
      ytPaused(){
        console.log("pasued")
        if(this.started)
          this.pauseGame()
      },
      ytError(){
        console.error("youtube error")
      },
      startGame(){
        this.showStartButton = false
        if(this.srcMode === "youtube"){
          this.instance.loading = true
          this.ytPlayer.playVideo();
          this.ytPlayer.setVolume(0);
        }else{
          this.instance.startSong()
        }
      },
      pauseGame(){
        if(!this.started) return;
        this.instance.pauseGame()
        this.$refs.menu.show()
      },
      hideMenu(){
        this.advancedMenuOptions=false;
        this.$refs.menu.close()
      },
      resumeGame(){
        this.hideMenu()
        this.instance.resumeGame()
      },
      restartGame(){
        this.hideMenu()
        this.instance.paused = false
        this.instance.resetPlaying()
        this.instance.startSong()
      },
      exitGame(){
        this.hideMenu()
        this.$router.push('/menu')
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

.game {
  position: fixed;
  top: 0;
  left: 0;
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

.modal-body {
  display: felx;
  padding: 30px;
}

.modal {
  transition: 0;
  animation: none;
  width: auto;
}

.darker {
  backdrop-filter: blur(50px);
  -webkit-backdrop-filter: blur(50px);
}

.no-events {
  pointer-events: none;
}

.btn-action {
  max-width: 200px;
  margin: 10px auto;
  background: rgba(78, 78, 78, 0.192);
}

.btn-action:hover {
  background: rgb(255, 255, 255);
}

.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: scaleX(0.1);
  opacity: 0;
}
</style>
