// client/src/utils/battleCache.js
//
// Battle reports are expensive to build: the backend re-fetches the battle,
// its event stream and market prices on every request. Finished battles never
// change, so we memoise the report in localStorage and serve it instantly the
// next time the same battle is opened (tab switches, page reloads, revisits).
// Ongoing battles are never cached because their stats keep growing.

import { apiFetch } from '../api';

const PREFIX = 'battle-report:';
const TTL = 6 * 60 * 60 * 1000; // finished battles are effectively immutable for 6h
const MAX_ENTRIES = 8; // keep localStorage well under its quota

const keyFor = (guildId, battleId) => `${PREFIX}${guildId}:${battleId}`;

const allKeys = () => {
  const keys = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) keys.push(k);
    }
  } catch { /* storage unavailable */ }
  return keys;
};

const read = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || 'null');
    if (!parsed || typeof parsed.t !== 'number') return null;
    if (Date.now() - parsed.t > TTL) return null;
    return parsed.v;
  } catch {
    return null;
  }
};

const dropOldest = () => {
  let oldestKey = null;
  let oldestT = Infinity;
  for (const k of allKeys()) {
    let t = 0;
    try { t = JSON.parse(localStorage.getItem(k) || 'null')?.t || 0; } catch { /* ignore */ }
    if (t < oldestT) { oldestT = t; oldestKey = k; }
  }
  if (oldestKey) { try { localStorage.removeItem(oldestKey); } catch { /* ignore */ } }
};

const trim = () => {
  const keys = allKeys();
  if (keys.length < MAX_ENTRIES) return;
  const dated = keys
    .map((k) => {
      let t = 0;
      try { t = JSON.parse(localStorage.getItem(k) || 'null')?.t || 0; } catch { /* ignore */ }
      return { k, t };
    })
    .sort((a, b) => a.t - b.t);
  const excess = dated.length - MAX_ENTRIES + 1;
  for (let i = 0; i < excess; i++) { try { localStorage.removeItem(dated[i].k); } catch { /* ignore */ } }
};

const write = (key, value) => {
  const payload = JSON.stringify({ t: Date.now(), v: value });
  try {
    localStorage.setItem(key, payload);
    return;
  } catch { /* quota exceeded — make room and retry once */ }
  dropOldest();
  try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), v: value })); } catch { /* give up */ }
};

// Synchronous peek so a cached battle can render before we await anything.
export function peekBattleReport(guildId, battleId) {
  if (!guildId || !battleId) return null;
  return read(keyFor(guildId, battleId));
}

// Returns the cached report when present, otherwise fetches it and caches the
// result (only if the battle has ended). Pass { force } to bypass the cache.
export async function fetchBattleReport(guildId, battleId, { force = false } = {}) {
  if (!battleId) return null;
  const key = keyFor(guildId, battleId);

  if (!force) {
    const cached = read(key);
    if (cached) return cached;
  }

  const res = await apiFetch(`/guilds/${guildId}/military/battle-report`, {
    method: 'POST',
    body: JSON.stringify({ battleId, force }),
  });

  // Only finished battles are stable enough to cache.
  if (res && res.found && res.battle && res.battle.endTime) {
    trim();
    write(key, res);
  }
  return res;
}
