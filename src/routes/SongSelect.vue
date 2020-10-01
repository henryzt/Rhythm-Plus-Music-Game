<template>
  <div>
    <v-bar class="fullPage">
      <div class="pageTitle">Song Select</div>

      <div class="cat flex_hori">
        <div
          class="cat_tab"
          :class="{ active: tab == 'recom' }"
          @click="tab = 'recom'"
        >
          Recommended
        </div>
        <div
          class="cat_tab"
          :class="{ active: tab == 'all' }"
          @click="tab = 'all'"
        >
          All Songs
        </div>
      </div>

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
            <!-- suggest song button -->
            <div
              :class="{ sHidden: selectedSong }"
              class="btn-action btn-dark big-add"
              key="btn0"
              @click="$router.push('/tutorial/')"
            >
              <v-icon class="add-icon" name="question-circle" scale="2" />
              <div style="font-size: 1.2em;">Play Tutorial</div>
            </div>
            <!-- song lists -->
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
            <!-- create song button -->
            <div
              class="btn-action btn-dark big-add"
              key="btn1"
              @click="$router.push('/studio/')"
            >
              <v-icon class="add-icon" name="plus" scale="2" />
              <div>Create or Import a Song</div>
            </div>
            <!-- suggest song button -->
            <div
              class="btn-action btn-dark big-add"
              key="btn2"
              @click="$refs.suggest.show()"
            >
              <v-icon class="add-icon" name="lightbulb" scale="2" />
              <div>Suggest a Song</div>
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
    </v-bar>

    <!-- song suggestion modal -->
    <Modal
      ref="suggest"
      :showOk="false"
      cancelText="Done"
      titleText="Suggest a Song"
    >
      <template>
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSf4nNnTn0vmYjWYbq3TeC6epuN8xkEhxlWONrtIMMZbgLJ38w/viewform?embedded=true"
          style="width: 100%;"
          height="500"
          frameborder="0"
          marginheight="0"
          marginwidth="0"
          >Loading…</iframe
        >
      </template>
    </Modal>
  </div>
</template>

<script>
import SongListItem from "../components/menus/SongListItem.vue";
import SongDetailPanel from "../components/menus/SongDetailPanel.vue";
import SheetFilter from "../components/menus/SheetFilter.vue";
import Loading from "../components/ui/Loading.vue";
import Modal from "../components/ui/Modal.vue";
import {
  getSheetList,
  getSongList,
  getPlaylist,
  getSongsInIdArray,
} from "../javascript/db";
import "vue-awesome/icons/lightbulb";
import "vue-awesome/icons/question-circle";
import { logEvent } from "../helpers/analytics";

export default {
  name: "SongSelect",
  components: {
    SongListItem,
    SongDetailPanel,
    Loading,
    SheetFilter,
    Modal,
  },
  data() {
    return {
      songList: null,
      songDisplayList: [],
      sheetList: null,
      selectedSong: null,
      recommendedList: [],
      tab: "recom",
    };
  },
  computed: {},
  watch: {
    async selectedSong() {
      this.sheetList = null;
      if (this.selectedSong) {
        this.sheetList = await getSheetList(this.selectedSong.id);
        logEvent("song_selected", { id: this.selectedSong.id });
      }
    },
    tab() {
      if (this.tab == "recom") {
        this.getPlaylistSongs();
      } else if (this.tab == "all") {
        this.getAllSongs();
      }
    },
  },
  mounted() {
    this.getPlaylistSongs();
  },
  methods: {
    getAllSongs() {
      getSongList()
        .then((res) => {
          this.songList = res;
        })
        .catch((err) => {
          Logger.error(err);
        });
    },
    getPlaylistSongs() {
      getPlaylist("recommended").then(async (res) => {
        const list = res.items;
        this.songList = await getSongsInIdArray(false, false, list);
      });
    },
  },
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

.big-add {
  width: 100%;
  line-height: 80px;
  max-width: 100%;
  box-sizing: border-box;
  position: relative;
  padding-left: 10%;
}

.add-icon {
  position: absolute;
  left: 10%;
  top: 30px;
}

.cat {
  margin: auto;
  width: fit-content;
}

.cat_tab {
  margin: 10px;
  font-weight: bolder;
  padding-bottom: 5px;
  transition: all 0.2s;
  opacity: 0.7;
  color: white;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}

.active {
  opacity: 0.9;
  border-bottom: 2px solid white;
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
