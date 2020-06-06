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

    <div class="toolbar blurBackground">
      <div>Timeline</div>
    </div>
  </div>
</template>


<script>
import Visualizer from '../components/Visualizer.vue';
import InfoEditor from '../components/InfoEditor.vue';
import GameInstanceMixin from '../mixins/gameInstanceMixin';


export default {
  name: 'SheetEditor',
  components:{
      Visualizer,
      InfoEditor
  },
  mixins: [GameInstanceMixin],
  data(){
        return {
          wrapper: null,
          contentHeight: "86vh",
          playMode: false,
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
}

.logo {
  padding: 20px;
}

/* Navbar links */
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
  padding: 30px;
  box-sizing: border-box;
  background: rgba(138, 138, 138, 0.4);
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