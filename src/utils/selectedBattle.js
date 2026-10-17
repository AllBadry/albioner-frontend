// client/src/utils/selectedBattle.js
//
// Remembers which battle the admin is currently inspecting, per guild, in the
// browser. The Battle Report and Regear tabs read/write the same key so they
// always open on the same fight the admin last chose.

const keyFor = (guildId) => `battle:selected:${guildId}`;

export function getSelectedBattle(guildId) {
  try {
    return localStorage.getItem(keyFor(guildId)) || '';
  } catch {
    return '';
  }
}

export function setSelectedBattle(guildId, battleId) {
  try {
    if (battleId) localStorage.setItem(keyFor(guildId), String(battleId));
    else localStorage.removeItem(keyFor(guildId));
  } catch { /* storage unavailable */ }
}
