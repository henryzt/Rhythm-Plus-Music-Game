import GameInstance from "../javascript/gameInstance";

let pauseTime = 0;
let pauseTimeout = null;

export default {
  data() {
    return {
      audio: null,
      canvas: null,
      ctx: null,
      effectCanvas: null,
      effectCtx: null,
      noteSpeed: 1,
      playbackSpeed: 1,
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
      health: 100,
      feverInterval: null,
      srcMode: "youtube",
      instance: null,
      visualizerInstance: null,
      youtubeId: "caCqu-p_wZc",
      perspective: false,
      vibrate: true,
      noFail: false,
      fps: false,
      advancedMenuOptions: false,
      started: false,
      showStartButton: false,
      isGameEnded: false,
      initialized: false,
      blur: false,
      keyMap: null,
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
    noteSpeed() {
      this.instance.reposition();
    },
    showStartButton() {
      if (this.showStartButton) {
        this.$nextTick(this.addTilt);
        this.initialized = true;
      }
    },
    perspective() {
      this.instance.reposition();
    },
  },
  mounted() {
    this.canvas = this.$refs.mainCanvas;
    this.ctx = this.canvas.getContext("2d");
    this.effectCanvas = this.$refs.effectCanvas ?? this.canvas;
    this.effectCtx = this.effectCanvas.getContext("2d");
    this.visualizerInstance = this.$refs.visualizer;
    // get audio element
    this.audio = this.$store.state.audio;

    this.audio.stop(true);

    this.feverInterval = setInterval(this.feverTimer, 500);

    // setup user default settings
    const gameSettings = this.$store.state?.userProfile?.gameSt;
    if (gameSettings) {
      this.blur = gameSettings.blur;
      this.noteSpeed = gameSettings.noteSpeed ?? 1;
      this.perspective = gameSettings.perspective;
      this.noFail = gameSettings.noFail;
      this.vibrate = gameSettings.vibrate;
      this.fps = gameSettings.fps;
    }
    const preference = this.$store.state?.userProfile?.preference;
    if (preference) {
      this.keyMap = preference.keyMap;
    }
    Logger.log(this.keyMap);

    // init instance
    this.instance = new GameInstance(this);
    this.instance.reposition();

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
      if (this.fever.value < 1) this.fever.value = 1;
      if (this.fever.percent < 0) this.fever.percent = 0;
      if (this.fever.percent >= 1) {
        this.fever.percent = 0;
        this.fever.time = 30;
        this.fever.value =
          this.fever.value < 5 ? this.fever.value + 1 : this.fever.value;
        this.$refs?.zoom?.show("X" + this.fever.value, "45%", "fever");
        this.$store.state.audio.playEffect("explode");
      }
      if (this.fever.time > 0) {
        this.fever.time -= 0.5;
      } else if (this.fever.value > 1) {
        this.clearFever();
      }
    },
    ytPaused() {
      Logger.log("pasued");
      if (pauseTime > 10) {
        this.$store.state.alert.error(
          "Player anomoly detected, pause failed",
          2000
        );
        return;
      }
      if (this.started) this.pauseGame();
      pauseTime++;
      clearTimeout(pauseTimeout);
      pauseTimeout = setTimeout(() => {
        pauseTime = 0;
      }, 1000);
    },
    ytError() {
      Logger.error("youtube error");
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
