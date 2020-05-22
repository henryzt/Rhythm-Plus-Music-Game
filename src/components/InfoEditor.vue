<template>
  <div>
    <form @submit.prevent="submitForm">
      <input v-model="formData.title" name="songTitle" placeholder="Song title" />
      <br />
      <input v-model="formData.artist" name="artist" placeholder="Artist" />
      <br />
      <input v-model="formData.image" name="image" placeholder="Image URL (Optional)" />
      <br />
      <input v-model="formData.youtubeId" name="youtubeId" placeholder="Youtube ID" />
      <br />
      <input type="submit" />
    </form>

    <form @submit.prevent="submitSheetForm">
      <select id="songSelect" v-model="selectedSong" style="width:130px">
        <option v-for="song in songList" :value="song" :key="song.id">{{song.title}}</option>
      </select>
      <br />
      <br />
      <input type="submit" />
    </form>
  </div>
</template>


<script>
import { createSong, createSheet, getSongList } from "../javascript/db"

export default {
  name: 'InfoEditor',
  components:{
  },
  data(){
        return {
           formData: { 
               title: null, 
               artist: null, 
               image: null, 
               youtubeId: null, 
               url: null 
            },
            songList: null,
            selectedSong: null,
            selectedSheet: null
        }
    },
    computed: {

    },
    watch: {

    },
    async mounted() {
        this.songList = await getSongList();

    },
    methods: {
        submitForm(){
            createSong(this.formData)
        },
        submitSheetForm(){
            let sheetInfo = {};
            sheetInfo.song = this.selectedSong.id;
            createSheet(sheetInfo)
        }
    }
};
</script>

<style scoped>
</style>