<template>
  <div class="padding" style="height:100%;overflow: scroll;">
    <!-- song create update form -->
    <div v-if="!$parent.songInfo.id || songFormOptions.isUpdate">
      <h2 v-if="songFormOptions.isUpdate">Update Song Detail</h2>
      <h2 v-else>Create Song</h2>
      <InfoForm
        :formData="songFormData"
        :formOption="songFormOptions"
        item-type="Song"
        @submitForm="submitSongForm"
        @submitExisting="submitExistingSong"
      ></InfoForm>
      <div
        v-if="songFormOptions.isUpdate"
        class="switch_tab"
        @click="songFormOptions.isUpdate=false"
      >Cancel</div>
    </div>

    <div v-if="$parent.songInfo.id">
      <div>
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
          <select v-model="sheetFormData.difficulty">
            <option :value="null" disabled>Select difficulty...</option>
            <option
              v-for="diff in 10"
              :value="diff"
              :key="diff"
            >{{diff + ' - ' + ((diff > 9)?"Expert":((diff > 6)?"Hard":((diff > 3)?"Normal":"Easy")))}}</option>
          </select>
          <select
            v-model="sheetFormData.visualizerName"
            v-if="$parent.songInfo.srcMode=='url' && $parent.visualizerInstance"
          >
            <option :value="null" disabled>Select Default Visualizer...</option>
            <option
              v-for="(idx, visualizer) in $parent.visualizerInstance.visualizerArr"
              :value="idx"
              :key="idx"
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
import { createSong, createSheet, getSongList, getSong, getSheetList, updateSong, updateSheet } from "../javascript/db"
import InfoForm from '../components/InfoForm.vue';

export default {
  name: 'InfoEditor',
  components:{
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
               difficulty: null,
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
          this.$parent.loading = true
          try{
            if(this.songFormOptions.isUpdate){
              await updateSong(this.songFormData);
              this.$router.go();
            }else{
              let songId = await createSong(this.songFormData)
              this.$parent.songInfo = await getSong(songId);
              this.getSheets()
            }
          }catch(err){
            console.error(err)
          }
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
            this.$parent.loading = true
            try{
              if(this.sheetFormOptions.isUpdate){
                await updateSheet(this.sheetFormData)
              }else{
                let sheetId = await createSheet(this.sheetFormData)
                this.$router.push('/editor/'+sheetId)
              }
              this.$router.go();
            }catch(err){
              console.error(err)
            }
        },
        submitExistingSheet(){
          let selectedSheet = this.sheetFormOptions.selected;
            if(selectedSheet){
              this.$parent.loading = true
              this.$router.push('/editor/'+selectedSheet.id+'/')
              this.$router.go()
            }
        },
        async openSongUpdate(){
          this.songFormOptions.tab = "form";
          this.songFormOptions.isUpdate = true;
          this.songFormData = await getSong(this.$parent.songInfo.id);
          if(this.songFormData.image && this.songFormData.image.includes("img.youtube.com")){
            this.songFormData.image = null
          }
        }
    }
};
</script>

<style>
.padding {
  padding: 30px;
}
.switch_tab {
  text-align: center;
  opacity: 0.5;
  font-size: 14px;
  margin: 10px;
  cursor: pointer;
}
</style>