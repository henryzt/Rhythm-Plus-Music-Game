<template>
  <div class="game">
    <!-- pause button -->
    <transition name="modal-fade">
      <a
        class="pause_button"
        @click="pauseGame"
        v-if="started && (instance && !instance.paused) && !isGameEnded"
      >
        <v-icon name="regular/pause-circle" scale="1.5" />
      </a>
    </transition>

    <!-- mark indicator -->
    <div class="center" ref="hitIndicator">{{markJudge}} {{result.combo>=5?result.combo:''}}</div>

    <!-- game canvas -->
    <div class="gameWrapper" :class="{'no-events':hideGameForYtButton}">
      <canvas ref="mainCanvas" id="gameCanvas" :class="{perspective}"></canvas>
    </div>

    <!-- visualizer canvas -->
    <Visualizer ref="visualizer" v-show="!hideGameForYtButton"></Visualizer>

    <!-- score panel -->
    <div class="score">
      <div style="font-size:0.5em">
        <ICountUp :endVal="percentage" :options="{decimalPlaces:2,duration:1}" />%
      </div>
      <ICountUp :endVal="result.score" :options="{decimalPlaces:0,duration:1}" />
    </div>

    <!-- youtube player -->
    <div v-show="srcMode==='youtube'" v-if="!isGameEnded">
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
        @ended="gameEnded"
      ></Youtube>
    </div>

    <!-- ready screen -->
    <transition name="modal-fade">
      <div class="modal-backdrop" :class="{'no-events':hideGameForYtButton}" v-if="showStartButton">
        <div class="modal blurBackground" :class="{'darker':hideGameForYtButton}" ref="playButton">
          <div class="modal-body">
            <div class="flex_hori" @click="()=>{hideGameForYtButton?()=>{}:startGame()}">
              <v-icon name="play" scale="1.5" />
              <div class="start_button_text">Start</div>
            </div>
          </div>
        </div>
        <!-- todo, option buttons-->
        <!-- <div>
          <div
            class="flex_hori start_page_button"
            @click="advancedMenuOptions=true;$refs.menu.show()"
          >
            <v-icon name="cog" scale="1.5" />
            <div class="start_button_text">Options</div>
          </div>

          <div class="flex_hori start_page_button">
            <v-icon name="info-circle" scale="1.5" />
            <div class="start_button_text">Song Detail</div>
          </div>
        </div>-->
      </div>
    </transition>

    <!-- loading popup -->
    <Loading style="z-index:200" :show="instance && instance.loading">Song Loading...</Loading>
    <Loading style="z-index:500" :show="isGameEnded">Syncing Results...</Loading>

    <!-- pause menu modal -->
    <Modal ref="menu" :hideFooter="true" style="text-align:center;z-index:1000">
      <template v-slot:header>
        <div style="width:100%;font-size:23px">{{advancedMenuOptions?"Options":"Pause Menu"}}</div>
      </template>

      <template>
        <transition name="slide-fade" mode="out-in">
          <div v-if="!advancedMenuOptions" key="1">
            <div class="btn-action btn-dark" @click="resumeGame">Resume</div>
            <div class="btn-action btn-dark" @click="restartGame">Restart</div>
            <div class="btn-action btn-dark" @click="advancedMenuOptions=true">Advanced</div>
            <div class="btn-action btn-dark" @click="exitGame">Exit Game</div>
          </div>

          <div v-else key="2">
            <PlayControl :playData="$data"></PlayControl>
            <br />
            <hr style="opacity:0.2" />
            <div
              class="btn-action btn-dark"
              style="display:inline-block"
              @click="advancedMenuOptions=false"
              v-if="started"
            >Back</div>
            <div
              class="btn-action btn-dark"
              style="display:inline-block"
              @click="started?resumeGame:$refs.menu.close()"
            >Done</div>
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
import { getSheet, uploadResult } from "../javascript/db"
import ICountUp from 'vue-countup-v2';
import 'vue-awesome/icons/regular/pause-circle'
import 'vue-awesome/icons/play'
import 'vue-awesome/icons/cog'
import 'vue-awesome/icons/info-circle'

