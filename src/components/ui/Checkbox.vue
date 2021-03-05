<template>
  <div @mousedown="mouseDown" @mouseup="mouseUp">
    <!-- no bg style -->
    <label v-if="cbStyle === 'no-bg'" class="cb_container">
      {{ label }}
      <input type="checkbox" v-model="model[modelKey]" />
      <span class="checkmark"></span>
    </label>
    <!-- form input style -->
    <label
      v-else-if="cbStyle === 'form'"
      class="cb_container input"
      style="width: 100%; text-align: left; padding-left: 40px;"
    >
      <span style="font-size: 14px;">{{ label }}</span>
      <input type="checkbox" v-model="model[modelKey]" />
      <span class="checkmark" style="top: 4px; left: 4px;"></span>
    </label>
    <!-- small style -->
    <label v-else class="cb_container cb_small">
      <input type="checkbox" v-model="model[modelKey]" />
      <span class="checkmark"></span>
      {{ label }}
    </label>
  </div>
</template>

<script>
export default {
  name: "Checkbox",
  props: ["label", "model", "modelKey", "cbStyle"],
  methods: {
    mouseDown() {
      this.$store.state.audio.playEffect("ui2/pop-down");
    },
    mouseUp() {
      const state = this.model[this.modelKey];
      this.$store.state.audio.playEffect(`ui2/pop-up-${state ? "off" : "on"}`);
    },
  },
};
</script>

<style scoped>
.cb_container:active:hover {
  transform: scale(0.95);
}
</style>
