<template>
  <div
    class="song_item"
    :class="{'song_item_bg':!hideBg, 'song_item_small': hideBg}"
    ref="item"
    @click="$emit('selected', song)"
    v-if="song"
  >
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
    props: ["song", "hideBg"],
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
  padding: 0;
  display: flex;
  align-items: center;
  z-index: 1000;
  margin: 10px;
  width: fit-content;
}

.song_item_bg {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  width: 100%;
  max-width: 800px;
  margin: 10px auto;
  transition: 0.5s;
  overflow: hidden;
  cursor: pointer;
}
.song_item_bg:hover {
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

.song_item_small .image {
  width: 100px;
  height: 60px;
  min-width: 0px;
}
.song_item_small {
  font-size: 0.8em;
}
@media only screen and (max-width: 1000px) {
  .image {
    width: 150px;
    min-width: 150px;
    height: 90px;
  }
}
@media only screen and (max-width: 1300px) {
  .song_item_bg:hover {
    transform: none;
  }
}
</style>
