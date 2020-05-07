import Vue from "vue";
import App from "./App.vue";

Vue.config.productionTip = false;
Vue.config.devtools = process.env.NODE_ENV === "development";

new Vue({
  render: (h) => h(App),
}).$mount("#app");
