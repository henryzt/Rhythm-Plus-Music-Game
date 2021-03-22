<template>
  <Modal
    style="z-index: 1000;"
    :okText="okText"
    :cancelText="cancelText"
    :titleText="titleText"
    :bodyText="bodyText"
    :showCancel="showCancel"
    :type="type"
    @ok="okCallback"
    @close="cancelCallback"
    ref="globalModal"
  ></Modal>
</template>

<script>
import Modal from "./Modal.vue";

function initialState() {
  return {
    okText: undefined,
    cancelText: undefined,
    titleText: undefined,
    bodyText: undefined,
    type: undefined,
    showCancel: true,
    okCallback: () => {},
    cancelCallback: () => {},
  };
}

export default {
  name: "ModalGlobal",
  props: [],
  components: {
    Modal,
  },
  data: function () {
    return initialState();
  },
  methods: {
    show(options) {
      Object.assign(this.$data, initialState());
      if (this.notNull(options.okText)) {
        this.okText = options.okText;
      }
      if (this.notNull(options.cancelText)) {
        this.cancelText = options.cancelText;
      }
      if (this.notNull(options.bodyText)) {
        this.bodyText = options.bodyText;
      }
      if (this.notNull(options.titleText)) {
        this.titleText = options.titleText;
      }
      if (this.notNull(options.type)) {
        this.type = options.type;
      }
      if (this.notNull(options.showCancel)) {
        this.showCancel = options.showCancel;
      }
      if (this.notNull(options.okCallback)) {
        this.okCallback = options.okCallback;
      }
      if (this.notNull(options.cancelCallback)) {
        this.cancelCallback = options.cancelCallback;
      }
      if (options.isError) {
        this.titleText = "Error";
        this.type = "error";
      }
      return this.$refs.globalModal.show();
    },
    notNull(value) {
      return value !== null && value !== undefined;
    },
  },
  mounted() {},
  watch: {},
};
</script>

<style scoped></style>
