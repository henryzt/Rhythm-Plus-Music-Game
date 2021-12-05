<template>
  <div class="warpper">
    <transition name="slide-fade" mode="out-in">
      <div class="tutorial flex_hori" key="1" v-if="slide == 1">
        <div class="texts">
          <div class="title">Welcome to Rhythm Plus!</div>
          <img class="logo" :src="img.logo" />
          <div>
            Rhythm+ is a web-based Vertical Scrolling Rhythm Game (VSRG), you
            can make, play, and share any songs from and with anyone!
          </div>
          <hr class="artist_hr" />
          <div class="artist">♫ Doven - かめりあ</div>
        </div>
      </div>

      <div class="tutorial flex_hori" key="2" v-if="slide == 2">
        <div class="texts">
          <div class="title">How to play - Keys</div>
          <div>
            Each track has an associated key bind. For a game with 4 tracks,
            keys D, F, J and K, corresponds to tracks 1, 2, 3 and 4
            respectively.
          </div>
          <img class="logo" :src="img.a" />
          <div>
            On mobile devices, simply tap the hit line to toggle the track. Try
            it now!
          </div>
          <div class="text_button" @click="skip">Skip</div>
        </div>
      </div>

      <div class="tutorial flex_hori" key="3" v-if="slide == 3">
        <div class="texts">
          <div class="title">How to play - Judging</div>
          <div>
            Based on the rhythm, notes will drop from the top of the track, when
            the note gets closer to the bottom white line, hit the corresponding
            track.
          </div>
          <img class="logo" style="max-width: 60%" :src="img.b" />
          <div>
            Hit while the note is on the white line to get higher marks.
          </div>
          <div class="text_button" @click="skip">Skip</div>
        </div>
      </div>

      <div class="tutorial flex_hori" key="4" v-if="slide == 4">
        <div class="texts">
          <div class="title">Nice job!</div>
          <div>Now let's try something different: hold notes.</div>
          <img class="logo" style="max-width: 60%" :src="img.c" />
          <div>
            Hold the key when the bottom of the hold note reaches the white
            line, then release the key once the top of the note has just left
            the line.
          </div>
        </div>
      </div>

      <div class="tutorial flex_hori" key="5" v-if="slide == 5">
        <div class="texts">
          <div class="title">Fantastic!</div>
          <div class="emoji">😎</div>
          <div>Now, let's combine them all together!</div>
        </div>
      </div>

      <div class="tutorial flex_hori" key="6" v-if="slide == 6">
        <div class="texts">
          <div class="title">There we go!</div>
          <div class="emoji">🎉🎉</div>
          <div>
            Here is the end of the tutorial, you should now be able to play any
            songs without problem! If in doubt, you can always replay the
            tutorial :)
          </div>
          <hr class="artist_hr" />
          <div class="artist">♫ Doven - かめりあ</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
const timeline = [
  { time: 1, slide: 1 },
  { time: 9, slide: 2 },
  { time: 19, slide: 3 },
  { time: 29, slide: -1 },
  { time: 48, slide: 4 },
  { time: 54, slide: 0 },
  { time: 64, slide: 5 },
  { time: 66, slide: 0 },
  { time: 108, slide: 6 },
  { time: 119, slide: 0 },
  { time: 200, slide: 0 },
];

export default {
  name: "Tutorial",
  data() {
    return {
      slide: 0,
      timer: null,
      idx: 0,
      img: {
        logo: null,
        a: null,
        b: null,
        c: null,
      },
    };
  },
  async mounted() {
    this.timer = setInterval(() => {
      if (this.time >= timeline[this.idx].time) {
        this.slide = timeline[this.idx++].slide;
        if (this.slide == -1) this.$parent.$refs.zoom.show("Get Ready...");
      } else if (this.idx != 0 && this.time < timeline[this.idx - 1].time) {
        this.idx = 0;
        this.slide = 0;
      }
    }, 50);

    this.img.logo = await this.loadImage("/assets/logo_white.png");
    this.img.a = await this.loadImage("/assets/tutorial/2.png");
    this.img.b = await this.loadImage("/assets/tutorial/1.png");
    this.img.c = await this.loadImage("/assets/tutorial/3.png");
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
    async loadImage(url) {
      return new Promise((resolve) => {
        let img = new Image();
        img.src = url;
        img.onload = () => {
          resolve(img.src);
        };
      });
    },
    skip() {
      this.$parent.instance.seekTo(timeline[this.idx].time);
    },
  },
};
</script>

<style scoped>
.tutorial {
  margin: auto;
  background: rgba(0, 0, 0, 0);
  padding: 45px 30px;
  width: 100%;
  max-width: 500px;
  z-index: 1000;
  transition: background 1s;
  box-sizing: border-box;
}

.logo {
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
  width: 100%;
  transform: translateY(-60%);
}

.texts {
  text-align: left;
}

.artist {
  text-align: center;
}

.artist_hr {
  width: 20%;
  margin-top: 15px;
  border: 1px solid white;
}

.text_button {
  padding: 10px;
  text-align: center;
}

.title {
  font-size: 1.4em;
  padding: 10px 0;
  text-align: center;
}

.emoji {
  font-size: 3em;
  text-align: center;
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
