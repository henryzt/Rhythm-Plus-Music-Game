<template>
  <div class="game">
    <!-- progress bar -->
    <ProgressBar
      v-if="currentSong && currentSong.length"
      :progress="progress"
    ></ProgressBar>

    <!-- resume game countdown -->
    <Countdown
      style="z-index: 1000; pointer-events: none"
      ref="countdown"
      @finish="instance.resumeGame()"
    ></Countdown>

    <!-- pause button -->
    <transition name="modal-fade">
      <a
        class="pause_button"
        @click="pauseGame"
        v-if="started && instance && !instance.paused && !isGameEnded"
      >
        <v-icon name="regular/pause-circle" scale="1.5" />
      </a>
      <Navbar
        v-else-if="!isGameEnded"
        style="z-index: 1000"
        :gameNav="true"
      ></Navbar>
    </transition>

    <!-- mark indicator -->
    <MarkComboJudge
      style="z-index: 400; pointer-events: none"
      ref="judgeDisplay"
      v-show="!isGameEnded"
    ></MarkComboJudge>

    <!-- center text (fever x2 etc) -->
    <ZoomText class="zoom" ref="zoom"></ZoomText>

    <!-- Tutorial -->
    <transition name="modal-fade">
      <Tutorial
        v-if="tutorial"
        v-show="started && !instance.paused"
        class="zoom allow-events"
      ></Tutorial>
    </transition>

    <!-- game canvas -->
    <div class="gameWrapper" :class="{ 'no-events': hideGameForYtButton }">
      <canvas ref="effectCanvas" id="effectCanvas"></canvas>
      <canvas
        ref="mainCanvas"
        id="gameCanvas"
        :class="{ perspective }"
      ></canvas>
    </div>

    <!-- visualizer canvas -->
    <Visualizer
      ref="visualizer"
      :setBlur="blur"
      v-show="!hideGameForYtButton"
    ></Visualizer>

    <!-- score panel -->
    <ScorePanel></ScorePanel>

    <!-- youtube player -->
    <div><!-- for mp3 mode youtube bug --></div>
    <div v-if="srcMode === 'youtube' && !isGameEnded" v-show="initialized">
      <Youtube
        :class="{ 'allow-events': srcMode === 'youtube' }"
        class="ytPlayerMobileExtend no-events"
        id="ytPlayer"
        ref="youtube"
        :video-id="youtubeId"
        :player-vars="$store.state.ytVars"
        :nocookie="$store.state.ytVars.nocookie"
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
      <div
        class="modal-backdrop"
        :class="{ 'no-events': hideGameForYtButton }"
        v-if="showStartButton"
      >
        <!-- option button -->
        <div
          class="flex_hori start_page_button"
          @click="
            advancedMenuOptions = true;
            $refs.menu.show();
          "
          @mouseenter="handleHover"
        >
          <v-icon name="cog" scale="1.5" />
        </div>

        <!-- play button -->
        <div
          class="modal blurBackground"
          :class="{ darker: hideGameForYtButton }"
          ref="playButton"
          @mouseenter="handleHover"
        >
          <div
            class="modal-body"
            @click="hideGameForYtButton ? () => {} : startGame()"
          >
            <div class="flex_hori">
              <v-icon name="play" scale="1.5" />
              <div class="start_button_text">Start</div>
            </div>
          </div>
        </div>
        <!-- info button -->
        <div @click="showInfoMenu" @mouseenter="handleHover">
          <div class="flex_hori start_page_button">
            <v-icon name="info-circle" scale="1.5" />
          </div>
        </div>

        <div class="youtube_notice" v-if="srcMode === 'youtube'">
          Powered by YouTube.
          <br />
          Video copyright goes to the owner.
        </div>
      </div>
    </transition>

    <!-- loading popup -->
    <Loading
      style="z-index: 200"
      :show="instance && instance.loading && !youtubeBuffering"
      >Song Loading...</Loading
    >
    <Loading
      style="z-index: 200"
      :show="youtubeBuffering"
      :delay="true"
      :delayLength="3000"
      >Buffering...</Loading
    >
    <Loading style="z-index: 600" :show="isGameEnded && !showingAchievement"
      >Syncing Results...</Loading
    >

    <!-- pause menu modal -->
    <Modal
      ref="menu"
      :hideFooter="true"
      style="text-align: center; z-index: 500"
    >
      <template v-slot:header>
        <div style="width: 100%; font-size: 23px">
          {{ advancedMenuOptions ? "Options" : "Pause Menu" }}
        </div>
      </template>

      <template>
        <transition name="slide-fade" mode="out-in">
          <div v-if="!advancedMenuOptions" class="menu" key="1">
            <div class="btn-action btn-dark" @click="resumeGame(true)">
              <v-icon name="play" />
              <span>Resume</span>
            </div>
            <div class="btn-action btn-dark" @click="restartGame">
              <v-icon name="redo" />
              <span>Restart</span>
            </div>
            <div
              class="btn-action btn-dark"
              @click="advancedMenuOptions = true"
            >
              <v-icon name="cog" />
              <span>Advanced</span>
            </div>
            <div class="btn-action btn-dark" @click="exitGame">
              <v-icon name="sign-out-alt" />
              <span>Exit Game</span>
            </div>
          </div>

          <div v-else key="2">
            <PlayControl :playData="$data"></PlayControl>
            <br />
            <hr style="opacity: 0.2" />
            <div
              class="btn-action btn-dark"
              style="display: inline-block"
              @click="advancedMenuOptions = false"
              v-if="started"
            >
              Back
            </div>
            <div
              class="btn-action btn-dark"
              style="display: inline-block"
              @click="started ? resumeGame(true) : hideMenu(true)"
            >
              Done
            </div>
          </div>
        </transition>
      </template>
    </Modal>

    <!-- sheet info modal -->
    <Modal
      ref="info"
      :showCancel="false"
      style="text-align: center; z-index: 500"
    >
      <template v-slot:header>
        <div style="width: 100%; font-size: 23px">Sheet Info</div>
      </template>

      <template>
        <SheetDetailLine :sheet="currentSong"></SheetDetailLine>
      </template>
    </Modal>
  </div>
