<template>
  <div>
    <!-- visualizer canvas -->
    <Visualizer
      ref="visualizer"
      :setBlur="blur"
      v-show="srcMode === 'url'"
    ></Visualizer>

    <div class="toolbar blurBackground" style="padding-left: 0;">
      <div class="logo">
        <img
          src="/assets/editor_logo.png"
          style="height: 8vh; cursor: pointer; pointer-events: all;"
          @click="goToMenu"
        />
        Sheet Editor
      </div>
      <div style="flex-grow: 1;"></div>
      <a href="#" @click.prevent="newEditor">New</a>
      <div style="display: flex;" :class="{ disabled: !initialized }">
        <a
          href="#"
          @click.prevent="saveSheet"
          :class="{ disabled: !isSheetOwner }"
          >Save</a
        >
        <a href="#" @click.prevent="togglePlayMode(false)">{{
          playMode ? "Edit" : "Test"
        }}</a>
        <a
          href="#"
          @click.prevent="showPublishModal"
          :class="{ disabled: !isSheetOwner }"
          >Publish</a
        >
      </div>
    </div>

    <div class="main">
      <div class="column side left blurBackground">
        <div class="tabs" :class="{ disabled: !initialized }">
          <div
            class="tab"
            :class="{ active: leftTab === 1 }"
            @click="leftTab = 1"
          >
            Info
          </div>
          <div
            class="tab"
            :class="{ active: leftTab === 2 }"
            @click="leftTab = 2"
          >
            Options
          </div>
        </div>
        <!-- tab 1 - info editor -->
        <info-editor
          style="flex-grow: 1;"
          ref="info"
          v-show="leftTab === 1"
        ></info-editor>
        <!-- tab 2 - options -->
        <PlayControl
          style="flex-grow: 1; padding: 0 30px; box-sizing: border-box;"
          ref="control"
          v-if="leftTab === 2"
          :playData="$data"
          :formStyle="true"
        ></PlayControl>
        <!-- song control -->
        <SongListItem
          v-if="songInfo.id"
          :song="songInfo"
          :hideBg="true"
          @selected="updateSongDetail"
          style="cursor: pointer;"
        ></SongListItem>
        <div v-show="gameSheetInfo" v-if="srcMode == 'youtube' && youtubeId">
          <div
            v-if="initialized"
            style="
              position: absolute;
              width: 100%;
              height: 100%;
              cursor: pointer;
            "
            @click="instance.paused ? songLoaded() : pauseGame()"
          ></div>
          <Youtube
            id="ytPlayer_editor"
            style="min-height: 240px;"
            ref="youtube"
            width="100%"
            height="100%"
            :video-id="youtubeId"
            :player-vars="{
              rel: 0,
              playsinline: 1,
              disablekb: 1,
              autoplay: 0,
              controls: 0,
              modestbranding: 1,
            }"
            @playing="songLoaded"
            @error="ytError"
            @paused="ytPaused"
            @ended="ytPaused"
          ></Youtube>
        </div>
      </div>

      <div class="column middle" :class="{ disabled: !initialized }">
        <!-- game wrapper -->
        <div class="gameWrapper" ref="wrapper">
          <canvas
            ref="mainCanvas"
            id="gameCanvas"
            :class="{ perspective }"
          ></canvas>
        </div>
        <!-- mark indicator -->
        <div class="center_judge" v-show="playMode" ref="hitIndicator">
          {{ markJudge }} {{ result.combo }}
        </div>

        <!-- center text -->
        <ZoomText style="z-index: 1000;" ref="zoom"></ZoomText>
      </div>

      <div
        class="column side right blurBackground"
        v-if="instance"
        :class="{ disabled: !initialized }"
      >
        <div
          v-if="!disableMappingTable"
          @click="disableMappingTable = true"
          style="
            float: right;
            padding-top: 30px;
            opacity: 0.5;
            cursor: pointer;
          "
        >
          Disable
        </div>
        <h2>Mappings</h2>
        <SheetTable v-if="!disableMappingTable"></SheetTable>
        <div v-else>
          To improve editor performance, mapping table is disabled.
          <div
            class="btn-action btn-dark"
            style="margin: 10px 0; width: 100px;"
            @click="disableMappingTable = false"
          >
            Enable
          </div>
        </div>
      </div>
    </div>

    <div
      class="toolbar blurBackground"
      v-if="instance"
      :class="{ disabled: !initialized }"
    >
      <div style="font-size: 30px; width: 80px; text-align: center;">
        {{ currentTime }}
      </div>
      <div class="action_buttons">
        <v-icon
          class="vicon"
          name="undo"
          scale="1"
          @click="seekTo(Number(currentTime) - noteSpeedInSec)"
        />
        <v-icon
          class="vicon"
          name="play"
          scale="1.5"
          @click="songLoaded"
          v-if="instance && instance.paused"
        />
        <v-icon
          class="vicon"
          name="pause"
          scale="1.5"
          @click="pauseGame"
          v-else
        />
        <v-icon
          class="vicon"
          name="redo"
          scale="1"
          @click="seekTo(Number(currentTime) + noteSpeedInSec)"
        />
      </div>
      <div style="flex-grow: 1;">
        <vue-slider
          :value="currentTime"
          :tooltip-placement="'right'"
          :interval="0.001"
          :min="-noteSpeedInSec"
          :max="songLength"
          :contained="true"
          :lazy="true"
          @dragging="seeking"
          @change="seekTo"
        ></vue-slider>
      </div>
      <div style="width: 90px; margin-left: 30px;">
        <select id="songSelect" v-model="playbackSpeed" :disabled="playMode">
          <option disabled>Playback Speed</option>
          <option value="0.25">0.25X</option>
          <option value="0.5">0.5X</option>
          <option value="0.75">0.75X</option>
          <option value="1">1.0X</option>
          <option value="1.5">1.5X</option>
        </select>
      </div>
    </div>

    <Loading style="z-index: 500;" :show="loading">Just a second...</Loading>
    <Loading style="z-index: 1000;" :show="!$store.state.initialized"
      >Communicating...</Loading
    >

    <Modal
      ref="publishModal"
      :hideFooter="true"
      titleText="Publish"
      style="text-align: center; z-index: 1000;"
    >
      <template>
        <publish></publish>
      </template>
    </Modal>
  </div>
