import Vue from "vue";
import VueRouter from "vue-router";
import App from "./App.vue";
import firebase from "firebase";
import router from "./helpers/router";
import { store } from "./helpers/store";
import firebaseConfig from "./helpers/firebaseConfig";

Vue.config.productionTip = false;
Vue.config.devtools = process.env.NODE_ENV === "development";

Vue.use(VueRouter);

new Vue({
  router,
  store,
  created() {
    firebase.initializeApp(firebaseConfig);
  },
  render: (h) => h(App),
}).$mount("#app");
