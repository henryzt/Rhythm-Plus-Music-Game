<template>
  <div>
    <div v-if="songAndSheetList && songAndSheetList.length > 0">
      <div class="pageTitle">
        My Studio
        <div
          class="btn-action btn-dark"
          style="font-size: 18px; width: 160px;"
          @click="goToEditor"
        >
          <v-icon name="arrow-right" />
          <span>Go to Editor</span>
        </div>
      </div>
      <div class="mContainer">
        <SheetFilter
          :songs="songAndSheetList"
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
              :sheets="song.sheets"
              :selected="selectedSong === song"
              @selected="selectedSong = $event"
              @selectedSheet="goToSheet($event)"
            ></SongListItem>
          </div>
          <div
            class="btn-action btn-dark big-add"
            key="btn"
            @click="goToEditor"
          >
            <v-icon name="plus" scale="2" />
          </div>
        </transition-group>
      </div>
    </div>
    <div class="center_logo" v-else-if="!loading">
      <div class="pageTitle">My Studio</div>
      <div style="width: 100%; max-width: 600px; margin: auto;">
        <div>Create or import your favorite songs to play and share!</div>
        <div style="margin-top: 50px;">
          <div
            class="btn-action btn-dark"
            @click="
              $store.state.authed ? goToEditor() : $router.push('/account/')
            "
          >
            <v-icon name="arrow-right" />
            <span>Get Started</span>
          </div>
        </div>
      </div>
    </div>
    <Loading :show="loading" :delay="false">Fetching Your Creations...</Loading>
  </div>
</template>

<script>
import SongListItem from "../components/menus/SongListItem.vue";
import SheetFilter from "../components/menus/SheetFilter.vue";
import Loading from "../components/ui/Loading.vue";
import { getSheetList, getSongsInIdArray } from "../javascript/db";

export default {
  name: "MyStudio",
  components: {
    SongListItem,
    Loading,
    SheetFilter,
  },
  data() {
    return {
      selectedSong: null,
      songAndSheetList: null,
      songDisplayList: null,
      loading: true,
    };
  },
  computed: {},
  watch: {},
  async mounted() {
    // TODO try catch
    const userSheets = await getSheetList(null, true);
    const songIdsArr = userSheets.map((e) => e.songId);
    const songIds = [...new Set(songIdsArr)]; // get unique
    Logger.log(userSheets, songIds);
    let songs = await getSongsInIdArray(true, true, songIds);
    let songAndSheetList = [];
    for (const song of songs) {
      const sheets = userSheets.filter((e) => e.songId === song.id);
      song.sheets = sheets;
      songAndSheetList.push(song);
    }
    this.songAndSheetList = songAndSheetList;
    this.loading = false;
  },
  methods: {
    goToEditor() {
      this.$router.push("/editor/");
    },
    goToSheet(sheet) {
      this.$router.push("/editor/" + sheet.id);
    },
  },
};
</script>

<style scoped>
.mContainer {
  /* perspective: 100em; */
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: 2s;
  white-space: nowrap;
  margin-top: 30px;
  margin-bottom: 300px !important;
  max-width: 780px;
  margin-left: auto;
  margin-right: auto;
}
.fa-icon {
  vertical-align: middle;
  margin-right: 5px;
}
.big-add {
  width: 100%;
  line-height: 80px;
  max-width: 100%;
  box-sizing: border-box;
}
</style>
