<template>
  <div>
    <div>
      <div class="pageTitle">My Studio</div>
      <div style="margin-top:30px;white-space: nowrap;">
        <transition-group
          v-if="songAndSheetList"
          appear
          tag="div"
          name="slide-in"
          :style="{ '--total': songAndSheetList.length }"
        >
          <div v-for="(song,i) in songAndSheetList" :key="song.song.id" :style="{'--i': i}">
            <SongListItem
              :song="song.song"
              :sheets="song.sheets"
              :selected="true"
              @selected="selectedSong = $event"
            ></SongListItem>
          </div>
        </transition-group>
      </div>
    </div>
    <!-- <div class="center_logo" v-else></div> -->
    <Loading :show="(!songAndSheetList)" :delay="true">Fetching Your Creations...</Loading>
  </div>
</template>

<script>
import Button from '../components/Button.vue';
import SongListItem from '../components/SongListItem.vue';
import Loading from '../components/Loading.vue';
import { getSheetList, getSongList, getSong } from "../javascript/db"


export default {
    name: 'MyStudio',
    components: {
        Button,
        SongListItem,
        Loading
    },
    data(){
        return {
            songAndSheetList : null
        }
    },
    computed: {

    },
    watch: {

    },
    async mounted() {
      // TODO try catch
      const userSheets = await getSheetList(null, true);
      const songIdsArr = userSheets.map(e=>e.songId);
      const songIds = [...new Set(songIdsArr)]; // get unique
      console.log(userSheets, songIds)
      let songAndSheetList = []
      for(const songId of songIds){
        const song = await getSong(songId);
        const sheets = userSheets.filter(e=>e.songId===songId)
        songAndSheetList.push({song, sheets})
      }
      this.songAndSheetList = songAndSheetList;
    },
    methods: {
    beforeEnter: function (el) {
      el.style.opacity = 0
      el.style.height = 0
    },
    enter: function (el, done) {
      var delay = el.dataset.index * 150
      setTimeout(function () {
        Velocity(
          el,
          { opacity: 1, height: '1.6em' },
          { complete: done }
        )
      }, delay)
    },
    leave: function (el, done) {
      var delay = el.dataset.index * 150
      setTimeout(function () {
        Velocity(
          el,
          { opacity: 0, height: 0 },
          { complete: done }
        )
      }, delay)
    }
    }
};
</script>

<style scoped>
</style>
