<template>
  <div>
    <!-- visualizer canvas -->
    <Visualizer ref="visualizer"></Visualizer>

    <div class="toolbar blurBackground">
      <div class="logo">R+ Sheet Editor</div>
      <div style="flex-grow:1"></div>
      <div style="display:flex" :class="{disabled:!initialized}">
        <a href="#" @click.prevent="newEditor">New</a>
        <a href="#">Save</a>
        <a href="#" @click.prevent="togglePlayMode">{{playMode?"Edit":"Test"}}</a>
        <a href="#">Publish</a>
      </div>
    </div>

    <div class="main">
      <div class="column side left blurBackground">
        <info-editor style="flex-grow:1" ref="info"></info-editor>
        <SongListItem
          v-if="songInfo.id"
          :song="songInfo"
          :hideBg="true"
          @selected="updateSongDetail"
          style="cursor:pointer"
        ></SongListItem>
        <div v-show="gameSheetInfo" v-if="srcMode=='youtube'&&youtubeId">
          <Youtube
            id="ytPlayer_editor"
            style="min-height:240px"
            ref="youtube"
            width="100%"
            height="240px"
            :video-id="youtubeId"
            :player-vars="{ rel: 0, playsinline: 1, disablekb: 1, autoplay: 0 }"
            @playing="songLoaded"
            @error="ytError"
            @paused="ytPaused"
            @ended="ytPaused"
          ></Youtube>
        </div>
      </div>

      <div class="column middle" :class="{disabled:!initialized}">
        <!-- game wrapper -->
        <div class="gameWrapper" ref="wrapper">
          <canvas ref="mainCanvas" id="gameCanvas" :class="{perspective}"></canvas>
        </div>
        <!-- mark indicator -->
        <div class="center" v-show="playMode" ref="hitIndicator">{{markJudge}} {{result.combo}}</div>
      </div>

      <div
        class="column side right blurBackground"
        v-if="instance"
        :class="{disabled:!initialized}"
      >
        <h2>Mappings</h2>
        <SheetTable></SheetTable>
      </div>
    </div>

    <div class="toolbar blurBackground" v-if="instance" :class="{disabled:!initialized}">
      <div style="font-size:30px;width:80px;text-align:center;">{{currentTime}}</div>
      <div class="action_buttons">
        <v-icon class="vicon" name="undo" scale="1" @click="seekTo(Number(currentTime)-5)" />
        <v-icon
          class="vicon"
          name="play"
          scale="1.5"
          @click="songLoaded"
          v-if="instance && instance.paused"
        />
        <v-icon class="vicon" name="pause" scale="1.5" @click="pauseGame" v-else />
        <v-icon class="vicon" name="redo" scale="1" @click="seekTo(Number(currentTime)+5)" />
      </div>
      <div style="flex-grow:1">
        <vue-slider
          :value="currentTime"
          :tooltip-placement="'right'"
          :interval="0.001"
          :min="-noteSpeedInSec"
          :max="songLength"
          @change="seekTo"
        ></vue-slider>
      </div>
      <div style="width:90px;margin-left:30px;">
        <select id="songSelect" v-model="playbackSpeed">
          <option disabled>Playback Speed</option>
          <option value="0.25">0.25X</option>
          <option value="0.5">0.5X</option>
          <option value="0.75">0.75X</option>
          <option value="1">1.0X</option>
          <option value="1.5">1.5X</option>
        </select>
      </div>
    </div>

    <Loading style="z-index:500" :show="loading">Just a second...</Loading>
  </div>
</template>


<script>
import { getSong, getSheet, getGameSheet } from "../javascript/db"
import Visualizer from '../components/Visualizer.vue';
import InfoEditor from '../components/InfoEditor.vue';
import SheetTable from '../components/SheetTable.vue';
import SongListItem from '../components/SongListItem.vue';
import Loading from '../components/Loading.vue';
import GameInstanceMixin from '../mixins/gameInstanceMixin';
import VueSlider from 'vue-slider-component'
import { Youtube } from 'vue-youtube'
import 'vue-slider-component/theme/antd.css'
import 'vue-awesome/icons/play'
import 'vue-awesome/icons/pause'
import 'vue-awesome/icons/redo'
import 'vue-awesome/icons/undo'

