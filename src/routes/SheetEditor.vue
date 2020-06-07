<template>
  <div>
    <!-- visualizer canvas -->
    <Visualizer ref="visualizer"></Visualizer>

    <div class="toolbar blurBackground">
      <div class="logo">R+ Sheet Editor</div>
      <div style="flex-grow:1"></div>
      <a href="#">Save</a>
      <a href="#">Test</a>
      <a href="#">Publish</a>
    </div>

    <div class="main">
      <div class="column side blurBackground">
        <info-editor></info-editor>
      </div>

      <div class="column middle">
        <div class="gameWrapper" ref="wrapper">
          <canvas ref="mainCanvas" id="gameCanvas" :class="{perspective}"></canvas>
        </div>
      </div>

      <div class="column side blurBackground">
        <h2>Notes</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit..</p>
      </div>
    </div>

    <div class="toolbar blurBackground" v-if="instance">
      <div style="font-size:30px;width:50px;text-align:center;">{{instance.playTime}}</div>
      <div class="action_buttons">
        <v-icon name="undo" scale="1" />
        <v-icon name="play" scale="1.5" />
        <v-icon name="redo" scale="1" />
      </div>
      <div style="flex-grow:1">
        <vue-slider v-model="instance.playTime" :tooltip-placement="'right'"></vue-slider>
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
  </div>
</template>


<script>
import Visualizer from '../components/Visualizer.vue';
import InfoEditor from '../components/InfoEditor.vue';
import GameInstanceMixin from '../mixins/gameInstanceMixin';
import VueSlider from 'vue-slider-component'
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
      VueSlider
  },
  mixins: [GameInstanceMixin],
  data(){
        return {
          wrapper: null,
          contentHeight: "86vh",
          playMode: false,
          playbackSpeed: 1,
          songInfo: {
            id:null
          },
          sheetInfo: {
            id:null
          }
        }
    },
    computed: {

    },
    watch: {

    },
    mounted() {
      this.wrapper = this.$refs.wrapper;
      this.instance.reposition()
    },
    methods: {

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

/* Middle column */
.column.middle {
  width: 50%;
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