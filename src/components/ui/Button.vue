<template>
  <div class="wrap">
    <button class="main_button" @click="clicked" @mouseenter="hover">
      {{ text }}
    </button>
  </div>
</template>

<script>
export default {
  name: "Button",
  props: ["text"],
  data: function () {
    return {};
  },
  mounted() {},
  methods: {
    hanldeHover() {
      this.$store.state.audio.playHoverEffect("ui/click2");
    },
    hanldeClick() {
      this.$store.state.audio.playEffect("ui/power");
      this.$emit("click", null);
    },
  },
};
</script>

<style scoped></style>
