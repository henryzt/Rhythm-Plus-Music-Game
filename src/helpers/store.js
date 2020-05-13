import Vue from "vue";
import Vuex from "vuex";
import * as fb from "./firebaseConfig";
import md5 from "js-md5";

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    audio: null,
    currentUser: null,
    userProfile: {},
    profilePicture: null,
  },
  actions: {
    fetchUserProfile({ commit, state }) {
      if (state.currentUser) {
        fb.usersCollection
          .doc(state.currentUser.uid)
          .get()
          .then((res) => {
            commit("setUserProfile", res.data());
          })
          .catch((err) => {
            console.error(err);
          });
        this.dispatch("fetchProfilePicture");
      }
    },
    async fetchProfilePicture({ commit, state }) {
      if (state.currentUser) {
        let url = state.currentUser.photoURL;
        if (url) {
          commit("setProfilePciture", url);
        } else {
          let hash = md5(state.currentUser.email);
          let gravatar_link = "http://www.gravatar.com/avatar/" + hash + "?s=50&d=404";
          let response = await fetch(gravatar_link);
          if (response.status === 200) {
            commit("setProfilePciture", gravatar_link);
          } else {
            commit("setProfilePciture", null);
          }
        }
      }
    },
  },
  mutations: {
    setCurrentUser(state, val) {
      state.currentUser = val;
    },
    setUserProfile(state, val) {
      state.userProfile = val;
    },
    setProfilePciture(state, val) {
      state.profilePicture = val;
    },
    setAudio(state, val) {
      state.audio = val;
    },
  },
});

// partly ref https://savvyapps.com/blog/definitive-guide-building-web-app-vuejs-firebase
