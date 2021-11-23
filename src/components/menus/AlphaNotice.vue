<template>
  <div class="warpper">
    <div class="alphaNotice flex_hori blurBackground">
      <div class="ripple" style="animation-delay: 0.8s"></div>
      <div class="ripple"></div>
      <div>
        <v-icon name="info-circle" scale="2"></v-icon>
      </div>
      <div>
        <transition name="slide-fade" mode="out-in">
          <div class="texts" key="1" v-if="slide == 1">
            <div class="bigger">Welcome to Rhythm Plus!</div>
          </div>
          <div class="texts long" key="2" v-else-if="slide == 2">
            <div class="bigger">
              This game is under active development (Alpha WIP)
            </div>
            <div>
              <div class="text_button" @click="openDiscord">Discord</div>
              ·
              <div class="text_button" @click="openForm">Report bug</div>
              ·
              <div class="text_button" @click="openGithub">
                Star me on GitHub
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import "vue-awesome/icons/info-circle";

export default {
  name: "AlphaNotice",
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
      this.slide = 2;
    }, 3000);
  },
  methods: {
    openForm() {
      window.open("https://forms.gle/8gmuaWU7E9h82i4A7", "_blank");
    },
    openDiscord() {
      window.open("https://discord.gg/ZGhnKp4", "_blank");
    },
    openGithub() {
      window.open(
        "https://github.com/henryz00/Rhythm-Plus-Music-Game",
        "_blank"
      );
    },
  },
};
</script>

<style scoped>
.alphaNotice {
  margin: auto;
  /* background: rgba(0, 0, 0, 0.5); */
  padding: 30px;
  width: fit-content;
  z-index: 1000;
  overflow: hidden;
  opacity: 0.8;
  /* border: 1px solid rgba(255, 166, 0, 0.5); */
  /* box-shadow: 0px 0px 30px rgba(255, 136, 0, 0.3); */
}

.warpper {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 12%;
}

.texts {
  padding-left: 30px;
  text-align: left;
}

.bigger {
  font-size: 1.2em;
  padding: 5px 0;
}

.text_button {
  padding: 0;
  display: inline-block;
}

.ripple {
  position: absolute;
  opacity: 0;
  border-radius: 100%;
  width: 10px;
  height: 10px;
  left: 9%;
  top: 45%;
  background-color: #ffffff;
  animation-duration: 6s;
  animation-name: ripple;
  /* animation-iteration-count: infinite; */
  z-index: -1;
}

.long {
  font-size: 0.8em;
}

@media only screen and (max-width: 1000px) {
  .alphaNotice {
    padding: 10px 30px;
  }

  .ripple {
    top: 25%;
  }

  .long {
    width: 200px;
  }
}

@keyframes ripple {
  0% {
    opacity: 0.1;
  }
  100% {
    width: 700px;
    height: 700px;
    left: -70%;
    top: -330%;
    border-radius: 700%;
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}
</style>
