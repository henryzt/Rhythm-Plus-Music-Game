import { register } from "register-service-worker";

register(`/service-worker.js`, {
  ready() {
    Logger.log(
      "App is being served from cache by a service worker.\n" +
        "For more details, visit https://goo.gl/AFskqB"
    );
  },
  registered() {
    Logger.log("Service worker has been registered.");
  },
  cached() {
    Logger.log("Content has been cached for offline use.");
  },
  updatefound() {
    Logger.log("New content is downloading.");
  },
  updated() {
    Logger.log("New content is available; please refresh.");
  },
  offline() {
    Logger.log("No internet connection found. App is running in offline mode.");
  },
  error(error) {
    Logger.error("Error during service worker registration:", error);
  },
});
