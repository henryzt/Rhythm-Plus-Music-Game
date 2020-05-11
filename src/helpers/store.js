import Vue from "vue";
import Vuex from "vuex";
import * as fb from "./firebaseConfig";

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    audio: null,
    currentUser: null,
    userProfile: {},
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
            console.log(err);
          });
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
  },
});

// partly ref https://savvyapps.com/blog/definitive-guide-building-web-app-vuejs-firebase
