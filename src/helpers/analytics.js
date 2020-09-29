import { analytics } from "./firebaseConfig";
import router from "./router";

export function logEvent(action, event) {
  analytics().logEvent(action, event);
  if (event) {
    event.event_label = Object.values(event)[0];
  }
  let reportEvent = event ?? {};
  reportEvent.event_category = router.currentRoute?.name;
  window.gtag("event", action, reportEvent);
}

export function logError(description, fatal) {
  const data = {
    description,
    fatal,
  };
  window.gtag("event", "exception", data);
  logEvent("exception", data);
}

export function sendPageview(path) {
  window.gtag("config", "UA-113940817-5", { page_path: path });
  analytics().setCurrentScreen(window.location.pathname);
  analytics().logEvent("page_view", { type: "internal" });
  analytics().logEvent("screen_view", { screen_name: path });
}

export function setUserId(uid) {
  analytics().setUserId(uid);
  window.gtag("config", "GA_MEASUREMENT_ID", {
    user_id: uid,
  });
}

export function setUserProps(props) {
  analytics().setUserProperties(props);
}
