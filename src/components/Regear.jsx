// client/src/components/Regear.jsx
//
// ♻️ Regear sheet — for a chosen battle it collects the gear that the guild's
// own members dropped, groups it by player and prices every item, so an admin
// can grab the pieces they want to refund and remove the ones they don't. The
// decisions are remembered per battle (localStorage) so the sheet survives a
// refresh. Battle data (with prices) comes from the military battle-report API.

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../api';
import { number, silver, itemImage } from '../utils/format';
import { fetchBattleReport, peekBattleReport } from '../utils/battleCache';

const itemKey = (player, d, i) => `${player}|${d}|${i}`;
const storeKey = (guildId, id) => `regear:${guildId}:${id}`;

const SheetItem = ({ item, included, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors ${
      included ? 'border-white/10 bg-[#030303] hover:border-[#e62b1e]/50' : 'border-red-500/20 bg-red-950/10 opacity-50'
    }`}
    title={included ? 'Included — click to remove' : 'Removed — click to include'}
  >
    <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${included ? 'bg-[#e62b1e] border-[#e62b1e] text-white' : 'border-gray-600 text-transparent'}`}>✓</span>
    <img
      src={itemImage(item.type)}
      alt=""
      className="w-7 h-7 object-contain"
      onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
    />
    <span className="text-gray-300 text-xs">
      {item.count > 1 ? `${item.count}× ` : ''}{item.type}
    </span>
    <span className="ml-3 text-gray-400 text-xs tabular-nums">{item.price ? silver(item.price * item.count) : '—'}</span>
  </button>
);

const Regear = ({ guild, guildId }) => {
  const trackedName = (guild?.settings?.allianceName || guild?.name || '').toLowerCase();

  const [history, setHistory] = useState([]);
  const [battleId, setBattleId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [excluded, setExcluded] = useState(() => new Set());

  const loadExcluded = useCallback((id) => {
    try {
      setExcluded(new Set(JSON.parse(localStorage.getItem(storeKey(guildId, id)) || '[]')));
    } catch {
      setExcluded(new Set());
    }
  }, [guildId]);

  const loadReport = useCallback(async (id, force = false) => {
    if (!id) return;
    setError('');
    loadExcluded(id);
    // Serve the memoised report instantly; only hit the API on a miss/refresh.
    const cached = force ? null : peekBattleReport(guildId, id);
    if (cached) setData(cached);
    setLoading(!cached);
    try {
      const res = await fetchBattleReport(guildId, id, { force });
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [guildId, loadExcluded]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      try {
        const res = await apiFetch(`/guilds/${guildId}/military/battles`);
        if (cancelled) return;
        const list = res.battles || [];
        setHistory(list);
        if (list[0]) {
          setBattleId(String(list[0].battleId));
          loadReport(String(list[0].battleId));
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    })();
    return () => { cancelled = true; };
  }, [guildId, loadReport]);

  const persist = (id, next) => {
    try { localStorage.setItem(storeKey(guildId, id), JSON.stringify([...next])); } catch { /* ignore */ }
  };

  const toggle = (key) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      persist(battleId, next);
      return next;
    });
  };

  const setAll = (keys, exclude) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      for (const k of keys) { if (exclude) next.add(k); else next.delete(k); }
      persist(battleId, next);
      return next;
    });
  };

  // Keep only the tracked guild's own members in the regear sheet.
  const players = (data?.players || []).filter(
    (p) => !trackedName || (p.guildName || '').toLowerCase() === trackedName,
  );

  // Flatten every dropped item into keys so we can select / remove them.
  const allKeys = [];
  for (const p of players) {
    p.died.forEach((d, di) => d.equipment.forEach((_, ii) => allKeys.push(itemKey(p.id || p.name, di, ii))));
  }

  const includedTotal = players.reduce((sum, p) => {
    let s = 0;
    p.died.forEach((d, di) => d.equipment.forEach((it, ii) => {
      if (!excluded.has(itemKey(p.id || p.name, di, ii))) s += (it.price || 0) * (it.count || 1);
    }));
    return sum + s;
  }, 0);

  const totalDropped = players.reduce((sum, p) => sum + (p.lostValue || 0), 0);

  return (
    <div className="space-y-6">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-white font-bold uppercase tracking-widest">Regear sheet</h3>
          <span className="text-gray-500 text-xs">
            gear dropped by {guild?.settings?.allianceName || guild?.name || 'your guild'} — grab what you refund, remove the rest
          </span>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <label className="flex-1 min-w-[240px]">
            <span className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-1.5">Battle</span>
            <select
              value={battleId}
              onChange={(e) => { setBattleId(e.target.value); loadReport(e.target.value); }}
              className="w-full bg-[#030303] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#e62b1e] transition-colors"
            >
              <option value="">Choose a battle…</option>
              {history.map((b) => (
                <option key={b.battleId} value={b.battleId}>
                  {`#${b.battleId} · ${b.clusterName || b.region || 'unknown'} · ${b.startTime ? new Date(b.startTime).toLocaleString() : ''} · ${number.format(b.totalKills)} kills`}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => loadReport(battleId, true)}
            disabled={!battleId || loading}
            title="Re-fetch this battle's report from scratch"
            className="px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ↻ Refresh
          </button>
          {allKeys.length > 0 && (
            <>
              <button onClick={() => setAll(allKeys, false)} className="px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-colors">
                Grab all
              </button>
              <button onClick={() => setAll(allKeys, true)} className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-colors">
                Remove all
              </button>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-6 pt-2">
          <div>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Members</p>
            <p className="text-white text-xl font-black tabular-nums">{players.length}</p>
          </div>
          <div>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Total dropped</p>
            <p className="text-gray-300 text-xl font-black tabular-nums">{silver(totalDropped)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Selected for regear</p>
            <p className="text-[#e62b1e] text-xl font-black tabular-nums">{silver(includedTotal)}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">{error}</div>
      )}

      {loading && <p className="text-gray-500 text-sm">Loading battle data…</p>}

      {data && !data.found && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-300 text-sm">
          Battle not found on any Albion server.
        </div>
      )}

      {data?.found && players.length === 0 && (
        <p className="text-gray-500 text-sm">None of your guild members dropped gear in this battle.</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {players.map((p) => {
          const pid = p.id || p.name;
          const lost = p.died.reduce((s, d, di) => s + d.equipment.reduce((a, it, ii) => a + ((excluded.has(itemKey(pid, di, ii)) ? 0 : (it.price || 0) * (it.count || 1))), 0), 0);
          return (
            <div key={pid} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-white font-bold truncate">{p.name}</p>
                <span className="text-gray-600 text-xs">IP {p.averageItemPower}</span>
                <span className="ml-auto text-[#e62b1e] text-sm font-bold tabular-nums">{silver(lost)}</span>
              </div>
              <p className="text-gray-500 text-xs mb-3">
                {p.deaths} death(s) · killed {p.kills} · fame {number.format(p.killFame)}
              </p>
              <div className="space-y-3">
                {p.died.map((d, di) => (
                  <div key={di} className="bg-black/30 border border-white/5 rounded-xl p-3">
                    {d.killerName && (
                      <p className="text-gray-500 text-[11px] mb-2">
                        Killed by <span className="text-white font-bold">{d.killerName}</span>
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {d.equipment.map((it, ii) => (
                        <SheetItem
                          key={ii}
                          item={it}
                          included={!excluded.has(itemKey(pid, di, ii))}
                          onToggle={() => toggle(itemKey(pid, di, ii))}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Regear;
