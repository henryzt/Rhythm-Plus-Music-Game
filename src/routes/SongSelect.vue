<template>
  <div>
    <v-bar class="fullPage">
      <div class="pageTitle">Song Select</div>

      <div class="cat flex_hori">
        <div
          class="cat_tab"
          :class="{ active: tab == 'recom' }"
          @mouseenter="handleHover"
          @click="changeTab('recom')"
        >
          Recommended
        </div>
        <div
          class="cat_tab"
          :class="{ active: tab == 'new' }"
          @mouseenter="handleHover"
          @click="changeTab('new')"
        >
          New
        </div>
        <div
          class="cat_tab"
          :class="{ active: tab == 'all' }"
          @mouseenter="handleHover"
          @click="changeTab('all')"
        >
          All Songs
        </div>
      </div>

      <div class="reflow1">
        <div class="new-info flex_hori" v-if="tab == 'new'">
          <v-icon name="info-circle" style="padding-right: 10px"></v-icon>
          <div>
            We cannot yet guarantee the quality of new sheets, accurate beatmaps
            will be selected to the recommended songs periodically.
          </div>
        </div>
      </div>

      <div class="list_and_detail">
        <!-- song list -->
        <div
          class="song_list_wrapper"
          :class="{ list_collapsed: selectedSong }"
        >
          <div class="reflow2 song_list">
            <div v-if="tab == 'recom'">
              <div
                class="btn-action btn-dark btn-more"
                @click="changeTab('new')"
              >
                More >
              </div>
              <div class="subtitle">Latest</div>

              <SongList
                class="latest_song_list"
                :sorter="false"
                :songs="latestSongList"
                @selected="selectedSong = $event"
              ></SongList>

              <div class="subtitle" style="padding-bottom: 20px">For you</div>
            </div>
          </div>

          <SongList
            class="song_list"
            :songs="songList"
            @selected="selectedSong = $event"
            ref="list"
          >
            <template v-slot:top>
              <!-- tutorial button -->
              <div
                class="btn-action btn-dark big-add"
                key="btn0"
                @click="$router.push('/tutorial/')"
              >
                <v-icon class="add-icon" name="question-circle" scale="2" />
                <div style="font-size: 1.2em">Play Tutorial</div>
              </div>
            </template>
            <template v-slot:bottom>
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
            </template>
          </SongList>
        </div>

        <!-- detail panel -->
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

      <!-- loading -->
      <Loading :show="!songList || songList.length === 0" :delay="true"
        >Fetching Latest Songs...</Loading
      >

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
            style="width: 100%"
            height="500"
            frameborder="0"
            marginheight="0"
            marginwidth="0"
            >Loading…</iframe
          >
        </template>
      </Modal>
    </v-bar>
  </div>
</template>

<script>
import SongDetailPanel from "../components/menus/SongDetailPanel.vue";
import SongList from "../components/menus/SongList.vue";
import Loading from "../components/ui/Loading.vue";
import Modal from "../components/ui/Modal.vue";
import {
  getSheetList,
  getSongListCached,
  getPlaylist,
  getSongsInIdArray,
} from "../javascript/db";
import "vue-awesome/icons/lightbulb";
import "vue-awesome/icons/question-circle";
import { logEvent } from "../helpers/analytics";
import "vue-awesome/icons/info-circle";
import smoothReflow from "vue-smooth-reflow";

export default {
  name: "SongSelect",
  components: {
    SongDetailPanel,
    Loading,
    Modal,
    SongList,
  },
  data() {
    return {
      allSongs: null,
      songList: null,
      latestSongList: null,
      sheetList: null,
      selectedSong: null,
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
    async tab() {
      if (this.tab == "recom") {
        await this.filterRecommended(true);
        this.$refs.list.sort("title");
      } else if (this.tab == "new") {
        await this.getNewSongs();
        this.$refs.list.sort("date");
      } else if (this.tab == "all") {
        await this.getAllSongs();
        this.songList = this.allSongs;
        this.$refs.list.sort("title");
      }
    },
  },
  mixins: [smoothReflow],
  mounted() {
    this.filterRecommended(true);
    const transitionEvent = {
      selector: "div",
    };
    this.$smoothReflow([
      {
        el: ".reflow1",
        transitionEvent,
      },
      {
        el: ".reflow2",
        transitionEvent,
      },
    ]);
  },
  methods: {
    changeTab(tab) {
      this.tab = tab;
      this.$store.state.audio.playEffect("ui/slide2");
    },
    handleHover() {
      this.$store.state.audio.playHoverEffect("ui/ta");
    },
    async getAllSongs() {
      if (!this.allSongs) this.allSongs = await getSongListCached();
    },
    async filterRecommended(getRecommened) {
      await this.getAllSongs();
      const playlist = await getPlaylist("recommended");
      if (!this.latestSongList) {
        this.latestSongList = this.songListSortByDate().slice(-3);
      }
      if (getRecommened) {
        this.songList = this.allSongs.filter((e) =>
          playlist.items.includes(e.id)
        );
      } else {
        this.songList = this.allSongs.filter(
          (e) => !playlist.items.includes(e.id)
        );
      }
    },
    async getNewSongs() {
      await this.getAllSongs();
      this.songList = this.songListSortByDate().slice(-35);
    },
    songListSortByDate() {
      if (!this.allSongs) return null;
      return [...this.allSongs].sort(
        (a, b) => a.dateUpdated.seconds - b.dateUpdated.seconds
      );
    },
    getPlaylistSongs(playlistId) {
      getPlaylist(playlistId).then(async (res) => {
        const list = res.items;
        this.songList = await getSongsInIdArray(false, false, list);
      });
    },
  },
};
</script>

<style scoped>
.subtitle {
  font-size: 2em;
}

.song_list {
  min-width: 300px;
  margin: 0 20px;
}

.latest_song_list {
  margin: 0;
  margin-bottom: 39px !important;
  clear: right;
}

.song_list_wrapper {
  transition: 1s;
  z-index: 100;
  min-width: 350px;
  max-width: 800px;
  width: 100%;
}

.list_and_detail {
  display: flex;
  justify-content: center;
}

.detail {
  transition: 1s;
  width: 350px;
}

.btn-more {
  float: right;
  margin: 0;
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
  opacity: 0.6;
  color: white;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}

.cat_tab:hover {
  opacity: 0.8;
}

.active {
  opacity: 0.9;
  border-bottom: 2px solid white;
}

.new-info {
  max-width: 500px;
  margin: 10px auto;
  opacity: 0.5;
  text-align: left;
  font-size: 14px;
  width: 90%;
}

@media only screen and (max-width: 800px) {
  /* mobile */
  .list_collapsed {
    width: 0;
    visibility: hidden;
    margin: 0;
    padding: 0;
    min-width: 0;
    transform: translateX(-120vw);
  }
}

@media only screen and (min-width: 800px) {
  /* desktop */
  .detail {
    /* transform: rotateY(-30deg); */
    margin: 0 20px;
  }
  .list_and_detail {
    margin: 50px;
  }
  .subtitle {
    font-size: 3em;
  }
  .btn-more {
    margin-top: 10px;
  }
}

@media only screen and (max-width: 1000px) {
  /* tablet */
  .list_and_detail {
    margin: 30px 0;
  }
}

.detail_collapsed {
  width: 0;
  visibility: hidden;
  margin: 0;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.7s ease;
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
</style>
