function saveToLocal(name) {
  let local = JSON.parse(localStorage.getItem("localTimeline")) || {};
  local[name] = { timeline: timeArr };
  localStorage.setItem("localTimeline", JSON.stringify(local));
}

function loadFromLocal(name) {
  let local = localStorage.getItem("localTimeline");
  if (local) {
    local = JSON.parse(local);
    timeArr = local[name].timeline;
  }
}
