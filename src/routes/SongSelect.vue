<template>
  <div>
    <PageBackground songSrc="songs/select.mp3"></PageBackground>

    <div style="overflow:scroll">
      <div class="song_list">
        <div v-for="song in songList" :key="song.id">
          <SongListItem :song="song" @selected="selectedSong = $event.id"></SongListItem>
        </div>
      </div>
      <form @submit.prevent="submitForm">
        <select id="songSelect" v-model="selectedSong" style="width:150px">
          <option
            v-for="song in songList"
            :value="song.id"
            :key="song.id"
          >{{song.title + " - " + song.artist}}</option>
        </select>
        <br />
        <select id="sheetSelect" v-model="selectedSheet" style="width:150px">
          <option v-for="sheet in sheetList" :value="sheet.id" :key="sheet.id">{{sheet.id}}</option>
        </select>
        <br />
        <input type="submit" value="Start Game!" />
      </form>
    </div>
  </div>
</template>


<script>
import PageBackground from '../components/PageBackground.vue';
import SongListItem from '../components/SongListItem.vue';
import { getSheetList, getSongList } from "../javascript/db"


export default {
  name: 'SongSelect',
  components:{
      PageBackground,
      SongListItem
  },
  data(){
        return {
            songList: null,
            sheetList: null,
            selectedSong: null,
            selectedSheet: null
        }
    },
    computed: {

    },
    watch: {
      async selectedSong(){
        this.sheetList = await getSheetList(this.selectedSong);
      }
    },
    async mounted() {
        this.songList = await getSongList();
    },
    methods: {
        submitForm(){
            this.$router.push("/game/"+this.selectedSheet);
        }
    }
};
</script>

<style scoped>
</style>