</template>

<script>
import { getSong, getSheet, getGameSheet, updateSheet } from "../javascript/db";
import Visualizer from "../components/Visualizer.vue";
import InfoEditor from "../components/InfoEditor.vue";
import SheetTable from "../components/SheetTable.vue";
import SongListItem from "../components/SongListItem.vue";
import PlayControl from "../components/PlayControl.vue";
import ZoomText from "../components/ZoomText.vue";
import Modal from "../components/Modal.vue";
import Publish from "../components/Publish.vue";
import Loading from "../components/Loading.vue";
import GameInstanceMixin from "../mixins/gameInstanceMixin";
import VueSlider from "vue-slider-component";
import { Youtube } from "vue-youtube";
import "vue-slider-component/theme/antd.css";
import "vue-awesome/icons/play";
import "vue-awesome/icons/pause";
import "vue-awesome/icons/redo";
import "vue-awesome/icons/undo";

export default {
  name: "SheetEditor",
  components: {
    Visualizer,
    InfoEditor,
    VueSlider,
    Youtube,
    SheetTable,
    SongListItem,
    Loading,
    Modal,
    Publish,
    PlayControl,
    ZoomText,
  },
  mixins: [GameInstanceMixin],
  data() {
    return {
      wrapper: null,
      contentHeight: "86vh",
      playMode: false,
      playbackSpeed: 1,
      songLength: 0,
      inEditor: true,
      songInfo: {
        id: null,
      },
      sheetInfo: {
        id: null,
      },
      gameSheetInfo: null,
      loading: false,
      showExistingNote: true,
      selectedNotes: [],
      leftTab: 1,
      disableMappingTable: false,
      options: {
        soundEffect: true, //eidtor hit sound effect
      },
    };
  },
  computed: {
    currentTime() {
      return (this.instance.playTime - this.noteSpeedInSec).toFixed(2);
    },
    isSheetOwner() {
      return (
        !this.sheetInfo.id ||
        this.sheetInfo.createdBy === this.$store.state.currentUser.uid
      );
    },
    isSongOwner() {
      return (
        !this.songInfo.id ||
        this.songInfo.createdBy === this.$store.state.currentUser.uid
      );
    },
  },
  watch: {
    playbackSpeed() {
      this.setPlaybackRate(this.playbackSpeed);
    },
    "$store.state.initialized"() {
      this.checkLoggedIn();
    },
  },
  async mounted() {
    this.wrapper = this.$refs.wrapper;
    this.instance.reposition();
    const sheetId = this.$route.params.sheet;
    this.checkLoggedIn();

    if (sheetId) {
      this.loading = true;
      try {
        this.sheetInfo = await getSheet(sheetId);
        this.songInfo = await getSong(this.sheetInfo.songId);
        this.gameSheetInfo = await getGameSheet(sheetId);
        this.gameSheetInfo.sheet = this.gameSheetInfo.sheet ?? [];
        this.instance.loadSong(this.gameSheetInfo);
        Logger.log(this.gameSheetInfo);
        if (this.$route.query.save) {
          // refresh sheet data
          await this.saveSheet();
          this.$router.push({ query: { update: true } });
          this.reloadEditor();
          return;
        }
        if (!this.isSheetOwner) {
          this.$store.state.alert.warn(
            "Warning, you do not have edit access to this sheet, any changes will not be saved!",
            10000
          );
        }
      } catch (err) {
        Logger.error(err);
        this.$store.state.gModal.show({
          bodyText: "Sorry, something went wrong, maybe try refresh?",
          isError: true,
          showCancel: false,
        });
      }
      this.loading = false;

      if (this.$route.query.update) {
        this.$store.state.alert.success("Successfully updated!");
        this.$router.push({ query: null });
      }
    }
  },
  methods: {
    checkLoggedIn() {
      if (this.$store.state.initialized && !this.$store.state.verified) {
        this.$router.push({ path: "/account", query: { warn: true } });
      }
    },
    goToMenu() {
      this.$router.push("/menu");
    },
    async songLoaded() {
      if (!this.initialized) {
        this.instance.resetPlaying();
        this.songLength = await this.getLength();
        this.instance.pauseGame();
        this.initialized = true;
      } else if (!this.started) {
        this.instance.paused = false;
        this.instance.startSong();
      } else {
        this.instance.resumeGame();
      }
    },
    async getLength() {
      let length = 0;
      if (this.srcMode === "youtube") {
        length = await this.ytPlayer.getDuration();
      } else {
        length = this.audio.getDuration();
      }
      Logger.log(length);
      return Number(length.toFixed(3));
    },
    pauseGame() {
      if (!this.started) return;
      this.reorderSheet();
      this.clearFever();
      this.instance.pauseGame();
      this.disableMappingTable = false;
    },
    async restartGame() {
      if (!this.started) return;
      this.started = false;
      await this.instance.pauseGame();
      this.clearResult();
      this.instance.resetPlaying();
    },
    async seeking(time) {
      if (!this.instance.paused) this.pauseGame();
      this.instance.seekingTime = time;
      await this.instance.gameTimingLoop();
      this.instance.seeked();
      this.instance.repositionNotes();
    },
    seekTo(time) {
      if (time < this.instance.startSongAt) {
        this.restartGame();
        this.pauseGame();
      } else {
        this.seeking(time);
        this.instance.seekTo(time);
      }
    },
    setPlaybackRate(rate) {
      if (this.srcMode === "youtube") {
        this.ytPlayer.setPlaybackRate(Number(rate));
      } else {
        this.audio.setRate(Number(rate));
      }
    },
    togglePlayMode(clean) {
      this.playMode = !this.playMode;
      this.playbackSpeed = 1;
      if (clean) {
        this.instance.clearNotes();
        this.restartGame();
      }
      this.clearFever();
      this.instance.repositionNotes();
    },
    updateSongDetail() {
      this.$refs.info.openSongUpdate();
    },
    newEditor() {
      this.$router.push("/editor/");
      this.reloadEditor();
    },
    showPublishModal() {
      this.$refs.publishModal.show();
    },

    reorderSheet() {
      this.instance.timeArr.sort((a, b) => parseFloat(a.t) - parseFloat(b.t));
    },
    async saveSheet() {
      this.reorderSheet();
      this.countTotal();
      let sheet = {
        id: this.sheetInfo.id,
        sheet: JSON.stringify(this.instance.timeArr),
      };
      if (this.sheetInfo.length) sheet.length = this.sheetInfo.length;
      if (this.sheetInfo.noteCount) sheet.noteCount = this.sheetInfo.noteCount;
      try {
        await updateSheet(sheet);
        this.$store.state.alert.success("Sheet saved!");
      } catch (err) {
        this.$store.state.alert.error(
          "Error occurred while saving, please try again.",
          6000
        );
      }
      // save local backup
      let local = JSON.parse(localStorage.getItem("localSheetBackup")) || {};
      local[this.sheetInfo.id] = sheet;
      localStorage.setItem("localSheetBackup", JSON.stringify(local));
    },
    countTotal() {
      const lastNote = this.instance.timeArr[this.instance.timeArr.length - 1];
      this.sheetInfo.length =
        this.sheetInfo.endAt ??
        (lastNote
          ? Math.min.apply(Math, [this.songLength, lastNote.t + 5])
          : this.songLength);
      this.sheetInfo.noteCount = this.instance.timeArr.length;
    },

    reloadEditor() {
      this.$store.state.redirecting = true;
      this.$nextTick(() => {
        this.$store.state.redirecting = false;
      });
    },
  },
};
</script>

