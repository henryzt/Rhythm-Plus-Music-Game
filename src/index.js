import Vue from "vue";
import VueRouter from "vue-router";
import App from "./App.vue";
import router from "./helpers/router";
import { store } from "./helpers/store";
import * as fb from "./helpers/firebaseConfig";

Vue.config.productionTip = false;
Vue.config.devtools = process.env.NODE_ENV === "development";

Vue.use(VueRouter);

new Vue({
  router,
  store,
  created() {
    fb.auth.onAuthStateChanged((user) => {
      console.log("State changed", user);
      this.$store.commit("setCurrentUser", user);
      this.$store.dispatch("fetchUserProfile");
    });
  },
  render: (h) => h(App),
}).$mount("#app");