export default {
  name: 'SheetEditor',
  components:{
      Visualizer,
      InfoEditor,
      VueSlider,
      Youtube,
      SheetTable,
      SongListItem,
      Loading
  },
  mixins: [GameInstanceMixin],
  data(){
        return {
          wrapper: null,
          contentHeight: "86vh",
          playMode: false,
          playbackSpeed: 1,
          songLength: 0,
          inEditor: true,
          songInfo: {
            id:null
          },
          sheetInfo: {
            id:null
          },
          gameSheetInfo: null,
          loading: false
        }
    },
    computed: {
      currentTime(){
        return (this.instance.playTime - this.noteSpeedInSec).toFixed(2) 
      }

    },
    watch: {
      playbackSpeed(){
        this.setPlaybackRate(this.playbackSpeed)
      }
    },
    async mounted() {
      this.wrapper = this.$refs.wrapper;
      this.instance.reposition()
      const sheetId = this.$route.params.sheet;

      if(sheetId){
        this.loading = true
        try{
          this.sheetInfo = await getSheet(sheetId);
          this.songInfo = await getSong(this.sheetInfo.songId);
          this.gameSheetInfo = await getGameSheet(sheetId);
          this.gameSheetInfo.sheet = this.gameSheetInfo.sheet ?? [];
          console.log(this.gameSheetInfo)
          this.instance.loadSong(this.gameSheetInfo);
        }catch(err){
          console.error(err);
          this.$store.state.gModal.show({bodyText:"Sorry, something went wrong, maybe try refresh?", 
          isError: true, showCancel: false})
        }
        this.loading = false
      }else{

      }
    },
    methods: {
      goToMenu(){
        this.$router.push('/menu')
      },
      async songLoaded(){
        if(!this.initialized){
          this.songLength = await this.getLength();
          this.pauseGame()
          this.initialized = true;
        }else if(!this.started){
          this.instance.paused = false;
          this.instance.startSong()
        }else{
          this.instance.resumeGame()
        }
      },
      async getLength(){
        let length = 0;
        if(this.srcMode==="youtube"){
          length = await this.ytPlayer.getDuration();
        }else{
          length = this.audio.getDuration();
        }
        console.log(length)
        return Number(length.toFixed(3))
      },
      pauseGame(){
        this.instance.pauseGame()
      },
      async restartGame(){
        if(!this.started) return;
        this.started = false
        await this.instance.pauseGame()
        this.clearResult()
        this.instance.resetPlaying()
        this.instance.paused = false
        this.instance.startSong()
      },
      seekTo(time){
        if(time<0){
          this.restartGame()
          return
        }
        if(this.srcMode==="youtube"){
          this.ytPlayer.seekTo(Number(time))
        }else{
          this.audio.seek(Number(time))
        }
      },
      setPlaybackRate(rate){
        if(this.srcMode==="youtube"){
          this.ytPlayer.setPlaybackRate(Number(rate))
        }else{
          this.audio.setRate(Number(rate))
        }
      },
      togglePlayMode(){
        this.playMode = !this.playMode;
        this.restartGame()
      },
      updateSongDetail(){
        this.$refs.info.openSongUpdate()
      },
      newEditor(){
        this.$router.push("/editor/")
      },


      reorderSheet(){
        this.instance.timeArr.sort((a,b) => parseFloat(a.t) - parseFloat(b.t))
      }
    }
};
</script>

<style scoped>
/* The navbar container */
.toolbar {
  overflow: hidden;
  background-color: #333;
  height: 7vh;
  display: flex;
  align-items: center;
  padding: 0 30px;
  z-index: 200;
}

.logo {
  padding: 20px;
}

.action_buttons {
  display: flex;
  align-items: center;
  margin: 0 30px;
  width: 100px;
  justify-content: space-between;
}

.toolbar a {
  display: block;
  color: #f2f2f2;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
  transition: 0.5s;
}

/* Links - change color on hover */
.toolbar a:hover {
  background-color: #ddd;
  color: black;
}

.main {
  scroll-snap-type: x mandatory;
  display: flex;
}

.column {
  height: 86vh;
}

/* Left and right column */
.column.side {
  width: 25%;
  box-sizing: border-box;
  background: linear-gradient(
    -45deg,
    rgba(138, 138, 138, 0.295),
    rgba(0, 0, 0, 0.2)
  );
}

.left {
  display: flex;
  flex-direction: column;
}

.right {
  padding: 30px;
}

.ytPlayer_editor {
  max-width: 100%;
}

/* Middle column */
.column.middle {
  width: 50%;
}

.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.vicon {
  cursor: pointer;
}

@media screen and (max-width: 600px) {
  .main {
    flex-wrap: nowrap;
    overflow-x: auto;
  }
  .column,
  .column.side,
  .column.middle {
    flex: 0 0 auto;
    width: 100vw;
    scroll-snap-align: start;
  }
}
</style>