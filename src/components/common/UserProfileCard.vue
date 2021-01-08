<template>
  <div class="profile_card" :class="{ extend }" @click="handleClick">
    <div class="controls shadow" v-if="!extend">
      <v-icon
        :name="$store.state.audio.muteBg ? 'volume-mute' : 'volume-up'"
        scale="1.3"
        @mouseenter="handleHover"
        @click="$store.state.audio.toggleBgMute()"
      />
      <v-icon
        :name="$store.state.isFullscreen ? 'compress' : 'expand'"
        scale="1.3"
        @mouseenter="handleHover"
        @click="$store.commit('toggleFullscreen')"
      />
    </div>

    <div
      class="shadow cardWrapper"
      v-if="($store.state.authed && userProfile) || overrideProfile"
      @click="goToAccount"
      @mouseenter="handleHover"
    >
      <img v-if="userProfile.photoURL" :src="userProfile.photoURL" />
      <div class="detail">
        <div>
          {{
            userProfile.displayName ? userProfile.displayName : "Name not set"
          }}
        </div>
        <div
          style="opacity: 0.6;"
          v-if="userProfile.lvd && $store.state.verified"
        >
          Level.{{ userProfile.lvd }}
        </div>
        <div class="wrapper" v-if="extend && userProfile.lvd">
          <div class="progress-bar">
            <span
              class="progress-bar-fill increased"
              :style="{ width: percentage(true) + '%' }"
            ></span>
            <span
              class="progress-bar-fill"
              :style="{ width: percentage(false) + '%' }"
            ></span>
          </div>
        </div>
        <div v-if="!$store.state.verified" style="color: pink;">
          Not Verified
        </div>
      </div>
    </div>

    <div class="shadow" v-else @click="goToAccount">
      <div
        style="padding: 10px;"
        v-if="!extend"
        v-html="$store.state.initialized ? 'Login &<br>Register' : 'Loading...'"
      ></div>
      <div style="opacity: 0.5; padding: 15px;" v-else>
        Login or Register now
        <br />to save your progress and exp
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserProfileCard",
  props: ["extend", "overrideProfile", "oldProfile"],
  data: function () {
    return {};
  },
  mounted() {
    this.$store.commit("checkFullscreen");
  },
  computed: {
    percentage() {
      return (isDiff) => {
        let base = this.$store.state.userProfile;
        if (this.oldProfile?.lv) {
          // if old profile provided, diff bar shows new info, normal bar shows old
          if (!isDiff && base.lvd > this.oldProfile.lvd) return 0;
          base = isDiff ? base : this.oldProfile;
        }
        const dec = base.lv - base.lvd;
        return dec * 100;
      };
    },
    userProfile() {
      return this.overrideProfile ?? this.$store.state.userProfile;
    },
  },
  methods: {
    goToAccount() {
      if (!this.extend) this.$router.push("/account");
    },
    handleClick() {
      this.$store.state.audio.playEffect("ui/pop");
    },
    handleHover() {
      if (!this.extend) this.$store.state.audio.playHoverEffect("ui/ta");
    },
  },
};
</script>

<style scoped>
.fa-icon {
  padding: 5px;
  cursor: pointer;
  transition: 0.5s;
}
.fa-icon:hover {
  transform: scale(1.3);
}
.controls:hover {
  opacity: 1;
}
.controls {
  padding: 10px;
  opacity: 0.4;
  transition: 0.5s;
}

.profile_card {
  position: fixed;
  right: 0;
  top: 0;
  display: flex;
  align-items: center;
  opacity: 0.5;
  padding: 5px;
  cursor: pointer;
  z-index: 500;
  -webkit-tap-highlight-color: transparent;
}

.detail {
  display: flex;
  flex-direction: column;
  padding: 10px;
  width: 100%;
}
img {
  max-width: 50px;
  max-height: 50px;
}

.shadow {
  -webkit-filter: drop-shadow(0px 0px 5px rgba(0, 0, 0, 1));
  filter: drop-shadow(0px 0px 5px rgba(0, 0, 0, 1));
}

.extend {
  background: none;
  position: relative;
  right: auto;
  top: auto;
  opacity: 1;
  font-size: 1.2em;
  cursor: auto;
  text-align: left;
  width: 100%;
}

.extend .shadow {
  filter: none;
  -webkit-filter: none;
}

.extend img {
  max-width: 100px;
  max-height: 100px;
}

.cardWrapper {
  display: flex;
  align-items: center;
}

.extend .cardWrapper {
  width: 100%;
}

.wrapper {
  width: 100%;
  max-width: 200px;
  min-width: 140px;
}

.progress-bar {
  width: 100%;
  background-color: #838383;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
  margin: 10px 0;
  height: 5px;
  position: relative;
}

.progress-bar-fill {
  display: block;
  background-color: #ff9900;
  transition: width 500ms ease-in-out;
  position: absolute;
  height: 5px;
  left: 0;
}

.increased {
  background-color: #7bff00;
}

@media only screen and (max-width: 1000px) {
  /* mobile */
  .extend {
    font-size: 1em;
  }
  .extend img {
    max-width: 70px;
    max-height: 70px;
  }
  .controls {
    position: fixed;
    top: 0;
    left: 0;
    opacity: 1;
    padding: 10px;
  }
  .fa-icon {
    padding: 10px;
  }
  .fa-icon:hover {
    transform: none;
  }
}
</style>
