<template>
  <div>
    <PageBackground songSrc="songs/select.mp3"></PageBackground>

    <div style="font-size:2.3em; font-weight: bold;text-align:center;padding:40px;">Song Select</div>

    <div class="mContainer">
      <div class="song_list">
        <div v-for="song in songList" :key="song.id">
          <SongListItem :song="song" @selected="selectedSong = $event"></SongListItem>
        </div>
      </div>

      <div v-if="selectedSong">
        <SongDetailPanel :song="selectedSong" :sheets="sheetList"></SongDetailPanel>
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
  perspective: 30em;
  display: flex;
  justify-content: space-evenly;
  transition: 2s;
}
.song_list {
  width: 100%;
  max-width: 800px;
  margin: 0 20px;
}
</style>