export function saveToLocal(name, timeArr) {
  const local = JSON.parse(localStorage.getItem("localTimeline")) || {};
  local[name] = { timeline: timeArr };
  localStorage.setItem("localTimeline", JSON.stringify(local));
}

export function loadFromLocal(name) {
  let local = localStorage.getItem("localTimeline");
  if (local && local.includes(name)) {
    local = JSON.parse(local);
    return local[name].timeline;
  }
  return [];
}