</template>

<script>
import PlayControl from "../components/common/PlayControl.vue";
import Visualizer from "../components/common/Visualizer.vue";
import Loading from "../components/ui/Loading.vue";
import Modal from "../components/ui/Modal.vue";
import ZoomText from "../components/game/ZoomText.vue";
import Navbar from "../components/ui/Navbar.vue";
import SheetDetailLine from "../components/menus/SheetDetailLine.vue";
import ProgressBar from "../components/game/ProgressBar.vue";
import Countdown from "../components/game/Countdown.vue";
import MarkComboJudge from "../components/game/MarkComboJudge.vue";
import Tutorial from "../components/game/Tutorial.vue";
import ScorePanel from "../components/game/ScorePanel.vue";
import GameMixin from "../mixins/gameMixin";
import { Youtube } from "vue-youtube";
import {
  getGameSheet,
  uploadResult,
  createPlay,
  updatePlay,
} from "../javascript/db";
import { logEvent, logError } from "../helpers/analytics";
import VanillaTilt from "vanilla-tilt";
import "vue-awesome/icons/regular/pause-circle";
import "vue-awesome/icons/play";
import "vue-awesome/icons/cog";
import "vue-awesome/icons/info-circle";
const isDev = process.env.NODE_ENV === "development";

export default {
  name: "Game",
  components: {
    PlayControl,
    Visualizer,
    Youtube,
    Loading,
    Modal,
    ZoomText,
    Navbar,
    ProgressBar,
    Countdown,
    SheetDetailLine,
    MarkComboJudge,
    Tutorial,
    ScorePanel,
  },
  mixins: [GameMixin],
  data() {
    return {
      playId: null,
      showingAchievement: false,
      tutorial: false,
      youtubeBuffering: false,
    };
  },
  computed: {
    progress() {
      const startAt = this.currentSong.startAt ?? 0;
      let time = (this.instance.playTime - startAt) / this.currentSong.length;
      return time > 0 ? time : 0;
    },
  },
  mounted() {
    if (this.$route.params.sheet) {
      this.instance.loading = true;
      this.playWithId(this.$route.params.sheet);
    } else if (this.$route.path.includes("tutorial")) {
      // tutorial mode
      this.tutorial = true;
      this.playWithId("SItZEA9Uysy6RC1Ylkqh");
    } else {
      this.$store.state.gModal.show({
        bodyText: "No song is chosen, tap 'OK' to go to song list.",
        isError: true,
        showCancel: false,
        okCallback: this.exitGame,
      });
    }
  },
  beforeDestroy() {
    if (this.isGameEnded) return;
    this.reportExit("closed");
  },
  methods: {
    async playWithId(sheetId) {
      try {
        let song = await getGameSheet(sheetId);
        this.instance.loadSong(song);
        document.title = song.title + " - Rhythm+ Music Game";
      } catch (err) {
        this.$store.state.gModal.show({
          bodyText: "Sorry, this song does not exist or is unavaliable.",
          isError: true,
          showCancel: false,
          okCallback: this.exitGame,
        });
        logError("song_load_error_" + sheetId);
      }
    },
    handleHover() {
      this.$store.state.audio.playHoverEffect("ui/ta");
    },
    songLoaded() {
      Logger.log("playing");
      this.instance.loading = false;
      this.youtubeBuffering = false;
      if (!this.started) {
        // first loaded
        this.showStartButton = true;
        if (this.srcMode !== "youtube") return;
        this.ytPlayer?.setVolume(0);
        this.instance?.startSong();
        this.showStartButton = false;
        this.$refs.zoom.show("Get Ready...");
      } else {
        this.resumeGame();
      }
    },
    videoCued() {
      if (this.srcMode !== "youtube") return;
      Logger.log("cued");
      this.instance.loading = false;
      this.showStartButton = true;
      logEvent("youtube_cued");
    },
    ytBuffering() {
      Logger.log("buffering");
      if (this.showStartButton) {
        this.startGame();
      }
    },
    async startGame() {
      if (!this.showStartButton) return;
      logEvent("start_game", { songId: this.currentSong.songId });
      this.showStartButton = false;
      if (this.srcMode === "youtube") {
        this.instance.loading = true;
        this.youtubeBuffering = true;
        this.ytPlayer?.playVideo();
        this.ytPlayer?.setVolume(0);
      } else {
        if (!this.tutorial) this.$refs.zoom.show("Get Ready...");
        this.instance.startSong();
      }
      if (isDev) return;
      this.playId = await createPlay(
        this.currentSong.sheetId,
        this.currentSong.songId
      );
    },
    pauseGame() {
      if (!this.started || this.isGameEnded) return;
      this.instance.pauseGame();
      this.$refs.menu.show();
    },
    hideMenu(safeClose) {
      this.advancedMenuOptions = false;
      if (safeClose) this.$refs.menu.ok();
      else this.$refs.menu.close();
    },
    showInfoMenu() {
      this.$refs.info.show();
    },
    resumeGame(fromMenu) {
      this.hideMenu(true);
      if (!fromMenu) {
        this.$refs.countdown.clear();
        this.instance.resumeGame();
      } else {
        this.$refs.countdown.start();
      }
    },
    restartGame() {
      this.hideMenu();
      this.clearResult();
      this.instance.paused = false;
      this.instance.resetPlaying();
      this.instance.startSong();
    },
    exitGame(e, reason) {
      this.reportExit(reason ?? "exited");
      this.playId = null;
      this.hideMenu();
      this.$router.push("/menu");
    },
    updatePlay(data) {
      if (!this.playId) return;
      return updatePlay(this.playId, data);
    },
    reportExit(status) {
      const data = {
        status,
        playTime: this.instance.playTime,
        result: this.result,
      };
      this.updatePlay(data);
      logEvent("game_exited", data);
    },
    async gameEnded(isGameOver) {
      this.instance.destroyInstance();
      this.isGameEnded = true;
      let achievementPromise = Promise.resolve();
      if (isGameOver === true) {
        this.$router.push("/game-over/" + this.currentSong.sheetId);
        this.reportExit("failed");
        logEvent("game_failed");
        return;
      }
      if (this.tutorial) {
        this.exitGame(null, "tutorial-ends");
        return;
      }
      if (this.result.marks.miss == 0) {
        this.showingAchievement = true;
        this.$refs.zoom.show("Full Combo");
        this.$confetti.start();
        this.$store.state.audio.playEffect("wow");
        achievementPromise = new Promise((resolve) => {
          setTimeout(() => {
            this.showingAchievement = false;
            resolve();
          }, 2000);
        });
      }
      try {
        const uploadPromise = uploadResult({
          result: this.result,
          songId: this.currentSong.songId,
          sheetId: this.currentSong.sheetId,
          playId: this.playId,
          isAuthed: this.$store.state.authed,
        });
        const result = await Promise.all([uploadPromise, achievementPromise]);
        const res = result[0];
        Logger.log(res);
        this.$router.push("/result/" + res.data.resultId);
        this.$confetti.stop();
        this.updatePlay({ status: "finished", resultId: res.data.resultId });
        logEvent("result_uploaded", {
          resultId: res.data.resultId,
        });
      } catch (error) {
        Logger.error(error);
        this.$store.state.gModal.show({
          bodyText:
            "We are sorry, due to a connection failure, we are unable to save the result. Would you like to try again?",
          isError: true,
          showCancel: true,
          okCallback: this.gameEnded,
          cancelCallback: this.exitGame,
        });
        logError("result_upload_error");
      }
    },
    addTilt() {
      if (this.$refs.playButton) {
        VanillaTilt.init(this.$refs.playButton, {
          max: 8,
          glare: true,
          "max-glare": 0.5,
          scale: 1.1,
        });
      }
    },
  },
};
</script>

<style scoped>
* {
  overflow: hidden;
}

.game {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
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
  padding: 30px;
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

.menu .btn-action {
  position: relative;
}

.menu span {
  padding-left: 20px;
}

.menu .fa-icon {
  position: absolute;
  left: 20px;
  top: 12px;
}

.zoom {
  z-index: 1000;
  pointer-events: none;
}

@media only screen and (min-width: 800px) {
  /* desktop */
  .perspective {
    transform: rotateX(30deg) scale(1.5) scaleX(0.72);
  }

  .youtube_notice br {
    display: none;
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

.modal-backdrop {
  display: flex;
  flex-direction: row;
}

.darker {
  backdrop-filter: blur(50px);
  -webkit-backdrop-filter: blur(50px);
}

.youtube_notice {
  position: fixed;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0.3;
  font-size: 0.8em;
  width: 90%;
  text-align: center;
}

.no-events {
  pointer-events: none;
}

.allow-events {
  pointer-events: all;
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
