<template>
  <div class="warpper">
    <transition name="slide-fade" mode="out-in">
      <div class="tutorial flex_hori blurBackground" key="1" v-if="slide == 1">
        <div class="texts">
          <div class="title">Welcome to Rhythm Plus!</div>
          <img class="logo" src="/assets/logo2.png" />
          <div>
            R+ is a web-based vertical scorlling rhythm game (VSRG), you can
            make, play, and share any songs from and with anyone!
          </div>
        </div>
      </div>

      <div class="tutorial flex_hori blurBackground" key="2" v-if="slide == 2">
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

      <div class="tutorial flex_hori blurBackground" key="2" v-if="slide == 3">
        <div class="texts">
          <div class="title">How to play</div>
          <div>
            Each track has an asscoiated key, for a 4 track game, D, F, J, K,
            associates to track 1-4 respectively.
          </div>
          <img
            class="logo"
            style="max-width: 60%;"
            src="/assets/tutorial/2.png"
          />
          <div>
            On mobile devices, simply tap the white hit line to toggle the
            track. Try it now!
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import "vue-awesome/icons/info-circle";

export default {
  name: "Tutorial",
  data() {
    return {
      slide: 0,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.slide = 1;
    });
    setTimeout(() => {
      this.slide = 3;
    }, 2000);
  },
  methods: {},
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
  transform: translateY(-30px);
  opacity: 0;
}
</style>
