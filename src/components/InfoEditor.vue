<template>
  <div>
    <!-- song create update form -->
    <div class="padding" v-if="!$parent.songInfo.id">
      <h2>Create Song</h2>
      <InfoForm
        :formData="songFormData"
        :formOption="songFormOptions"
        item-type="Song"
        @submitForm="submitSongForm"
        @submitExisting="submitExistingSong"
      ></InfoForm>
    </div>

    <div v-else>
      <SongListItem :song="$parent.songInfo" :hideBg="true"></SongListItem>

      <div class="padding">
        <h2>Sheet Detail</h2>
        <InfoForm
          :formData="sheetFormData"
          :formOption="sheetFormOptions"
          item-type="Sheet"
          @submitForm="submitSheetForm"
          @submitExisting="submitExistingSheet"
        >
          <input
            v-model="sheetFormData.title"
            name="sheetTitle"
            placeholder="Sheet title (Optional)"
            type="text"
          />
          <select v-model="sheetFormData.difficulity">
            <option :value="null" disabled>Select Difficulity...</option>
            <option
              v-for="diff in 10"
              :value="diff"
              :key="diff"
            >{{diff + ' - ' + ((diff > 9)?"Expert":((diff > 6)?"Hard":((diff > 3)?"Normal":"Easy")))}}</option>
          </select>
          <select v-model="sheetFormData.visualizerName" v-if="$parent.visualizerInstance">
            <option :value="null" disabled>Select Default Visualizer...</option>
            <option
              v-for="visualizer in $parent.visualizerInstance.visualizerArr"
              :value="visualizer"
              :key="visualizer"
            >{{visualizer}}</option>
          </select>
          <select v-model="sheetFormData.keys">
            <option :value="null" disabled>Select Key Number...</option>
            <option v-for="keys in [4,5,6,7,8]" :value="keys" :key="keys">{{keys + ' Key'}}</option>
          </select>
        </InfoForm>
      </div>
    </div>
  </div>
</template>


<script>
import { createSong, createSheet, getSongList, getSong, getSheetList } from "../javascript/db"
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
               srcMode: null,
               tags: null
            },
            songFormOptions:{
              isYoutubeMode: true,
              tab: "form",
              publicList: null,
              privateList: null,
              selected: null,
              isUpdate: false
            },
            sheetFormData: { 
               title: null, 
               difficulity: null,
               visualizerName: null,
               keys: null,
            },
            sheetFormOptions:{
              isYoutubeMode: true,
              tab: "form",
              publicList: null,
              privateList: null,
              selected: null,
              isUpdate: false
            },
        }
    },
    computed: {

    },
    watch: {
        '$parent.sheetInfo'(){
          let sheetInfo = this.$parent.sheetInfo;
          if(sheetInfo.id!=null){
            this.sheetFormData = this.$parent.sheetInfo;
            this.sheetFormOptions.isUpdate = true;
            this.sheetFormOptions.tab = 'form';
          }
        }
    },
    async mounted() {
        this.songFormOptions.publicList = await getSongList();
        this.songFormOptions.privateList = await getSongList(true);
    },
    methods: {
        async submitSongForm(){
            let songId = await createSong(this.songFormData)
            this.$parent.songInfo = await getSong(songId);
            this.getSheets()
        },
        submitExistingSong(){
            let selectedSong = this.songFormOptions.selected;
            if(selectedSong){
              this.$parent.songInfo = selectedSong;
              this.getSheets()
            }
        },
        async getSheets() {
          const songId = this.$parent.songInfo.id;
          this.sheetFormOptions.publicList = await getSheetList(songId);
          this.sheetFormOptions.privateList = await getSheetList(songId, true);
        },
        async submitSheetForm(){
            this.sheetFormData.song = this.$parent.songInfo.id;
            let sheetId = await createSheet(this.sheetFormData)
            this.$router.push('/editor/'+sheetId)
            this.$router.go()
        },
        submitExistingSheet(){
          let selectedSheet = this.sheetFormOptions.selected;
            if(selectedSheet){
              this.$router.push('/editor/'+selectedSheet.id)
              this.$router.go()
            }
        },
    }
};
</script>

<style scoped>
.padding {
  padding: 30px;
}
</style>