import { demo } from "./demo.js";

export function saveToLocal(name, timeArr) {
  const local = JSON.parse(localStorage.getItem("localTimeline")) || {};
  local[name] = { timeline: timeArr };
  localStorage.setItem("localTimeline", JSON.stringify(local));
  console.log("saved");
}

export function loadFromLocal(name) {
  let local = localStorage.getItem("localTimeline");
  if (local && local.includes(name)) {
    local = JSON.parse(local);
    console.log("loaded");
    return local[name].timeline;
  }
  return [];
}

export function loadFromDemo(name) {
  if (demo && demo[name]) {
    return demo[name].timeline;
  }
}
