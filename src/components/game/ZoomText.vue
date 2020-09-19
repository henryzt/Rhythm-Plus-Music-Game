<template>
  <div class="center" :style="{ top: position }">
    <transition name="bounce" v-on:after-enter="enter">
      <div :class="classObj" v-if="display">
        <slot>{{ text }}</slot>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "ZoomText",
  data: () => {
    return {
      display: false,
      text: "Get Ready",
      position: null,
      duration: null,
      classObj: {},
    };
  },
  methods: {
    enter() {
      this.display = false;
    },
    show(text, position, classObj, duration) {
      this.text = text;
      this.position = position ?? "50%";
      this.duration = duration ?? "1s";
      if (classObj) {
        this.classObj = { [classObj]: true };
      } else {
        this.classObj = {};
      }
      this.display = true;
    },
  },
};
</script>

<style scoped>
.center {
  top: 30%;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 4em;
  font-weight: 900;
  pointer-events: none;
}

.fever {
  font-size: 5em;
}

.bounce-enter-active {
  animation: bounce-in 1s;
}
.bounce-leave-active {
  animation: bounce-out 0.5s ease-out;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
    opacity: 0;
    font-weight: 100;
  }
  50% {
    font-weight: 900;
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}

@keyframes bounce-out {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: scale(2);
    font-weight: 100;
  }
}
</style>
