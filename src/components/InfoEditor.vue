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
  </div>
</template>


<script>
import { createSong, getSongList } from "../javascript/db"

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
            songList: null
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
        }
    }
};
</script>

<style scoped>
</style>