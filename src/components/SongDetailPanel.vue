<template>
  <div class="song_item" @click="$emit('selected', song)" v-if="song">
    <div class="image">
      <img :src="song.image" />
    </div>
    <div class="detail">
      <div style="font-size:1.3em; font-weight: bold;">{{song.title}}</div>
      <div>{{song.artist}}</div>
    </div>
    <div style="background:rgba(0,0,0,0.2); padding: 20px 0; box-sizing:border-box; width: 100%">
      <div style="opacity:0.4">Select Sheet or Press Play</div>
      <div v-for="sheet in sheets" :value="sheet.id" :key="sheet.id">
        <div
          @click="selectedSheet = sheet"
          :class="{'sheet':true, 'active':selectedSheet==sheet}"
        >{{sheet.id}}</div>
      </div>
    </div>

    <div style="padding: 20px 0;">
      <Button text="Play!" @click="startSelected"></Button>
      <div class="text_button" @click="$emit('cancel')">Cancel</div>
    </div>
  </div>
</template>

<script>
import Button from './Button.vue';
export default {
    name:"SongDetailPanel",
    props: ["song", "sheets"],
      data(){
        return {
            selectedSheet: null
        }
    },
    components:{
      Button
    },
    computed: {
    },
    methods: {
        startSelected(){
            this.selectedSheet = this.selectedSheet ?? this.sheets[0];
            this.$router.push("/game/"+this.selectedSheet.id);
        }
    },
    watch:{
      song(){
        if(this.song)
          this.selectedSheet = null;
      },
      sheets(){
        if(this.song)
          this.selectedSheet = null;
      }
    }
}
</script>

<style scoped>
.song_item {
  position: sticky;
  top: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  cursor: pointer;
  width: 100%;
  max-width: 800px;
  margin: 10px auto;
  padding: 0;
  transition: 0.5s;
  text-align: center;
  overflow: hidden;
}
.song_item:hover {
  background: rgba(255, 255, 255, 0.35);
}
.detail {
  display: flex;
  flex-direction: column;
  padding: 20px;
}
.image {
  width: 100%;
  overflow: hidden;
}
.image img {
  width: 100%;
  max-height: 900px;
}
.sheet {
  margin-top: 10px;
  padding: 5px 0;
  width: 100%;
  transition: 1s;
}
.active {
  background: rgba(255, 255, 255, 0.3);
}
</style>
