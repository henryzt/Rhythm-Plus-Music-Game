import { register } from "register-service-worker";
import { logEvent } from "./helpers/analytics";

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
    console.warn("New content is available; please refresh.");
  },
  offline() {
    console.warn(
      "No internet connection found. App is running in offline mode."
    );
  },
  error(error) {
    Logger.error("Error during service worker registration:", error);
  },
});

window.addEventListener("beforeinstallprompt", () => {
  logEvent("before_install_prompt");
  Logger.log("Install Prompt");
});

window.addEventListener("appinstalled", () => {
  logEvent("app_installed");
  Logger.log("INSTALL: Success");
});

// https://web.dev/customize-install/
