<template>
  <transition name="modal-fade">
    <div class="modal-backdrop" v-if="show">
      <div class="center">
        <div class="scoreCircle" ref="resultDiv">
          <VueCircle
            ref="circle"
            :progress="percentage"
            :size="150"
            :animation="false"
            :fill="{ gradient: ['darkorange', '#ffab2d'] }"
            empty-fill="rgba(100, 100, 100, .5)"
            :thickness="10"
            :start-angle="(-1 / 2) * Math.PI"
            insert-mode="append"
            :show-percent="false"
          >
            <div class="num">{{ num }}</div>
          </VueCircle>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import VueCircle from "vue2-circle-progress/src/index.vue";

export default {
  name: "Countdown",
  components: {
    VueCircle,
  },
  props: [],
  data() {
    return {
      percentage: 100,
      show: false,
      interval: null,
      num: 3,
    };
  },
  methods: {
    start() {
      clearInterval(this.interval);
      this.num = 3;
      this.show = true;
      this.percentage = 100;
      this.interval = setInterval(() => {
        this.percentage -= 1;
        this.$refs.circle.updateProgress(this.percentage);
        if (this.percentage < 66) this.num = 2;
        if (this.percentage < 33) this.num = 1;
        if (this.percentage <= 0) {
          this.clear();
        }
      }, 20);
    },
    clear() {
      this.show = false;
      clearInterval(this.interval);
      this.$emit("finish");
    },
  },
  watch: {
    num() {
      this.$store.state.audio.playEffect("ui/event");
    },
  },
};
</script>

<style scoped>
.num {
  font-size: 2em;
}
</style>
