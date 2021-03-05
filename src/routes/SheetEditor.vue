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
        <div>Sheet Editor (Alpha)</div>
      </div>
      <div style="flex-grow: 1;"></div>
      <a href="#" @click.prevent="newEditor">New</a>
      <a
        href="#"
        :class="{ disabled: isDisabled }"
        @click.prevent="
          restartGame();
          songLoaded();
        "
        >Restart</a
      >
      <div style="display: flex;" :class="{ disabled: isDisabled }">
        <a
          href="#"
          @click.prevent="saveSheet"
          :class="{ disabled: !isSheetOwner }"
          style="position: relative;"
        >
          <span v-if="sheetChanged" class="saveIndicator">●</span>Save
        </a>
        <a href="#" @click.prevent="togglePlayMode(false)">
          {{ playMode ? "Edit" : "Test" }}
        </a>
        <a
          href="#"
          @click.prevent="showPublishModal"
          :class="{ disabled: !isSheetOwner }"
          >Publish</a
        >
      </div>
    </div>

    <div class="scrollBar">
      <div class="main hideOverflow">
        <div class="column side left blurBackground">
          <div class="tabs" :class="{ disabled: isDisabled }">
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
          <div v-if="leftTab === 2" style="flex-grow: 1; overflow: scroll;">
            <PlayControl
              style="padding: 0 30px; box-sizing: border-box;"
              ref="control"
              :playData="$data"
              :formStyle="true"
            ></PlayControl>
          </div>
          <!-- song control -->
          <SongListItem
            v-if="songInfo.id"
            :song="songInfo"
            :hideBg="true"
            @selected="updateSongDetail"
            style="cursor: pointer;"
          >
            <div style="padding-right: 20px; opacity: 0.5;">Edit</div>
          </SongListItem>
          <div
            v-show="gameSheetInfo"
            style="height: 200px;"
            v-if="srcMode == 'youtube' && youtubeId"
          >
            <div
              v-if="initialized"
              style="
                position: absolute;
                width: 100%;
                height: 200px;
                cursor: pointer;
              "
              @click="instance.paused ? songLoaded() : pauseGame()"
            ></div>
            <Youtube
              id="ytPlayer_editor"
              ref="youtube"
              width="100%"
              height="200px"
              :video-id="youtubeId"
              :player-vars="$store.state.ytVars"
              :nocookie="$store.state.ytVars.nocookie"
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
            <canvas ref="effectCanvas" id="effectCanvas"></canvas>
            <canvas
              ref="mainCanvas"
              id="gameCanvas"
              :class="{ perspective }"
            ></canvas>
          </div>
          <!-- mark indicator -->
          <MarkComboJudge
            style="z-index: 500;"
            ref="judgeDisplay"
            v-show="playMode && result.combo > 0"
          ></MarkComboJudge>

          <!-- center text -->
          <ZoomText style="z-index: 1000;" ref="zoom"></ZoomText>
        </div>

        <div
          class="column side right blurBackground"
          v-if="instance"
          :class="{ disabled: isDisabled }"
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
    </div>

    <div
      class="toolbar blurBackground"
      v-if="instance"
      :class="{ disabled: isDisabled }"
    >
      <div style="font-size: 30px; width: 80px; text-align: center;">
        {{ currentTime }}
      </div>
      <div class="action_buttons">
        <v-icon
          class="vicon"
          name="undo"
          scale="1"
          @click="seekTo(Number(currentTime) - instance.noteDelay)"
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
          @click="seekTo(Number(currentTime) + instance.noteDelay)"
        />
      </div>
      <div style="flex-grow: 1;">
        <vue-slider
          :tooltip-placement="'right'"
          :interval="0.001"
          :min="sliderMinLength"
          :max="sliderMaxLength"
          :value="currentTime"
          :contained="true"
          :lazy="true"
          @dragging="seeking"
          @change="seekTo"
        ></vue-slider>
      </div>
      <div style="width: 90px; margin-left: 30px;">
        <select id="songSelect" v-model="playbackSpeed">
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
import Visualizer from "../components/common/Visualizer.vue";
import InfoEditor from "../components/editor/InfoEditor.vue";
import SheetTable from "../components/editor/SheetTable.vue";
import SongListItem from "../components/menus/SongListItem.vue";
import PlayControl from "../components/common/PlayControl.vue";
import ZoomText from "../components/game/ZoomText.vue";
import MarkComboJudge from "../components/game/MarkComboJudge.vue";
import Modal from "../components/ui/Modal.vue";
import Publish from "../components/editor/Publish.vue";
import Loading from "../components/ui/Loading.vue";
import GameMixin from "../mixins/gameMixin";
import VueSlider from "vue-slider-component";
import { Youtube } from "vue-youtube";
import { tween } from "shifty";
import "vue-slider-component/theme/antd.css";
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
    MarkComboJudge,
  },
  mixins: [GameMixin],
  data() {
    return {
      wrapper: null,
      contentHeight: "86vh",
      playMode: false,
      songLength: 0,
      inEditor: true,
      disabled: false,
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
        lowerHitLine: true,
      },
      sheetChanged: false,
    };
  },
  computed: {
    currentTime() {
      return (this.instance.playTime - this.instance.noteDelay).toFixed(2);
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
    sliderMinLength() {
      return (
        (this.currentSong?.startAt ?? 0) - this.instance.noteDelay.toFixed(3)
      );
    },
    sliderMaxLength() {
      return this.currentSong?.endAt ?? this.songLength;
    },
    isDisabled() {
      return !this.initialized || this.disabled;
    },
  },
  watch: {
    playbackSpeed() {
      this.setPlaybackRate(this.playbackSpeed);
    },
    "options.lowerHitLine"() {
      this.instance.reposition();
    },
    "$store.state.initialized"() {
      this.checkLoggedIn();
    },
    "instance.timeArr"() {
      if (!this.sheetChanged && this.initialized) this.sheetChanged = true;
    },
    "$route.query.song"() {
      if (!this.$route.params.sheet) {
        this.checkSongQuery();
      }
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
    } else {
      this.checkSongQuery();
    }

    window.onbeforeunload = () => {
      if (this.sheetChanged) {
        return "If you leave this page you will lose your unsaved changes.";
      }
    };
  },
  methods: {
    checkLoggedIn() {
      if (this.$store.state.initialized && !this.$store.state.verified) {
        this.$router.push({ path: "/account/", query: { warn: true } });
      }
    },
    async checkSongQuery() {
      const songId = this.$route.query.song;
      if (songId) {
        this.songInfo = await getSong(songId);
        this.$refs.info.getSheets();
      }
    },
    goToMenu() {
      this.$router.push("/studio/");
    },
    async songLoaded() {
      if (!this.initialized) {
        this.instance.resetPlaying();
        this.songLength = await this.getLength();
        this.instance.pauseGame();
        this.initialized = true;
        if (this.$route.query.save) {
          // refresh sheet data
          await this.saveSheet();
          this.$router.push({ query: null });
          this.gameSheetInfo = await getGameSheet(this.$route.params.sheet);
          this.instance.loadSong(this.gameSheetInfo);
        }
      } else if (!this.started) {
        this.instance.paused = false;
        this.instance.startSong();
      } else {
        this.resumeGame();
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
    resumeGame() {
      this.instance.resumeGame();
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
    async smoothSeekTo(seekTime) {
      await tween({
        render: ({ x }) => {
          this.seeking(x);
        },
        easing: "easeInOutQuad",
        duration: 500,
        from: { x: Number(this.instance.currentTime) },
        to: { x: seekTime },
      });
      this.seekTo(seekTime);
    },
    setPlaybackRate(rate) {
      if (this.srcMode === "youtube") {
        this.ytPlayer.setPlaybackRate(Number(rate));
      } else {
        this.audio.setRate(Number(rate));
      }
      this.instance.reposition();
    },
    togglePlayMode(clean) {
      this.playMode = !this.playMode;
      if (clean) {
        this.instance.clearNotes();
        this.restartGame();
      }
      this.clearFever();
      this.instance.reposition();
      this.instance.clearHoldingStatus();
    },
    updateSongDetail() {
      this.$refs.info.openSongUpdate();
    },
    async newEditor() {
      if (await this.saveWarning()) {
        this.$router.push("/editor/");
        this.reloadEditor();
      }
    },
    showPublishModal() {
      this.$refs.publishModal.show();
    },
    saveWarning() {
      if (this.sheetChanged) {
        return this.$store.state.gModal.show({
          bodyText:
            "You have unsaved changes, are you sure you want to continue without saving?",
          isError: false,
          showCancel: true,
        });
      } else {
        return Promise.resolve(true);
      }
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

      this.sheetChanged = false;
    },
    countTotal() {
      const lastNote = this.instance.timeArr[this.instance.timeArr.length - 1];
      const endAt =
        this.sheetInfo.endAt ??
        (lastNote
          ? Math.min.apply(Math, [this.songLength, lastNote.t + 5])
          : this.songLength);
      this.sheetInfo.length = endAt - (this.sheetInfo.startAt ?? 0);
      this.sheetInfo.noteCount = this.instance.timeArr.length;
    },

    reloadEditor() {
      this.instance.destroyInstance();
      this.$store.state.redirecting = true;
      this.$nextTick(() => {
        this.$store.state.redirecting = false;
      });
    },
  },
  beforeRouteLeave: async function (to, from, next) {
    const canLeave = await this.saveWarning();
    next(canLeave);
  },
  beforeDestroy() {
    window.onbeforeunload = null;
    this.instance.destroyInstance();
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
  overflow-x: scroll;
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

.saveIndicator {
  color: orange;
  position: absolute;
  font-size: 12px;
  bottom: 3px;
  left: 47%;
}

.hideOverflow {
  overflow-y: hidden;
}

@media screen and (max-width: 600px) {
  .main {
    flex-wrap: nowrap;
    overflow-x: auto;
  }
  .column {
    flex-grow: 1;
    /* 5px scroll bar */
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
