<template>
  <div>
    <PageBackground
      songSrc="https://assets.rhythm-plus.com/bgm/nomyn-flow.mp3"
      imageSrc="black"
      :showNav="false"
    ></PageBackground>
    <video autoplay muted loop class="bgVid">
      <source
        src="https://assets.rhythm-plus.com/video/blue_paint.mp4"
        type="video/mp4"
      />
    </video>
    <div class="center">
      <div class="gameover">Game Over</div>
      <div
        class="btn-action btn-dark"
        @click="replay"
        v-if="$route.params.sheetId"
      >
        <v-icon name="redo" />
        <span>Replay</span>
      </div>
      <div class="btn-action btn-dark" @click="toMenu">
        <v-icon name="arrow-right" />
        <span>Continue</span>
      </div>
    </div>
  </div>
</template>

<script>
import PageBackground from "../components/common/PageBackground.vue";

export default {
  name: "GameOverScreen",
  components: { PageBackground },
  data() {
    return {};
  },
  computed: {},
  watch: {},
  mounted() {
    this.$store.state.audio.playEffect("whoosh");
  },
  methods: {
    replay() {
      this.$router.push("/game/" + this.$route.params.sheetId);
    },
    toMenu() {
      this.$router.push("/menu/");
    },
  },
};
</script>

<style scoped>
.bgVid {
  position: fixed;
  left: 0;
  bottom: 0;
  min-width: 100%;
  min-height: 100%;
  animation: 5s ease 0s normal forwards 1 fade;
}

.gameover {
  font-size: 5em;
  color: white;
  margin-bottom: 50px;
  width: 90vw;
  animation: fail_enter 1.5s ease;
}

.btn-dark {
  background-color: rgba(0, 0, 0, 0.384);
}
.btn-dark:hover {
  background-color: white;
}
.fa-icon {
  vertical-align: middle;
  margin-right: 5px;
}

@media screen and (max-width: 600px) {
  .gameover {
    font-size: 3.7em;
  }
  .bgVid {
    left: -150%;
    min-width: 200vw;
  }
}

@keyframes fail_enter {
  from {
    transform: scale(3);
    color: red;
    opacity: 0;
    text-shadow: none;
  }
  to {
    opacity: 1;
    color: white;
    transform: scale(1);
    text-shadow: 2px 2px 50px rgb(150, 0, 0);
  }
}
@keyframes fade {
  0% {
    opacity: 0;
  }
  22% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
