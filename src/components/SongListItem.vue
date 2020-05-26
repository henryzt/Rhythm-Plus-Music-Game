<template>
  <div class="song_item" ref="item" @click="$emit('selected', song)" v-if="song">
    <div class="image">
      <img :src="song.image" />
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
    data() {
        return {
        }
    },
    mounted(){
    },
    computed: {
    },
}
</script>

<style scoped>
.song_item {
  display: flex;
  align-items: center;
  padding: 5px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  cursor: pointer;
  width: 100%;
  max-width: 800px;
  margin: 10px auto;
  padding: 0;
  transition: 0.5s;
  overflow: hidden;
}
.song_item:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(1.2);
  z-index: 500;
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
  min-width: 200px;
}
.image img {
  height: 100%;
}
@media only screen and (max-width: 1000px) {
  .image {
    width: 150px;
    min-width: 150px;
    height: 90px;
  }
}
@media only screen and (max-width: 1300px) {
  .song_item:hover {
    transform: none;
  }
}
</style>