<style scoped>
/* The navbar container */
.toolbar {
  overflow: hidden;
  background-color: rgba(63, 63, 63, 0.8);
  height: 7vh;
  display: flex;
  align-items: center;
  padding: 0 30px;
  z-index: 200;
}

.logo {
  padding: 20px;
  padding-left: 0;
  display: flex;
  align-items: center;
}

.action_buttons {
  display: flex;
  align-items: center;
  margin: 0 30px;
  width: 100px;
  justify-content: space-between;
}

.toolbar a {
  display: block;
  color: #f2f2f2;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
  transition: 0.5s;
}

/* Links - change color on hover */
.toolbar a:hover {
  background-color: #ddd;
  color: black;
}

.perspective {
  transform: rotateX(30deg) scaleY(1.5);
  transform-origin: 50% 100%;
}

.main {
  scroll-snap-type: x mandatory;
  display: flex;
}

.column {
  height: 86vh;
}

/* Left and right column */
.column.side {
  width: 25%;
  box-sizing: border-box;
  background: linear-gradient(
    -45deg,
    rgba(56, 56, 56, 0.8),
    rgba(0, 0, 0, 0.7)
  );
}

.left {
  display: flex;
  flex-direction: column;
}

.right {
  padding: 30px;
}

.ytPlayer_editor {
  max-width: 100%;
}

/* Middle column */
.column.middle {
  width: 50%;
}

.vicon {
  cursor: pointer;
}

.tabs {
  display: flex;
  justify-content: space-evenly;
}

.tab {
  padding: 20px;
  cursor: pointer;
  transition: background-color 0.5s;
  flex-grow: 1;
  text-align: center;
}

.active {
  border-bottom: solid 2px white;
}

.tab:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

@media screen and (max-width: 600px) {
  .main {
    flex-wrap: nowrap;
    overflow-x: auto;
  }
  .column,
  .column.side,
  .column.middle {
    flex: 0 0 auto;
    width: 100vw;
    scroll-snap-align: start;
  }
}
</style>
