import Vue from "vue";
import App from "./App.vue";

Vue.config.productionTip = false;

// off in prod
console.log(process.env.NODE_ENV === "development");
Vue.config.devtools = true;

new Vue({
  render: (h) => h(App),
}).$mount("#app");
