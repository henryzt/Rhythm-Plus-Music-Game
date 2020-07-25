<template>
  <div
    class="song_item"
    @click="$emit('selected', song)"
    :key="song.id"
    v-if="song"
  >
    <div class="image">
      <img :src="song.image" />
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
            <SheetDetailLine :sheet="sheet" :compact="true"></SheetDetailLine>
          </div>
        </div>
      </div>
      <div style="padding: 20px;" v-else key="2">Sheets loading...</div>
    </div>

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

    <div style="padding: 20px 0;">
      <Button text="Play!" @click="startSelected"></Button>
      <div class="text_button" @click="$emit('cancel')">Cancel</div>
    </div>
  </div>
</template>

<script>
import Button from "../ui/Button.vue";
import SheetDetailLine from "./SheetDetailLine.vue";
import { getBestScore } from "../../javascript/db";

export default {
  name: "SongDetailPanel",
  props: ["song", "sheets"],
  data() {
    return {
      selectedSheet: null,
      bestResult: null,
    };
  },
  components: {
    Button,
    SheetDetailLine,
  },
  computed: {},
  methods: {
    startSelected() {
      this.selectedSheet = this.selectedSheet ?? this.sheets[0];
      this.$router.push("/game/" + this.selectedSheet.id);
    },
  },
  watch: {
    song() {
      if (this.song) this.selectedSheet = null;
    },
    sheets() {
      if (this.song) this.selectedSheet = null;
    },
    async selectedSheet() {
      if (this.selectedSheet) {
        this.bestResult = await getBestScore(this.selectedSheet.id);
      } else {
        this.bestResult = null;
      }
    },
  },
};
</script>

<style scoped>
.song_item {
  position: sticky;
  top: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  width: 100%;
  max-width: 800px;
  margin: 10px auto;
  padding: 0;
  transition: 0.5s;
  text-align: center;
  min-width: 350px;
  white-space: normal;
}
.song_item:hover {
  background: rgba(255, 255, 255, 0.35);
}
.detail {
  display: flex;
  flex-direction: column;
  padding: 20px;
  width: 100%;
}
.image {
  width: 100%;
  overflow: hidden;
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
}
.brBlock {
  width: 30%;
  padding: 10px;
}
.brBlock + .brBlock {
  border-left: 1px solid grey;
}
.brTxt {
  font-size: 14px;
  color: grey;
}
</style>
