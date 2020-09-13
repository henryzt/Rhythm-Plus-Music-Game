<template>
  <div class="judge">
    <transition name="modal-fade">
      <div class="combo" v-if="combo >= 5">
        <div>Combo</div>
        <div class="comboNum comboAnimation" v-if="display">
          <div :class="judgeType">{{ combo }}</div>
        </div>
      </div>
    </transition>
    <div class="center_judge judgeAnimation" v-if="display">
      {{ markJudge }}
    </div>
  </div>
</template>

<script>
export default {
  name: "MarkComboJudge",
  data: () => {
    return {
      display: true,
      markJudge: "",
      combo: 0,
      comboAni: {},
      judgeType: {},
    };
  },
  methods: {
    judge(mark, combo) {
      this.markJudge = mark;
      this.combo = combo;
      this.display = false;
      this.judgeType = { ["judge" + this.markJudge]: true };
      this.$nextTick(() => {
        this.display = true;
      });
    },
  },
};
</script>

<style scoped>
.judge {
  user-select: none;
  pointer-events: none;
  text-align: center;
}

.combo {
  position: absolute;
  width: 400px;
  height: 80px;
  top: 20%;
  left: 50%;
  margin-left: -200px;
  z-index: 100;
  font-size: 1.5em;
}

.comboNum {
  font-family: Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif;
  margin-top: -10px;
  font-size: 3.5em;
}

.center_judge {
  position: absolute;
  font-size: 3em;
  font-family: "Raleway";
  line-height: 80px;
  width: 400px;
  height: 80px;
  top: 65%;
  left: 50%;
  margin-left: -200px;
  z-index: 100;
  /* transition: opacity 2s ease-in-out; */
}

.animationNone {
  animation: none;
  animation-name: none;
}

.comboAnimation {
  animation-name: comboAni;
  animation-duration: 0.1s;
}

.judgeAnimation {
  animation-name: judgeAni;
  animation-duration: 0.1s;
}

@keyframes comboAni {
  from {
    padding-top: 0;
    opacity: 1;
  }

  30% {
    padding-top: 20px;
    opacity: 1;
  }

  100% {
    padding-top: 0px;
    opacity: 1;
  }
}

@keyframes judgeAni {
  from {
    transform: scale(1);
  }

  50% {
    transform: scale(1.5);
  }

  100% {
    transform: scale(1);
  }
}
</style>
