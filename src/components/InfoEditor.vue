<template>
  <div>
    <!-- song create update form -->
    <div v-if="!$parent.songInfo.id">
      <h2>Create Song</h2>
      <form @submit.prevent="submitForm" v-if="songFormOptions.tab==='form'">
        <input v-model="songFormData.title" name="songTitle" placeholder="Song title" type="text" />
        <input v-model="songFormData.artist" name="artist" placeholder="Artist" type="text" />
        <select id="songSelect" v-model="songFormData.srcMode">
          <option :value="null" disabled>Select music source...</option>
          <option value="youtube">Youtube Video</option>
          <option value="url">MP3 File URL</option>
        </select>
        <!-- youtube mode -->
        <div v-if="songFormData.srcMode==='youtube'">
          <input
            v-model="songFormData.youtubeId"
            name="youtubeId"
            placeholder="Youtube ID"
            type="text"
          />
          <input
            v-model="songFormData.image"
            name="image"
            placeholder="Image URL (Optional)"
            type="text"
          />
        </div>
        <!-- url mode -->
        <div v-if="songFormData.srcMode==='url'">
          <input
            v-model="songFormData.url"
            name="url"
            placeholder="MP3 URL (https://**.mp3)"
            type="text"
          />
          <input v-model="songFormData.image" name="image" placeholder="Image URL" type="text" />
        </div>
        <!-- todo -->
        <!-- <div class="checkboxes">
          <label class="cb_container">
            Is Original
            <input type="checkbox" v-model="songFormData.isOriginal" />
            <span class="checkmark"></span>
          </label>
          <label class="cb_container">
            Is No Copyright
            <input type="checkbox" v-model="songFormData.isNC" />
            <span class="checkmark"></span>
          </label>
        </div>-->
        <input type="submit" value="Create Song" />
        <div class="switch_tab" @click="songFormOptions.tab='choose'">or Select Existing Song</div>
      </form>

      <!-- existing song chooser -->
      <form @submit.prevent="submitExistingSong" v-if="songFormOptions.tab==='choose'">
        <select id="songSelect" v-model="songFormOptions.selectedSong">
          <option :value="null" disabled hidden>Select an existing song...</option>
          <option disabled>Public Songs</option>
          <option
            v-for="song in songFormOptions.songList"
            :value="song"
            :key="song.id"
          >{{song.title}}</option>
          <option disabled>Your Unpublished Songs</option>
          <option
            v-for="song in songFormOptions.privateSongList"
            :value="song"
            :key="song.id"
          >{{song.title}}</option>
        </select>
        <br />
        <input type="submit" value="Done" />
        <div class="switch_tab" @click="songFormOptions.tab='form'">or Create New Song</div>
      </form>
    </div>

    <div></div>
  </div>
</template>


<script>
import { createSong, createSheet, getSongList, getSong } from "../javascript/db"

export default {
  name: 'InfoEditor',
  components:{
  },
  data(){
        return {
           songFormData: { 
               title: null, 
               artist: null, 
               image: null, 
               youtubeId: null, 
               url: null ,
               srcMode: null
            },
            songFormOptions:{
              isYoutubeMode: true,
              tab: "form",
              songList: null,
              privateSongList: null,
              selectedSong: null
            },
        }
    },
    computed: {

    },
    watch: {

    },
    async mounted() {
        this.songFormOptions.songList = await getSongList();
        this.songFormOptions.privateSongList = await getSongList(true);
    },
    methods: {
        async submitForm(){
            let songId = await createSong(this.songFormData)
            this.$parent.songInfo = await getSong(songId);
        },
        submitExistingSong(){
            let selectedSong = this.songFormOptions.selectedSong;
            if(selectedSong){
              this.$parent.songInfo = selectedSong;
            }
        }
    }
};
</script>

<style scoped>
.cb_container {
  font-size: 15px;
  margin-bottom: 10px;
  margin-top: 10px;
}
.checkboxes {
  background-color: rgb(109, 109, 109);
  padding: 6px 15px;
  margin: 3px 0;
}
.switch_tab {
  text-align: center;
  opacity: 0.5;
  font-size: 14px;
  margin: 10px;
  cursor: pointer;
}
</style>