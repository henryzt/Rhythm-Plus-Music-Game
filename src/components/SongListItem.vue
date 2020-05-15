<template>
  <div class="song_item" @click="$emit('selected', song)" v-if="song">
    <div class="image">
      <img :src="imgSrc" />
    </div>
    <div class="detail">
      <div style="font-size:1.3em; font-weight: bold;">{{song.title}}</div>
      <div>{{song.artist}}</div>
    </div>
  </div>
</template>

<script>
export default {
    name:"SongListItem",
    props: ["song"],
    computed: {
        imgSrc(){
            return this.song.youtubeId ? `https://img.youtube.com/vi/${this.song.youtubeId}/mqdefault.jpg` : this.song.image;
        }
    }
}
</script>

<style scoped>
.song_item {
  display: flex;
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
}
.song_item:hover {
  transform: scale(1.2);
  z-index: 50;
}
.detail {
  display: flex;
  flex-direction: column;
  padding: 20px;
  text-align: left;
}
.image {
  width: 200px;
  height: 120px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.473);
  text-align: center;
}
.image img {
  height: 100%;
}
</style>
