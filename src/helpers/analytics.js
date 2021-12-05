import { analytics } from "./firebaseConfig";
import router from "./router";
import { store } from "./store";

let version;

function getVersion() {
  if (!version && store.state.appVersion) {
    version = `${store.state.appVersion}-${store.state.build}`;
  }
  return version ?? "unkown";
}

export function logEvent(action, event, category) {
  // log in fba
  let reportEvent = event ?? {};
  reportEvent.version = getVersion();
  reportEvent.uid = store.state.currentUser?.uid;
  reportEvent.route = router.currentRoute?.name;
  reportEvent.event_category = category ?? reportEvent.route;
  analytics().logEvent(action, reportEvent);
  // log also in gtag
  reportEvent.event_label = Object.values(reportEvent)[0];
  window.gtag("event", action, reportEvent);
  Logger.log("event logged - ", action);
}

export function logError(description, fatal) {
  const data = {
    description,
    fatal,
  };
  window.gtag("event", "exception", data);
  logEvent(`error-${getVersion()}`, data, "error");
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
