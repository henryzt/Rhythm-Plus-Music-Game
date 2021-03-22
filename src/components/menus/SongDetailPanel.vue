<template>
  <div class="sticky">
    <v-bar style="height: 100%;" :settings="{ wheelPropagation: false }">
      <div
        class="song_item"
        @click="$emit('selected', song)"
        :key="song.id"
        v-if="song"
      >
        <div class="image">
          <img :src="song.image" />
          <v-icon
            v-if="!inPreivew"
            class="previewIcon"
            name="play"
            scale="1.5"
            @click="playPreview"
          />
          <v-icon
            v-else-if="song.srcMode === 'url'"
            class="previewIcon"
            name="pause"
            scale="1.5"
            @click="endPreivew"
          />
          <div v-else class="youtube">
            <Youtube
              ref="youtube"
              width="100%"
              height="200px"
              :video-id="previewYtId"
              :player-vars="{ ...$store.state.ytVars, autoplay: 1 }"
              :nocookie="true"
              @error="endPreivew"
              @paused="endPreivew"
              @ended="endPreivew"
            ></Youtube>
          </div>
        </div>
        <div class="detail">
          <div style="font-size: 1.3em; font-weight: bold;">
            {{ song.title }}
            <span v-if="song.subtitle" style="opacity: 0.6;"
              >({{ song.subtitle }})</span
            >
          </div>
          <div>{{ song.artist }}</div>
        </div>
        <div
          style="
            background: rgba(0, 0, 0, 0.2);
            padding: 20px 0;
            box-sizing: border-box;
            width: 100%;
          "
        >
          <div style="opacity: 0.4;">Select Sheet or Press Play</div>

          <div v-if="sheets" key="1">
            <div v-for="sheet in sheets" :value="sheet.id" :key="sheet.id">
              <div
                @click="selectedSheet = sheet"
                :class="{ sheet: true, active: selectedSheet == sheet }"
              >
                <SheetDetailLine
                  :sheet="sheet"
                  :compact="true"
                ></SheetDetailLine>
              </div>
            </div>
          </div>
          <div style="padding: 20px;" v-else key="2">Sheets loading...</div>
        </div>

        <transition name="height">
          <div class="bestRes" v-if="bestResult">
            <div class="brBlock">
              <div class="brTxt">Rank</div>
              {{ bestResult.rank }}
            </div>
            <div class="brBlock">
              <div class="brTxt">Combo</div>
              {{ bestResult.result.maxCombo }}
            </div>
            <div class="brBlock">
              <div class="brTxt">Accuracy</div>
              {{ bestResult.result.percentage.toFixed(2) }}%
            </div>
            <div class="brBlock">
              <div class="brTxt">Score</div>
              {{ bestResult.result.score.toFixed(0) }}
            </div>
          </div>
        </transition>

        <div style="padding: 20px 0;">
          <StartButton text="Play!" @click="startSelected"></StartButton>
          <div class="flex_hori">
            <div class="text_button" v-if="isOwner" @click="goToEdit">
              Edit Song
            </div>
            <div class="text_button" @click="$emit('cancel')">Cancel</div>
          </div>
        </div>
      </div>
    </v-bar>
  </div>
</template>

<script>
import StartButton from "../ui/StartButton.vue";
import SheetDetailLine from "./SheetDetailLine.vue";
import { getBestScore } from "../../javascript/db";
import { Youtube } from "vue-youtube";
import { Howl } from "howler";

export default {
  name: "SongDetailPanel",
  props: ["song", "sheets"],
  data() {
    return {
      selectedSheet: null,
      bestResult: null,
      previewYtId: "caCqu-p_wZc",
      previewPlayer: null,
      inPreivew: false,
    };
  },
  components: {
    StartButton,
    SheetDetailLine,
    Youtube,
  },
  computed: {
    isOwner() {
      const uid = this.$store.state.currentUser.uid;
      return (
        this.song?.createdBy === uid ||
        this.sheets?.reduce((sum, next) => sum && next.createdBy === uid, true)
      );
    },
  },
  methods: {
    startSelected() {
      this.selectedSheet = this.selectedSheet ?? this.sheets[0];
      this.$router.push("/game/" + this.selectedSheet.id);
    },
    goToEdit() {
      this.$router.push({ path: "/editor", query: { song: this.song.id } });
    },
    playPreview() {
      this.inPreivew = true;
      if (this.song.srcMode === "youtube") {
        this.previewYtId = this.song.youtubeId;
      } else {
        this.previewPlayer = new Howl({ src: [this.song.url] });
        this.previewPlayer.play();
      }
      this.$store.state.audio.pause();
      this.$store.state.audio.playEffect("ui/click");
    },
    endPreivew() {
      if (this.inPreivew) this.$store.state.audio.playEffect("ui/click");
      this.inPreivew = false;
      this.$store.state.audio.play();
      this.previewPlayer?.stop();
    },
  },
  beforeDestroy() {
    this.$store.state.audio.playEffect("ui/slide1");
    this.endPreivew();
  },
  watch: {
    song() {
      if (this.song) {
        this.selectedSheet = null;
        this.bestResult = null;
      }
      this.endPreivew();
    },
    async sheets() {
      if (this.song) {
        this.selectedSheet = null;
        if (this.sheets?.[0]) {
          this.bestResult = await getBestScore(this.sheets[0].id);
        }
      }
    },
    async selectedSheet() {
      this.bestResult = null;
      if (this.selectedSheet) {
        this.bestResult = await getBestScore(this.selectedSheet.id);
      }
    },
  },
};
</script>

<style scoped>
.sticky {
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 220px);
  height: 100%;
  min-width: 350px;
}
.song_item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  width: 100%;
  max-width: 800px;
  margin: auto;
  padding: 0;
  transition: 0.5s;
  text-align: center;
  white-space: normal;
}
.song_item:hover {
  background: rgba(255, 255, 255, 0.35);
}
.detail {
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  width: 100%;
}
.image {
  width: 100%;
  overflow: hidden;
  position: relative;
  min-height: 200px;
}
.image img {
  width: 100%;
  max-height: 900px;
}
.sheet {
  margin-top: 10px;
  padding: 5px 0;
  width: 100%;
  transition: 1s;
  cursor: pointer;
}
.active {
  background: rgba(255, 255, 255, 0.3);
}
.bestRes {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  width: 100%;
  margin-top: 10px;
  overflow: hidden;
}
.brBlock {
  width: 30%;
  padding: 10px;
}
.brBlock + .brBlock {
  border-left: 1px solid rgba(128, 128, 128, 0.37);
}
.brTxt {
  font-size: 14px;
  color: rgb(165, 165, 165);
}

.previewIcon {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 30px;
  opacity: 0.5;
  cursor: pointer;
  webkit-filter: drop-shadow(0px 0px 5px rgba(0, 0, 0, 1));
  filter: drop-shadow(0px 0px 5px rgba(0, 0, 0, 1));
}

.youtube {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.height-enter-active,
.height-leave-active {
  transition: all 0.3s ease;
}
.height-enter,
.height-leave-to {
  height: 0;
  margin: 0;
  padding: 0;
  opacity: 0;
}
</style>
