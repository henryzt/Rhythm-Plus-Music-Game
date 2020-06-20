<template>
  <div>
    <div class="text">
      Song Visibility
      <br />
      <select v-model="songInfo.visibility">
        <option value="public">Public</option>
        <option value="unlisted">Anyone with the link</option>
        <option value="private">Private</option>
      </select>
      <br />
      <br />
    </div>

    <div class="text">
      Sheet Visibility
      <br />
      <select v-model="sheetInfo.visibility">
        <option value="public">Public</option>
        <option value="unlisted">Anyone with the link</option>
        <option value="private">Private</option>
      </select>
    </div>

    <div style="margin:20px">
      <div>Total Length - {{sheetInfo.length.toFixed(2)}} s</div>
      <div>Note Count - {{sheetInfo.noteCount}}</div>
    </div>

    <div class="btn-action btn-dark" style="display:inline-block" @click="$parent.close()">Cancel</div>
    <div class="btn-action btn-dark" style="display:inline-block" @click="publish">Publish</div>
  </div>
</template>

<script>
import { updateSong, updateSheet } from "../javascript/db"

export default {
    name: "Publish",
    computed: {
        vm(){
            return this.$parent.$parent;
        },
        songInfo(){
            return this.vm.songInfo;
        },
        sheetInfo(){
            return this.vm.sheetInfo;
        }
    },
    methods:{
        async publish(){
          this.vm.loading = true;
          try{
            this.$parent.close()
            await updateSong({id: this.songInfo.id, visibility: this.songInfo.visibility})
            await updateSheet({id: this.sheetInfo.id, visibility: this.sheetInfo.visibility})
            this.$store.state.alert.error("Publish settings changed successfully")
          }catch(err){
            this.$store.state.alert.error("An error occurred, please try again", 5000)
          }
          this.vm.loading = false;
        }
    }

}
</script>

<style scoped>
.text {
  text-align: left;
  margin: auto;
  width: 240px;
}
</style>