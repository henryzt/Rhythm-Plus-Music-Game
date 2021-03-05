<template>
  <div>
    <div
      class="song_item"
      :class="{ song_item_bg: !hideBg, song_item_small: hideBg }"
      ref="item"
      @click="click"
      v-if="song"
      @mouseenter="playHoverSound"
    >
      <div class="image">
        <img :src="song.image" onerror="this.style.display='none'" />
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
      <slot></slot>
    </div>
    <div v-if="sheets && selected && !hideBg" style="padding-bottom: 20px;">
      <div v-for="sheet in sheets" :value="sheet.id" :key="sheet.id">
        <div
          @click="$emit('selectedSheet', sheet)"
          :class="{ sheet: true, active: selectedSheet == sheet }"
        >
          <SheetDetailLine
            :sheet="sheet"
            :compactDetailed="true"
          ></SheetDetailLine>
        </div>
      </div>
      <div
        class="sheet"
        @click="goToEditorWithSong"
        style="padding: 3px; text-align: center;"
      >
        Create new
      </div>
    </div>
  </div>
</template>

<script>
import SheetDetailLine from "./SheetDetailLine.vue";

export default {
  name: "SongListItem",
  props: ["song", "hideBg", "sheets", "selected"],
  components: {
    SheetDetailLine,
  },
  data() {
    return {
      selectedSheet: null,
    };
  },
  methods: {
    goToEditorWithSong() {
      this.$router.push({ path: "/editor", query: { song: this.song.id } });
    },
    playHoverSound() {
      this.$store.state.audio.playEffect("ui/deep");
    },
    playClickSound() {
      this.$store.state.audio.playEffect("ui/pop");
    },
    click() {
      this.playClickSound();
      this.$emit("selected", this.song);
    },
  },
  mounted() {},
  computed: {},
};
</script>

<style scoped>
.song_item {
  padding: 0;
  display: flex;
  align-items: center;
  z-index: 1000;
  margin: 10px;
  width: fit-content;
}

.song_item_bg {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  width: 100%;
  max-width: 800px;
  margin: 10px auto;
  transition: 0.5s, outline-width 0s, outline-color 0.5s;
  overflow: hidden;
  cursor: pointer;
  outline-color: transparent;
}
.song_item_bg:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(1.1);
  outline: 5px solid white;
  z-index: 500;
}
.song_item_bg:active:hover {
  transition: transform 0.2s;
  transform: scale(1.05);
}
.detail {
  display: flex;
  flex-direction: column;
  padding: 20px;
  text-align: left;
}
.image {
  width: 200px;
  height: 120px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.473);
  text-align: center;
  min-width: 200px;
}
.image img {
  height: 100%;
}

.song_item_small .image {
  width: 100px;
  height: 60px;
  min-width: 0px;
}
.song_item_small {
  font-size: 0.8em;
}
.sheet {
  max-width: 800px;
  cursor: pointer;
  transition: 0.5s;
  margin: auto;
}
.sheet:hover {
  /* text-align: center; */
  /* min-width: 800px; */
  /* max-width: fit-content; */
  background: rgba(255, 255, 255, 0.3);
}
@media only screen and (max-width: 1000px) {
  .image {
    width: 150px;
    min-width: 150px;
    height: 90px;
  }
}
@media only screen and (max-width: 1300px) {
  .song_item_bg:hover {
    transform: none;
  }
  .song_item_bg:active:hover {
    transform: scale(0.95);
  }
}
</style>
