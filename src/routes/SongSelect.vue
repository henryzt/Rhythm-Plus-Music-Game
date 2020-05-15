<template>
  <div>
    <PageBackground songSrc="songs/select.mp3"></PageBackground>

    <div style="font-size:2.3em; font-weight: bold;text-align:center;padding:40px;">Song Select</div>

    <div class="mContainer">
      <div class="song_list" :class="{'list_collapsed': selectedSong}">
        <div v-for="song in songList" :key="song.id">
          <SongListItem :song="song" @selected="selectedSong = $event"></SongListItem>
        </div>
      </div>

      <div :class="{'detail':true,'detail_collapsed': !selectedSong}">
        <transition name="slide-fade">
          <SongDetailPanel
            v-if="selectedSong"
            :song="selectedSong"
            :sheets="sheetList"
            @cancel="selectedSong=null"
          ></SongDetailPanel>
        </transition>
      </div>
    </div>
  </div>
</template>


<script>
import PageBackground from '../components/PageBackground.vue';
import SongListItem from '../components/SongListItem.vue';
import SongDetailPanel from '../components/SongDetailPanel.vue';
import { getSheetList, getSongList } from "../javascript/db"


export default {
  name: 'SongSelect',
  components:{
      PageBackground,
      SongListItem,
      SongDetailPanel
  },
  data(){
        return {
            songList: null,
            sheetList: null,
            selectedSong: null
        }
    },
    computed: {

    },
    watch: {
      async selectedSong(){
        this.sheetList = await getSheetList(this.selectedSong.id);
      }
    },
    async mounted() {
        this.songList = await getSongList();
    },
    methods: {
    }
};
</script>

<style scoped>
.mContainer {
  perspective: 60em;
  display: flex;
  justify-content: center;
  transition: 2s;
  white-space: nowrap;
}
.song_list {
  width: 100%;
  max-width: 800px;
  margin: 0 20px;
  transition: 1s;
}
.list_collapsed {
  transform: rotateY(10deg);
}
.detail {
  transition: 1s;
  width: 300px;
}

@media only screen and (max-width: 800px) {
  /* mobile */
  .list_collapsed {
    width: 0;
    visibility: hidden;
    margin: 0;
    padding: 0;
  }

  .detail {
    width: 80%;
  }
}

@media only screen and (min-width: 800px) {
  /* desktop */
  .detail {
    transform: rotateY(-30deg);
    margin: 0 20px;
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