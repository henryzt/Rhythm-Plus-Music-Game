<template>
  <div class="center_judge">{{ markJudge }} {{ combo >= 5 ? combo : "" }}</div>
</template>

<script>
export default {
  name: "MarkComboJudge",
  data: () => {
    return {
      display: false,
      markJudge: "",
      combo: 0,
    };
  },
  methods: {
    enter() {
      this.display = false;
    },
    judge(mark, combo) {
      this.markJudge = mark;
      this.combo = combo;
    },
  },
};
</script>

<style scoped>
.center_judge {
  position: absolute;
  color: white;
  font-family: "Raleway";
  font-size: 3em;
  opacity: 0.7;
  text-align: center;
  line-height: 80px;
  width: 400px;
  height: 80px;
  top: 60%;
  left: 50%;
  margin-top: -40px;
  margin-left: -200px;
  user-select: none;
  z-index: 100;
  pointer-events: none;
  /* transition: opacity 2s ease-in-out; */
}

.hitAnimation {
  animation-name: hitScore;
  animation-duration: 10s;
}

@keyframes hitScore {
  from {
    padding-top: 0;
    opacity: 1;
  }

  1% {
    padding-top: 20px;
    opacity: 1;
  }

  2% {
    padding-top: 0px;
    opacity: 1;
  }

  80% {
    padding-top: 0px;
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}
</style>
