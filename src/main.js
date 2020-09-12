import Vue from "vue";
import VueRouter from "vue-router";
import VueMoment from "vue-moment";
import VuePerfectScrollbar from "vue-perfect-scrollbar";
import VueProgressiveImage from "vue-progressive-image";
import App from "./App.vue";
import router from "./helpers/router";
import { store } from "./helpers/store";
import * as fb from "./helpers/firebaseConfig";
import Icon from "vue-awesome/components/Icon.vue";
import * as Sentry from "@sentry/browser";
import { Vue as VueIntegration } from "@sentry/integrations";

import "animate.css";
import "./registerServiceWorker";

const isDev = process.env.NODE_ENV === "development";

Logger.useDefaults({ defaultLevel: isDev ? Logger.DEBUG : Logger.ERROR });

Vue.config.productionTip = false;
Vue.config.devtools = isDev;

Vue.use(VueMoment);
Vue.use(VueRouter);
Vue.use(VueProgressiveImage);
Vue.component("v-bar", VuePerfectScrollbar);
Vue.component("v-icon", Icon);

if (!isDev) {
  Sentry.init({
    dsn:
      "https://7c0cf5f165ab4854994380c0a0d9711e@o424134.ingest.sentry.io/5355558",
    integrations: [
      new VueIntegration({ Vue, attachProps: true, logErrors: true }),
    ],
  });
}

const consoleHandler = Logger.createDefaultHandler();
Logger.setHandler((messages, context) => {
  consoleHandler(messages, context);
  if (context.level.value > Logger.WARN.value) {
    // ERROR level
    Sentry.captureException(messages[0]);
  }
});

new Vue({
  router,
  store,
  created() {
    fb.auth.onAuthStateChanged(async (user) => {
      Logger.log("User state changed", user);
      await this.$store.commit("setCurrentUser", user);
      if (!user && !this.$store.state.redirecting) {
        Logger.warn("User not logged in, creating anonymous profile...");
        fb.auth.signInAnonymously().catch((error) => {
          Logger.error(error.message);
        });
      }
    });
  },
  render: (h) => h(App),
}).$mount("#app");
