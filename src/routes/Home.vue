<template>
  <div>
    <div class="center_logo" v-if="$store.state">
      <img
        class="logo"
        :src="
          'assets/' +
          ($store.state.theme ? $store.state.theme.logoAsset : 'logo2.png')
        "
      />
      <StartButton text="Start Game" @click="goToGame"></StartButton>
      <div class="text_button" @click="goToAuth">
        {{
          $store.state.authed
            ? "Welcome, " + $store.state.currentUser.displayName
            : "Login or Register"
        }}
      </div>
    </div>

    <div class="leftBottom">
      {{ $store.state.appVersionWithPrefix + "-" + $store.state.build }}
    </div>

    <AlphaNotice></AlphaNotice>
  </div>
</template>

<script>
import StartButton from "../components/ui/StartButton.vue";
import AlphaNotice from "../components/menus/AlphaNotice.vue";

export default {
  name: "Home",
  components: {
    StartButton,
    AlphaNotice,
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

<style scoped>
.leftBottom {
  position: fixed;
  left: 5px;
  bottom: 5px;
  opacity: 0.3;
}

@media only screen and (max-width: 1000px) {
  .leftBottom {
    display: none;
  }
}
</style>
