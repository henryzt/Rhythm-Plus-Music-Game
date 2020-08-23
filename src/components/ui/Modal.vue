<template>
  <transition name="modal-fade">
    <div class="modal-backdrop" v-if="showModal">
      <div class="modal blurBackground" ref="modal">
        <header class="modal-header" :class="{ 'modal-darker': hideFooter }">
          <slot name="header">
            {{ titleText }}
            <div class="btn-action btn-close" @click="close" v-if="showCancel">
              <v-icon name="times" />
            </div>
          </slot>
        </header>
        <section class="modal-body" style="transform: translateZ(100px);">
          <slot>{{ bodyText }}</slot>
        </section>
        <footer class="modal-footer" v-if="!hideFooter">
          <slot name="footer">
            <div class="btn-action" @click="ok">{{ okText }}</div>
            <div class="btn-action" @click="close" v-if="showCancel">
              {{ cancelText }}
            </div>
          </slot>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script>
import VanillaTilt from "vanilla-tilt";
export default {
  name: "Modal",
  props: {
    okText: {
      type: String,
      default: "OK",
    },
    cancelText: {
      type: String,
      default: "Cancel",
    },
    titleText: {
      type: String,
      default: "Alert",
    },
    bodyText: {
      type: String,
      default: "",
    },
    hideFooter: {
      type: Boolean,
      default: false,
    },
    showCancel: {
      type: Boolean,
      default: true,
    },
  },
  data: function () {
    return {
      showModal: false,
      resolve: null,
    };
  },
  methods: {
    show() {
      this.showModal = true;
      this.$nextTick(this.addTilt);
      return new Promise((resolve) => {
        this.resolve = resolve;
      });
    },
    ok() {
      this.showModal = false;
      this.$emit("ok");
      if (this.resolve) this.resolve(true);
    },
    close() {
      this.showModal = false;
      this.$emit("close");
      if (this.resolve) this.resolve(false);
    },
    addTilt() {
      if (this.$refs.modal) {
        VanillaTilt.init(this.$refs.modal, {
          max: 0,
          glare: true,
          "max-glare": 0.2,
        });
      }
    },
  },
  mounted() {},
  watch: {},
};
</script>

<style scoped>
/* part ref https://www.digitalocean.com/community/tutorials/vuejs-vue-modal-component */

.modal-header,
.modal-footer {
  padding: 15px;
  display: flex;
}

.modal-header {
  color: #ffffff;
  justify-content: space-between;
}

.modal-footer {
  background: rgba(114, 114, 114, 0.4);
  justify-content: flex-end;
}

.modal-darker {
  background: rgba(114, 114, 114, 0.4);
}

.modal-body {
  position: relative;
  padding: 20px 30px;
}
</style>
