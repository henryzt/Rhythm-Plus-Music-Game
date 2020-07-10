<template>
  <div>
    <div>
      <div class="pageTitle">My Studio</div>
      <div style="margin-top:30px">
        <transition-group
          v-if="songList"
          appear
          tag="div"
          name="slide-in"
          :style="{ '--total': songList.length }"
        >
          <div v-for="(song,i) in songList" :key="song.id" :style="{'--i': i}">
            <SongListItem :song="song" @selected="selectedSong = $event"></SongListItem>
          </div>
        </transition-group>
      </div>
    </div>
    <!-- <div class="center_logo" v-else></div> -->
  </div>
</template>

<script>
import Button from '../components/Button.vue';
import SongListItem from '../components/SongListItem.vue';
import { getSheetList, getSongList } from "../javascript/db"


export default {
    name: 'MyStudio',
    components: {
        Button,
        SongListItem
    },
    data(){
        return {
            songList : null
        }
    },
    computed: {

    },
    watch: {

    },
    async mounted() {
      const userSheets = await getSheetList(null, true);
      console.log(userSheets)
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
