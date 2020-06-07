<template>
  <div>
    <!-- song create update form -->
    <div class="padding" v-if="!$parent.songInfo.id">
      <h2>Create Song</h2>
      <InfoForm
        :formData="songFormData"
        :formOption="songFormOptions"
        :isCreate="true"
        item-type="Song"
        @submitForm="submitSongForm"
        @submitExisting="submitExistingSong"
      ></InfoForm>
    </div>

    <div v-else>
      <SongListItem :song="$parent.songInfo" :hideBg="true"></SongListItem>

      <div class="padding"></div>
    </div>
  </div>
</template>


<script>
import { createSong, createSheet, getSongList, getSong } from "../javascript/db"
import SongListItem from '../components/SongListItem.vue';
import InfoForm from '../components/InfoForm.vue';

export default {
  name: 'InfoEditor',
  components:{
    SongListItem,
    InfoForm
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
              publicList: null,
              privateList: null,
              selected: null
            },
        }
    },
    computed: {

    },
    watch: {

    },
    async mounted() {
        this.songFormOptions.publicList = await getSongList();
        this.songFormOptions.privateList = await getSongList(true);
    },
    methods: {
        async submitSongForm(){
            let songId = await createSong(this.songFormData)
            this.$parent.songInfo = await getSong(songId);
        },
        submitExistingSong(){
            let selectedSong = this.songFormOptions.selected;
            if(selectedSong){
              this.$parent.songInfo = selectedSong;
            }
        }
    }
};
</script>

<style scoped>
.padding {
  padding: 30px;
}
</style>