<template>
  <div style="overflow-y: scroll;">
    <div class="pageTitle">Song Select</div>

    <div class="mContainer">
      <div
        class="song_list"
        :class="{ list_collapsed: selectedSong }"
        v-if="songList"
      >
        <SheetFilter
          :class="{ sHidden: selectedSong }"
          :songs="songList"
          @sorted="songDisplayList = $event"
        ></SheetFilter>
        <transition-group
          v-if="songDisplayList"
          appear
          tag="div"
          name="slide-in"
          :style="{ '--total': songDisplayList.length }"
        >
          <div
            v-for="(song, i) in songDisplayList"
            :key="song.id"
            :style="{ '--i': i }"
          >
            <SongListItem
              :song="song"
              @selected="selectedSong = $event"
            ></SongListItem>
          </div>
        </transition-group>
      </div>

      <div :class="{ detail: true, detail_collapsed: !selectedSong }">
        <transition name="slide-fade">
          <SongDetailPanel
            v-if="selectedSong"
            :song="selectedSong"
            :sheets="sheetList"
            @cancel="selectedSong = null"
          ></SongDetailPanel>
        </transition>
      </div>
    </div>

    <Loading :show="(!songList || songList.length===0)" :delay="true"
      >Fetching Latest Songs...</Loading
    >
  </div>
</template>

<script>
import SongListItem from "../components/menus/SongListItem.vue";
import SongDetailPanel from "../components/menus/SongDetailPanel.vue";
import SheetFilter from "../components/menus/SheetFilter.vue";
import Loading from "../components/ui/Loading.vue";
import { getSheetList, getSongList } from "../javascript/db";

export default {
  name: "SongSelect",
  components: {
    SongListItem,
    SongDetailPanel,
    Loading,
    SheetFilter,
  },
  data() {
    return {
      songList: null,
      songDisplayList: [],
      sheetList: null,
      selectedSong: null,
    };
  },
  computed: {},
  watch: {
    async selectedSong() {
      this.sheetList = null;
      if (this.selectedSong)
        this.sheetList = await getSheetList(this.selectedSong.id);
    },
  },
  mounted() {
    getSongList()
      .then((res) => {
        this.songList = res;
      })
      .catch((err) => {
        Logger.error(err);
      });
  },
  methods: {},
};
</script>

<style scoped>
.mContainer {
  /* perspective: 100em; */
  display: flex;
  justify-content: center;
  transition: 2s;
  white-space: nowrap;
  margin-bottom: 300px !important;
}
.song_list {
  width: 100%;
  max-width: 800px;
  margin: 0 20px;
  transition: 1s;
}
/* .list_collapsed {
  transform: rotateY(10deg);
} */
.detail {
  transition: 1s;
  width: 350px;
}

@media only screen and (max-width: 800px) {
  /* mobile */
  .list_collapsed {
    width: 0;
    visibility: hidden;
    margin: 0;
    padding: 0;
    transform: none;
  }

  .sHidden {
    opacity: 0;
    width: 0;
    overflow: hidden;
  }

  /* .detail {
    width: 80%;
  } */
}

@media only screen and (min-width: 800px) {
  /* desktop */
  .detail {
    /* transform: rotateY(-30deg); */
    margin: 0 20px;
  }
  .mContainer {
    margin: 50px;
  }
}

.detail_collapsed {
  width: 0;
  visibility: hidden;
  margin: 0;
}

.slide-fade-enter-active {
  transition: all 0.7s ease;
}
.slide-fade-leave-active {
  transition: all 0.8s ease;
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}
</style>
