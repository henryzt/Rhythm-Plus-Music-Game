<template>
  <transition name="alert-fade">
    <div v-if="visible" class="warpper">
      <div class="horizontal animate__animated" :class="[className, emphasize]">
        {{ text }}
        <div v-if="confirmText" @click="ok" class="btn-action">
          {{ confirmText }}
        </div>
        <div v-if="confirmText" @click="close" class="btn-action">
          Remind me later
        </div>
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
      confirmText: null,
      className: "",
      emphasize: "",
      resolve: null,
    };
  },
  methods: {
    show(text, time, confirm) {
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
      if (confirm) {
        this.confirmText = confirm;
      }
      this.$store.state.audio.playEffect("ui/ping");
      return new Promise((resolve) => {
        this.resolve = resolve;
      });
    },
    info(text, time, confirm) {
      this.className = "info";
      return this.show(text, time, confirm);
    },
    warn(text, time, confirm) {
      this.className = "warn";
      return this.show(text, time, confirm);
    },
    error(text, time, confirm) {
      this.className = "error";
      logError(text);
      return this.show(text, time, confirm);
    },
    success(text) {
      this.className = "success";
      return this.show(text, 3500);
    },

    ok() {
      if (this.visible) this.$store.state.audio.playEffect("ui/pop");
      this.visible = false;
      this.$emit("ok");
      if (this.resolve) this.resolve(true);
    },
    close() {
      if (this.visible) this.$store.state.audio.playEffect("ui/loose");
      this.visible = false;
      this.$emit("close");
      if (this.resolve) this.resolve(false);
    },
  },
  watch: {
    visible() {
      if (!this.visible) {
        this.confirmText = null;
      }
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
  pointer-events: none;
}

.btn-action {
  pointer-events: all;
  cursor: pointer;
  font-size: 0.8em;
  margin: 0px auto;
  border: 1px solid;
  margin-top: 20px;
  width: 150px;
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
