<template>
  <transition name="alert-fade">
    <div v-if="visible" class="warpper">
      <div class="horizontal animate__animated" :class="[className, emphasize]">
        {{ text }}
      </div>
    </div>
  </transition>
</template>

<script>
import { logError } from "../../helpers/analytics";

export default {
  name: "FloatingAlert",
  data: function () {
    return {
      visible: false,
      text: "This is a floating notification",
      className: "",
      emphasize: "",
    };
  },
  methods: {
    show(text, time) {
      if (this.visible && this.text === text) {
        this.emphasize = "animate__flash";
        setTimeout(() => {
          this.emphasize = "";
        }, 1000);
      }
      this.visible = true;
      this.text = text;
      clearTimeout(this.hideTimeout);
      if (time && time !== 0) {
        this.hideTimeout = setTimeout(() => {
          this.visible = false;
        }, time);
      }
      // this.$store.state.audio.playEffect("/audio/effects/error.mp3");
    },
    info(text, time) {
      this.className = "info";
      this.show(text, time);
    },
    warn(text, time) {
      this.className = "warn";
      this.show(text, time);
    },
    error(text, time) {
      this.className = "error";
      this.show(text, time);
      logError(text);
    },
    success(text) {
      this.className = "success";
      this.show(text, 3500);
    },
  },
};
</script>

<style scoped>
.warpper {
  position: fixed;
  left: 0;
  right: 0;
  top: 30px;
  z-index: 1000;
}

.horizontal {
  margin: auto;
  background: orange;
  padding: 20px;
  transition: 0.5s;
  width: fit-content;
}
.info {
  background: rgb(0, 151, 197);
}
.warn {
  background: orange;
}
.success {
  background: rgb(81, 134, 0);
}
.error {
  background: rgb(185, 0, 0);
}

.alert-fade-enter,
.alert-fade-leave-active {
  top: -50px;
  opacity: 0;
}

.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: 0.5s;
}
</style>
