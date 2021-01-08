<template>
  <div :class="{ hidden: delaying }">
    <transition name="modal-fade">
      <div class="modal-backdrop" v-if="show && !delaying">
        <div class="modal">
          <section class="modal-body">
            <Loader color="white" style="display: inline; float: left;" />
            <div style="margin-left: 50px;">
              <slot>{{ text }}</slot>
            </div>
          </section>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import Loader from "vue-spinner/src/FadeLoader.vue";

export default {
  name: "Loading",
  props: {
    text: {
      type: String,
      default: "Loading...",
    },
    show: {
      type: Boolean,
      default: false,
    },
    delay: {
      type: Boolean,
      default: false,
    },
    delayLength: {
      type: Number,
      default: 1000,
    },
  },
  components: {
    Loader,
  },
  data: function () {
    return {
      delaying: false,
    };
  },
  methods: {
    delayLoading() {
      this.delaying = true;
      setTimeout(() => {
        this.delaying = false;
      }, this.delayLength);
    },
  },
  mounted() {
    if (this.delay) this.delayLoading();
  },
  watch: {
    show() {
      if (this.delay) this.delayLoading();
    },
  },
};
</script>

<style scoped>
.modal {
  margin: 30px;
  max-width: 500px;
  width: auto;
  background: transparent;
  box-shadow: none;
}

.modal-body {
  display: flex;
  padding: 30px;
}

.hidden {
  opacity: 0;
}
</style>
