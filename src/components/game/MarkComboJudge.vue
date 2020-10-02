<template>
  <transition name="fade">
    <div class="judge" v-if="showAll">
      <transition name="modal-fade">
        <div class="combo" v-if="combo >= 5">
          <div>Combo</div>
          <div class="comboNum comboAnimation" v-if="display">
            {{ combo }}
          </div>
        </div>
      </transition>
      <div class="center_judge judgeAnimation" v-if="display">
        <div class="judgeTypeAnimation" :class="judgeType">{{ markJudge }}</div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "MarkComboJudge",
  data: () => {
    return {
      showAll: false,
      display: true,
      markJudge: "",
      combo: 0,
      comboAni: {},
      judgeType: {},
      timeout: null,
    };
  },
  methods: {
    judge(mark, combo) {
      this.markJudge = mark;
      this.combo = combo;
      this.display = false;
      this.judgeType = { ["judge" + this.markJudge]: true };
      this.showAll = true;
      this.$nextTick(() => {
        this.display = true;
      });
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.showAll = false;
      }, 3000);
    },
  },
};
</script>

<style scoped>
.judge {
  user-select: none;
  pointer-events: none;
  text-align: center;
  text-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
}

.combo {
  position: absolute;
  width: 400px;
  height: 80px;
  top: 15%;
  left: 50%;
  margin-left: -200px;
  z-index: 100;
  font-size: 1.5em;
}

.comboNum {
  font-family: "Anton", Impact, "Raleway", "Arial Narrow Bold", sans-serif;
  margin-top: -10px;
  font-size: 3.5em;
}

.center_judge {
  font-family: "Raleway";
  position: absolute;
  font-size: 3em;
  line-height: 80px;
  width: 400px;
  height: 80px;
  top: 65%;
  left: 50%;
  margin-left: -200px;
  z-index: 100;
  --judge-text-color: #ffffff;
  --judge-shadow-color: #000000;
  /* transition: opacity 2s ease-in-out; */
}

@media only screen and (max-width: 1000px) {
  /* mobile */
  .center_judge {
    margin-top: -45px;
  }

  .combo {
    margin-top: -35px;
  }
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

.judgeTypeAnimation {
  animation-name: perfectAni;
  animation-duration: 0.5s;
}

.judgePerfect {
  --judge-shadow-color: #15ff00;
}

.judgeGood {
  --judge-shadow-color: #00ffea;
}

.judgeOffbeat {
  --judge-shadow-color: rgb(255, 115, 0);
}

.judgeMiss {
  --judge-text-color: rgb(202, 0, 0);
  --judge-shadow-color: rgb(122, 0, 0);
}

@keyframes comboAni {
  from {
    padding-top: 0;
    opacity: 0.5;
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

  30% {
    transform: scale(1.25);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes perfectAni {
  from {
    text-shadow: none;
    opacity: 0.8;
  }

  30% {
    color: var(--judge-text-color);
    text-shadow: 0 0 30px var(--judge-shadow-color);
    opacity: 1;
  }

  100% {
    color: white;
    text-shadow: none;
  }
}
</style>