export default {
    name: 'Game',
    components: {
        PlayControl,
        Visualizer,
        Youtube,
        Loading,
        Modal,
        ICountUp
    },
    data(){
        return {
            audio: null,
            canvas: null,
            ctx: null,
            checkHitLineY: null, // hit line postion (white line)
            noteSpeedInSec: 2,
            noteSpeedPxPerSec: null, // note speed
            playMode: true, // play or edit mode
            currentSong: null,
            result: {
              score: 0,
              totalPercentage: 0,
              totalHitNotes: 0,
              combo: 0,
              maxCombo: 0,
              marks: { perfect: 0, good: 0, offbeat: 0, miss: 0 }
            },
            markJudge: "",
            srcMode: "url",
            instance: null,
            visualizerInstance: null,
            youtubeId: "jNQXAC9IVRw",
            perspective: false,
            vibrate: true,
            advancedMenuOptions: false,
            started: false,
            showStartButton: false,
            isGameEnded: false
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
        },
        percentage(){
          return this.result.totalHitNotes !== 0 ? (this.result.totalPercentage / this.result.totalHitNotes) : 0;
        }
    },
    watch: {
        noteSpeedInSec: function() {
            this.instance.reposition();
        },
        showStartButton(){
          if(this.showStartButton) this.$nextTick(this.addTilt);
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

        if(this.$route.params.sheet){
          this.instance.loading = true
          this.playWithId()
        }else{
          this.$store.state.gModal.show({bodyText:"No song is chosen, tap 'OK' to go to song list.", 
          isError: true, showCancel: false, okCallback: this.exitGame})
        }

        window.addEventListener("blur", this.pauseGame);

    },
    destroyed(){
        window.removeEventListener("blur", this.pauseGame);
        this.instance.destroyInstance()
    },
    methods:{
      async playWithId(){
        try{
          let song = await getSheet(this.$route.params.sheet);
          this.instance.loadSong(song);
        }catch(err){
          this.$store.state.gModal.show({bodyText:"Sorry, this song does not exist or is unavaliable.", 
          isError: true, showCancel: false, okCallback: this.exitGame})
        }
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
        this.$store.state.gModal.show({bodyText:"Sorry, there is a problem with this video right now, which makes this sheet unavaliable. Please try again later.", 
        isError: true, showCancel: false, okCallback: this.exitGame})
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
        if(!this.started || this.isGameEnded) return;
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
        this.clearResult()
        this.instance.paused = false
        this.instance.resetPlaying()
        this.instance.startSong()
      },
      exitGame(){
        this.hideMenu()
        this.$router.push('/menu')
      },
      async gameEnded(){
        this.instance.destroyInstance()
        this.isGameEnded = true;
        try{
          const res = await uploadResult({
            result: this.result,
            songId: this.currentSong.songId,
            sheetId: this.currentSong.sheetId,
            isAuthed: this.$store.state.authed
            });
          console.log(res)
          this.$router.push('/result/'+res.data.resultId)
        }catch(error){
          console.error(error)
          this.$store.state.gModal.show({bodyText:"We are sorry, due to a connection failure, we are unable to save the result. Would you like to try again?", 
        isError: true, okCallback: this.gameEnded, cancelCallback: this.exitGame})
        }
      },
      clearResult(){
        this.result = {
              score: 0,
              totalPercentage: 0,
              totalHitNotes: 0,
              combo: 0,
              maxCombo: 0,
              marks: { perfect: 0, good: 0, offbeat: 0, miss: 0 }
            }
      },
      addTilt(){
        if(this.$refs.playButton){
            VanillaTilt.init(this.$refs.playButton, {
              max: 8,
              glare: true,
              "max-glare": 0.5,
              scale:1.1
            });
          }
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
  transform-origin: 50% 100%;
}

.game {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
}

.score {
  position: fixed;
  bottom: 10px;
  left: 10px;
  font-size: 3.5em;
  opacity: 0.3;
  font-family: "Dosis", sans-serif;
  display: flex;
  flex-direction: column;
}

.perspective {
  transform: rotateX(30deg) scaleY(1.5);
  transform-origin: 50% 100%;
}

.start_button_text {
  font-size: 20px;
  margin-left: 20px;
}

.start_page_button {
  margin: 30px 10%;
  opacity: 0.5;
  cursor: pointer;
  transition: 0.5s;
  pointer-events: all;
  display: inline-block;
}

.start_page_button:hover {
  opacity: 0.8;
  transform: scale(1.2);
}

@media only screen and (min-width: 800px) {
  /* desktop */
  .perspective {
    transform: rotateX(30deg) scale(1.5);
  }
}

@media only screen and (max-width: 1000px) {
  /* mobile */
  .score {
    top: 10px;
    right: 10px;
    bottom: auto;
    left: auto;
    font-size: 1.5em;
    font-family: "Nova Mono", monospace;
    flex-direction: column-reverse;
    text-align: right;
  }
}

.pause_button {
  cursor: pointer;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0.5;
  z-index: 100;
  padding: 20px 30px 30px 20px;
}

.modal-body {
  display: flex;
  align-items: center;
  padding: 30px;
}

.modal {
  transition: 0;
  animation: none;
  width: auto;
  cursor: pointer;
}

.flex_hori {
  display: flex;
  align-items: center;
  flex-direction: row;
}

.darker {
  backdrop-filter: blur(50px);
  -webkit-backdrop-filter: blur(50px);
}

.no-events {
  pointer-events: none;
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
