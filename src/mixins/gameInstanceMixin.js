import GameInstance from "../javascript/gameInstance";

export default {
  data() {
    return {
      audio: null,
      canvas: null,
      ctx: null,
      checkHitLineY: null, // hit line postion (white line)
      noteSpeedInSec: 2,
      noteSpeedPxPerSec: null, // note speed
      playMode: true, // play or edit mode
      currentSong: null,
      result: {
        score: 0,
        totalPercentage: 0,
        totalHitNotes: 0,
        combo: 0,
        maxCombo: 0,
        marks: { perfect: 0, good: 0, offbeat: 0, miss: 0 },
      },
      markJudge: "",
      srcMode: "youtube",
      instance: null,
      visualizerInstance: null,
      youtubeId: "jNQXAC9IVRw",
      perspective: false,
      vibrate: true,
      advancedMenuOptions: false,
      started: false,
      showStartButton: false,
      isGameEnded: false,
      initialized: false,
    };
  },
  computed: {
    mode() {
      return this.playMode ? "Play Mode" : "Create Mode";
    },
    ytPlayer() {
      return this.$refs.youtube?.player;
    },
    hideGameForYtButton() {
      return this.srcMode === "youtube" && this.showStartButton;
    },
    percentage() {
      return this.result.totalHitNotes !== 0
        ? this.result.totalPercentage / this.result.totalHitNotes
        : 0;
    },
  },
  watch: {
    noteSpeedInSec() {
      this.instance.reposition();
    },
    showStartButton() {
      if (this.showStartButton) {
        this.$nextTick(this.addTilt);
        this.initialized = true;
      }
    },
  },
  mounted() {
    this.canvas = this.$refs.mainCanvas;
    this.ctx = this.canvas.getContext("2d");
    this.visualizerInstance = this.$refs.visualizer;
    // get audio element
    this.audio = this.$store.state.audio;

    this.instance = new GameInstance(this);
    this.instance.reposition();

    window.addEventListener("blur", this.pauseGame);
  },
  destroyed() {
    window.removeEventListener("blur", this.pauseGame);
    this.instance.destroyInstance();
  },
  methods: {
    clearResult() {
      this.result = {
        score: 0,
        totalPercentage: 0,
        totalHitNotes: 0,
        combo: 0,
        maxCombo: 0,
        marks: { perfect: 0, good: 0, offbeat: 0, miss: 0 },
      };
    },
    ytPaused() {
      console.log("pasued");
      if (this.started) this.pauseGame();
    },
    ytError() {
      console.error("youtube error");
      this.$store.state.gModal.show({
        bodyText:
          "Sorry, there is a problem with this video right now, which makes this sheet unavaliable. Please try again later.",
        isError: true,
        showCancel: false,
        okCallback: this.exitGame,
      });
    },
  },
};
