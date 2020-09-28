<template>
  <div class="warpper">
    <transition name="slide-fade" mode="out-in">
      <div
        class="tutorial flex_hori blurBackground"
        :style="bgBlink"
        key="1"
        v-if="slide == 1"
      >
        <div class="texts">
          <div class="title">Welcome to Rhythm Plus!</div>
          <img class="logo" src="/assets/logo_white.png" />
          <div>
            Rhythm+ is a web-based vertical scorlling rhythm game (VSRG), you
            can make, play, and share any songs from and with anyone!
          </div>
        </div>
      </div>

      <div
        class="tutorial flex_hori blurBackground"
        :style="bgBlink"
        key="2"
        v-if="slide == 2"
      >
        <div class="texts">
          <div class="title">How to play</div>
          <div>
            You will see 4 to 9 tracks in the game, based on the rhythm, notes
            will drop from the top of the track, when the note gets closer to
            the bottom white line, hit the corresponding track.
          </div>
          <img
            class="logo"
            style="max-width: 60%;"
            src="/assets/tutorial/1.png"
          />
          <div>
            Hit while the note is on the white line to get higher marks.
          </div>
        </div>
      </div>

      <div
        class="tutorial flex_hori blurBackground"
        :style="bgBlink"
        key="3"
        v-if="slide == 3"
      >
        <div class="texts">
          <div class="title">How to play</div>
          <div>
            Each track has an asscoiated key, for a 4 track game, D, F, J, K,
            associates to track 1-4 respectively.
          </div>
          <img class="logo" src="/assets/tutorial/2.png" />
          <div>
            On mobile devices, simply tap the white hit line to toggle the
            track. Try it now!
          </div>
        </div>
      </div>

      <div
        class="tutorial flex_hori blurBackground"
        :style="bgBlink"
        key="4"
        v-if="slide == 4"
      >
        <div class="texts">
          <div class="title">Nice job!</div>
          <div>
            Now let's try something different: hold notes.
          </div>
          <img
            class="logo"
            style="max-width: 60%;"
            src="/assets/tutorial/3.png"
          />
          <div>
            Hold the key when the bottom of the hold note reaches the white
            line, then release the key once the top of the note has just left
            the line.
          </div>
        </div>
      </div>

      <div
        class="tutorial flex_hori blurBackground"
        :style="bgBlink"
        key="5"
        v-if="slide == 5"
      >
        <div class="texts">
          <div class="title">Fantastic!</div>
          <div class="emoji">😎</div>
          <div>
            Now, let's combine them all together!
          </div>
        </div>
      </div>

      <div
        class="tutorial flex_hori blurBackground"
        :style="bgBlink"
        key="6"
        v-if="slide == 6"
      >
        <div class="texts">
          <div class="title">There we go!</div>
          <div class="emoji">🎉🎉</div>
          <div>
            Here is the end of the tutorial, you should now be able to play any
            songs without problem! If in doubt, you can always replay the
            tutorial :)
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import VolumeSampler from "../../visualizers/VolumeSampler";

const timeline = [
  { time: 1, slide: 1 },
  { time: 9, slide: 2 },
  { time: 19, slide: 3 },
  { time: 29, slide: 0 },
  { time: 48, slide: 4 },
  { time: 54, slide: 0 },
  { time: 63, slide: 5 },
  { time: 67, slide: 0 },
  { time: 108, slide: 6 },
  { time: 119, slide: 0 },
  { time: 200, slide: 0 },
];

let sampler;

export default {
  name: "Tutorial",
  data() {
    return {
      slide: 0,
      timer: null,
      idx: 0,
      bgBlink: {},
    };
  },
  mounted() {
    this.timer = setInterval(() => {
      if (this.time >= timeline[this.idx].time) {
        this.slide = timeline[this.idx++].slide;
      } else if (this.idx != 0 && this.time < timeline[this.idx - 1].time) {
        this.idx = 0;
        this.slide = 0;
      }
      this.blinkBackground();
    }, 50);
    this.setupSampler();
  },
  computed: {
    time() {
      return this.$parent.instance.playTime;
    },
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    setupSampler() {
      const audioData = this.$store.state.audio.audioData;
      console.log(audioData);
      if (audioData) sampler = new VolumeSampler(audioData);
    },
    blinkBackground() {
      let v = sampler ? sampler.volume / 80 : 0;
      console.log(this.$store.state.audio.audioData.dataArray[0]);
      this.bgBlink = {
        background: `rgba(${v},${v},${v},${0.5})`,
      };
    },
  },
};
</script>

<style scoped>
.tutorial {
  margin: auto;
  background: rgba(0, 0, 0, 0.3);
  padding: 45px 30px;
  width: 100%;
  max-width: 500px;
  z-index: 1000;
  overflow: hidden;
  transition: background 1s;
}

.logo {
  max-width: 550px;
  width: 80%;
  margin: auto;
  text-align: center;
  display: block;
  padding: 10px 0;
}

.warpper {
  position: fixed;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.texts {
  padding-left: 30px;
  text-align: left;
}

.title {
  font-size: 1.4em;
  padding: 10px 0;
}

.emoji {
  font-size: 3em;
  text-align: center;
}

.text_button {
  padding: 0;
  display: inline-block;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateY(30px);
  opacity: 0;
}
</style>
