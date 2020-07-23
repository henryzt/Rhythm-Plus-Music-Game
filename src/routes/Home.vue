<template>
  <div>
    <div class="center_logo" v-if="$store.state">
      <img
        :src="
          'assets/' +
          ($store.state.theme ? $store.state.theme.logoAsset : 'logo2.png')
        "
        style="
          max-width: 550px;
          padding: 50px 0;
          width: 100%;
          box-sizing: border-box;
        "
      />
      <Button text="Start Game" @click="goToGame"></Button>
      <div class="text_button" @click="goToAuth">
        {{
          $store.state.authed
            ? "Welcome, " + $store.state.currentUser.displayName
            : "Login or Reigster"
        }}
      </div>
    </div>
  </div>
</template>

<script>
import Button from "../components/Button.vue";

export default {
  name: "Home",
  components: {
    Button,
  },
  data() {
    return {};
  },
  computed: {},
  watch: {},
  mounted() {},
  methods: {
    goToGame() {
      this.$router.push("/menu");
    },
    goToAuth() {
      this.$router.push("/account");
    },
  },
};
</script>

<style scoped></style>
