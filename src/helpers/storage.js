export function setMeta(key, value) {
  const meta = getStorage("meta") ?? {};
  meta[key] = value;
  setStorage("meta", meta);
}

export function getMeta(key) {
  const meta = getStorage("meta") ?? {};
  return meta[key];
}

function getStorage(item) {
  const json = window.localStorage.getItem(item);
  const storage = json ? JSON.parse(json) : null;
  return storage;
}

function setStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}
