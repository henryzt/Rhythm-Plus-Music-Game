<template>
  <div>
    <PageBackground songSrc="/songs/select.mp3"></PageBackground>

    <div style="font-size:2.3em; font-weight: bold;text-align:center;padding:40px;">Song Select</div>

    <div class="mContainer">
      <div class="song_list" :class="{'list_collapsed': selectedSong}" v-if="songList">
        <transition-group appear tag="div" name="slide-in" :style="{ '--total': songList.length }">
          <div v-for="(song,i) in songList" :key="song.id" :style="{'--i': i}">
            <SongListItem :song="song" @selected="selectedSong = $event"></SongListItem>
          </div>
        </transition-group>
      </div>

      <div :class="{'detail':true,'detail_collapsed': !selectedSong}">
        <transition name="slide-fade">
          <SongDetailPanel
            v-if="selectedSong"
            :song="selectedSong"
            :sheets="sheetList"
            @cancel="selectedSong=null"
          ></SongDetailPanel>
        </transition>
      </div>
    </div>

    <Loading :show="!songList && delayedLoading">Fetching Latest Songs...</Loading>
  </div>
</template>


<script>
import PageBackground from '../components/PageBackground.vue';
import SongListItem from '../components/SongListItem.vue';
import SongDetailPanel from '../components/SongDetailPanel.vue';
import Loading from '../components/Loading.vue';
import { getSheetList, getSongList } from "../javascript/db"


export default {
  name: 'SongSelect',
  components:{
      PageBackground,
      SongListItem,
      SongDetailPanel,
      Loading
  },
  data(){
        return {
            songList: null,
            sheetList: null,
            selectedSong: null,
            delayedLoading: false
        }
    },
    computed: {

    },
    watch: {
      async selectedSong(){
        if(this.selectedSong)
          this.sheetList = await getSheetList(this.selectedSong.id);
      }
    },
    async mounted() {
        this.songList = await getSongList();
        setTimeout(() => {
          this.delayedLoading = true
        }, 1000);
    },
    methods: {
    }
};
</script>

<style scoped>
.mContainer {
  perspective: 60em;
  display: flex;
  justify-content: center;
  transition: 2s;
  white-space: nowrap;
}
.song_list {
  width: 100%;
  max-width: 800px;
  margin: 0 20px;
  transition: 1s;
}
.list_collapsed {
  transform: rotateY(10deg);
}
.detail {
  transition: 1s;
  width: 300px;
}

@media only screen and (max-width: 800px) {
  /* mobile */
  .list_collapsed {
    width: 0;
    visibility: hidden;
    margin: 0;
    padding: 0;
    transform: none;
  }

  .detail {
    width: 80%;
  }
}

@media only screen and (min-width: 800px) {
  /* desktop */
  .detail {
    transform: rotateY(-30deg);
    margin: 0 20px;
  }
  .mContainer {
    margin: 50px;
  }
}

.detail_collapsed {
  width: 0;
  visibility: hidden;
  margin: 0;
}

.slide-fade-enter-active {
  transition: all 0.7s ease;
}
.slide-fade-leave-active {
  transition: all 0.8s ease;
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}

/* ref https://codepen.io/shshaw/pen/YLmdxz */

.list-enter-active,
.list-leave-active {
  transition: all 1s;
}
.list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(30px);
}

.slide-in-move {
  transition: opacity 0.5s linear, transform 0.5s ease-in-out;
}
.slide-in-leave-active {
  transition: opacity 0.4s linear, transform 0.4s cubic-bezier(0.5, 0, 0.7, 0.4);
  transition-delay: calc(0.2s * (var(--total) - var(--i)));
}
.slide-in-enter-active {
  transition: opacity 0.5s linear, transform 0.5s cubic-bezier(0.2, 0.5, 0.1, 1);
  transition-delay: calc(0.2s * var(--i));
}
.slide-in-enter,
.slide-in-leave-to {
  opacity: 0;
}
.slide-in-enter {
  transform: translateX(-1em);
}
.slide-in-leave-to {
  transform: translateX(1em);
}
</style>