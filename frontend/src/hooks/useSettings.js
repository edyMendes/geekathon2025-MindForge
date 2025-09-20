// storage + helpers centralizados
const KEY_PREFIX = "chickenProfile_";
const HIST_PREFIX = "chickenHistory_";

export function listProfiles() {
  return Object.keys(localStorage)
    .filter((k) => k.startsWith(KEY_PREFIX))
    .map((k) => k.replace(KEY_PREFIX, ""));
}

export function saveProfile(name, data) {
  localStorage.setItem(KEY_PREFIX + name, JSON.stringify(data));
}

export function loadProfile(name) {
  const raw = localStorage.getItem(KEY_PREFIX + name);
  return raw ? JSON.parse(raw) : null;
}

export function removeProfile(name) {
  localStorage.removeItem(KEY_PREFIX + name);
  localStorage.removeItem(HIST_PREFIX + name);
}

export function getHistory(name) {
  const raw = localStorage.getItem(HIST_PREFIX + name);
  return raw ? JSON.parse(raw) : [];
}

export function addHistory(name, rec) {
  const arr = getHistory(name);
  arr.push(rec);
  arr.sort((a, b) => new Date(a.date) - new Date(b.date));
  localStorage.setItem(HIST_PREFIX + name, JSON.stringify(arr));
}
