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
      fever: { value: 1, time: 0, percent: 0 },
      markJudge: "",
      feverInterval: null,
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
      if (this.result.totalHitNotes === 0) {
        return 0;
      } else {
        return this.result.totalPercentage / this.result.totalHitNotes;
      }
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

    this.feverInterval = setInterval(this.feverTimer, 500);

    window.addEventListener("blur", this.pauseGame);
  },
  beforeDestroy() {
    clearInterval(this.feverInterval);
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
      this.clearFever();
    },
    clearFever() {
      this.fever = { value: 1, time: 0, percent: 0 };
    },
    feverTimer() {
      if (!this.started || this.instance.paused || !this.playMode) return;
      console.log(this.fever.percent, this.fever.time, this.fever.value);
      if (this.fever.value < 1) this.fever.value = 1;
      if (this.fever.percent < 0) this.fever.percent = 0;
      if (this.fever.percent >= 1) {
        this.fever.percent = 0;
        this.fever.time = 30;
        this.fever.value =
          this.fever.value < 5 ? this.fever.value + 1 : this.fever.value;
        this.$refs?.zoom?.show("X" + this.fever.value, "30%", "fever");
      }
      if (this.fever.time > 0) {
        this.fever.time -= 0.5;
      } else if (this.fever.value > 1) {
        this.clearFever();
      }
    },
    ytPaused() {
      console.log("pasued");
      if (this.started) this.pauseGame();
    },
    ytError() {
      console.error("youtube error");
      this.instance.loading = false;
      this.$store.state.gModal.show({
        bodyText:
          "Sorry, there is a problem with the source right now, which makes this sheet unavaliable. Please try again later.",
        isError: true,
        showCancel: false,
        okCallback: this.exitGame,
      });
    },
  },
};
