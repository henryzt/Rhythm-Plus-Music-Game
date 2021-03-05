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
          <slot>
            <div class="flex_hori">
              <v-icon :name="icon" scale="2"></v-icon>
              <div class="bodyText">{{ bodyText }}</div>
            </div>
          </slot>
        </section>
        <footer class="modal-footer" v-if="!hideFooter">
          <slot name="footer">
            <div class="btn-action" @click="ok" v-if="showOk">{{ okText }}</div>
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
import "vue-awesome/icons/regular/question-circle";
import "vue-awesome/icons/info-circle";
import "vue-awesome/icons/exclamation-circle";
import "vue-awesome/icons/exclamation-triangle";

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
    showOk: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      default: "info",
    },
  },
  data: function () {
    return {
      showModal: false,
      resolve: null,
      icon: "info-circle",
    };
  },
  methods: {
    show() {
      if (!this.showModal) this.$store.state.audio.playEffect("ui/bonk");
      this.showModal = true;
      this.$nextTick(() => {
        this.addTilt();
        if (this.type == "question") {
          this.icon = "regular/question-circle";
        } else if (this.type == "error") {
          this.icon = "exclamation-triangle";
        } else if (this.type == "warning") {
          this.icon = "exclamation-circle";
        } else {
          this.icon = "info-circle";
        }
      });
      return new Promise((resolve) => {
        this.resolve = resolve;
      });
    },
    ok() {
      if (this.showModal) this.$store.state.audio.playEffect("ui/pop");
      this.showModal = false;
      this.$emit("ok");
      if (this.resolve) this.resolve(true);
    },
    close() {
      if (this.showModal) this.$store.state.audio.playEffect("ui/loose");
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

.bodyText {
  flex-grow: 1;
  text-align: left;
  padding-left: 20px;
}
</style>
