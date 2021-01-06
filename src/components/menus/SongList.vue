<template>
  <div class="mContainer">
    <SheetFilter
      :songs="songs"
      @sorted="songDisplayList = $event"
      ref="sorter"
    ></SheetFilter>
    <transition-group
      v-if="songDisplayList"
      appear
      tag="div"
      name="slide-in"
      :style="{ '--total': songDisplayList.length }"
    >
      <slot name="top"></slot>
      <div
        v-for="(song, i) in songDisplayList"
        :key="song.id"
        :style="{ '--i': i < 10 ? 10 : i }"
      >
        <SongListItem
          :song="song"
          :sheets="song.sheets"
          :selected="selectedSong === song"
          @selected="songSelected($event)"
          @selectedSheet="goToSheet($event)"
        ></SongListItem>
      </div>
      <slot name="bottom"></slot>
    </transition-group>
  </div>
</template>

<script>
import SongListItem from "./SongListItem.vue";
import SheetFilter from "./SheetFilter.vue";

export default {
  name: "SongList",
  props: {
    songs: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  components: {
    SongListItem,
    SheetFilter,
  },
  data() {
    return {
      selectedSong: null,
      songDisplayList: null,
    };
  },
  methods: {
    songSelected(e) {
      this.selectedSong = e;
      this.$emit("selected", e);
    },
    sort(by) {
      this.$refs.sorter.sort(by);
    },
  },
};
</script>

<style scoped></style>
