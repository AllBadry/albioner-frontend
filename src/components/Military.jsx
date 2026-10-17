// client/src/components/Military.jsx
//
// 🎯 Military panel — the web home for everything we classified as "military".
// Timers, Battle Reports and CTA audits run straight from here (DB + Albion API),
// so they need no Discord channel. The military channel is only where the bot
// posts the live timer board — and it is chosen right here.

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../api';
import { number, timeAgo, silver, itemImage } from '../utils/format';
import { fetchBattleReport, peekBattleReport } from '../utils/battleCache';
import { getSelectedBattle, setSelectedBattle } from '../utils/selectedBattle';
import Regear from './Regear';

const TYPE_ICON = { castle: '🏰', territory: '⚔️', hideout: '🛡️' };
const TIMER_TYPES = [
  { value: 'castle', label: '🏰 Castle' },
  { value: 'territory', label: '⚔️ Territory' },
  { value: 'hideout', label: '🛡️ Hideout' },
];

const fame = new Intl.NumberFormat('en-US');

// Ranking column used by the Battle Report tab (defined at module scope so it is
// not re-created on every render).
const ReportColumn = ({ title, rows }) => (
  <div className="bg-[#030303] border border-white/5 rounded-xl p-4">
    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">{title}</p>
    {rows.length === 0 && <p className="text-gray-600 text-sm">—</p>}
    <ol className="space-y-2">
      {rows.map((r, i) => (
        <li key={r.name} className="flex items-center gap-2 text-sm">
          <span className="text-[#e62b1e] font-bold w-4">{i + 1}</span>
          <span className="text-white flex-1 truncate">{r.name}</span>
          <span className="text-gray-400 tabular-nums">{fame.format(r.value)}</span>
        </li>
      ))}
    </ol>
  </div>
);

// A row of item icons — used in the per-player popup to show gear.
const GearIcons = ({ items }) =>
  items.length > 0 ? (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it, i) => (
        <img
          key={`${it.type}-${i}`}
          src={itemImage(it.type)}
          alt={it.type}
          title={it.type}
          className="w-8 h-8 object-contain rounded bg-black/40 border border-white/10"
          onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
        />
      ))}
    </div>
  ) : (
    <p className="text-gray-600 text-xs">—</p>
  );

const Stat = ({ label, value, cls }) => (
  <div>
    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{label}</p>
    <p className={`text-lg font-black tabular-nums ${cls}`}>{value}</p>
  </div>
);

// 🔍 One player's battle card: everything he killed (with the victims' gear) and
// everything that dropped from him (his own gear on each death).
const PlayerModal = ({ player, region, battleId, onClose }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl my-8 bg-[#0a0a0a] border border-white/10 rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white text-xl leading-none" aria-label="Close">✕</button>

        <div className="mb-5">
          <p className="text-white font-bold text-lg">{player.name}</p>
          <p className="text-gray-500 text-xs">
            {player.guildName || 'no guild'} · IP {player.averageItemPower}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 mb-5">
          <Stat label="⚔️ Kills" value={player.kills} cls="text-green-400" />
          <Stat label="💀 Deaths" value={player.deaths} cls="text-red-400" />
          <Stat label="Kill fame" value={number.format(player.killFame)} cls="text-gray-200" />
          <Stat label="Gear destroyed" value={silver(player.destroyedValue || 0)} cls="text-green-400/80" />
          <Stat label="Gear dropped" value={silver(player.lostValue || 0)} cls="text-red-400/80" />
          <span className="text-gray-600 text-xs sm:ml-auto">Battle #{battleId}{region ? ` · ${region}` : ''}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <h4 className="text-green-400 text-xs font-bold uppercase tracking-widest mb-3">
              Killed — gear destroyed ({player.killed.length})
            </h4>
            {player.killed.length === 0 ? (
              <p className="text-gray-600 text-sm">No kills in this battle.</p>
            ) : (
              <div className="space-y-3">
                {player.killed.map((k, i) => (
                  <div key={i} className="bg-[#030303] border border-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-white text-sm font-bold truncate">{k.name}</p>
                      <span className="text-gray-500 text-[11px]">{k.guildName || 'no guild'}</span>
                      <span className="ml-auto text-green-400/80 text-xs font-bold tabular-nums">{silver(k.value || 0)}</span>
                    </div>
                    <GearIcons items={k.equipment} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-red-400 text-xs font-bold uppercase tracking-widest mb-3">
              Died — what dropped ({player.died.length})
            </h4>
            {player.died.length === 0 ? (
              <p className="text-gray-600 text-sm">Never died in this battle.</p>
            ) : (
              <div className="space-y-3">
                {player.died.map((d, i) => (
                  <div key={i} className="bg-[#030303] border border-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      {d.killerName && (
                        <p className="text-gray-500 text-[11px]">
                          Killed by <span className="text-white font-bold">{d.killerName}</span>
                        </p>
                      )}
                      <span className="ml-auto text-red-400/80 text-xs font-bold tabular-nums">{silver(d.value || 0)}</span>
                    </div>
                    <GearIcons items={d.equipment} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 📋 Every player in a selected battle, with a View button per player.
const BattlePlayers = ({ players, region, battleId }) => {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = q
    ? players.filter((p) =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        (p.guildName || '').toLowerCase().includes(q.toLowerCase()))
    : players;

  return (
    <div className="space-y-4">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-white font-bold uppercase tracking-widest">Players in this battle</h3>
          <span className="text-gray-500 text-xs">{players.length} players</span>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search player or guild…"
            className="ml-auto bg-[#030303] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#e62b1e] transition-colors"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-500 text-xs font-bold uppercase tracking-widest border-b border-white/10">
                <th className="text-left py-2.5 font-bold">Player</th>
                <th className="text-right py-2.5 font-bold">Kills</th>
                <th className="text-right py-2.5 font-bold">Deaths</th>
                <th className="text-right py-2.5 font-bold">Fame</th>
                <th className="text-right py-2.5 font-bold">Gear lost</th>
                <th className="text-right py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id || p.name} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="py-2.5">
                    <span className="text-white font-bold text-sm">{p.name}</span>
                    {p.guildName && <span className="text-gray-600 text-xs ml-2">{p.guildName}</span>}
                  </td>
                  <td className="text-right text-green-400 font-bold tabular-nums">{p.kills}</td>
                  <td className="text-right text-red-400 font-bold tabular-nums">{p.deaths}</td>
                  <td className="text-right text-gray-300 tabular-nums">{number.format(p.killFame)}</td>
                  <td className="text-right text-amber-400/80 tabular-nums">{p.lostValue ? silver(p.lostValue) : '—'}</td>
                  <td className="text-right">
                    <button
                      onClick={() => setSelected(p)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      View
          </button>
                    <button
                      onClick={() => setSelected(p)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <PlayerModal player={selected} region={region} battleId={battleId} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

function remaining(eventTime) {
  const diff = new Date(eventTime).getTime() - Date.now();
  if (diff <= 0) return 'now';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m`;
}

const Field = ({ label, children }) => (
  <label className="block">
    <span className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-1.5">{label}</span>
    {children}
  </label>
);

const inputCls =
  'w-full bg-[#030303] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#e62b1e] transition-colors';

// ---------- Timers ----------
function TimersTab({ guildId }) {
  const [timers, setTimers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ type: 'castle', name: '', hours: '', minutes: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      const res = await apiFetch(`/guilds/${guildId}/military/timers`);
      setTimers(res.timers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [guildId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);
      load();
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const add = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiFetch(`/guilds/${guildId}/military/timers`, {
        method: 'POST',
        body: JSON.stringify({
          type: form.type,
          name: form.name,
          hours: form.hours,
          minutes: form.minutes,
        }),
      });
      setForm((f) => ({ ...f, name: '', hours: '', minutes: '' }));
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await apiFetch(`/guilds/${guildId}/military/timers/${id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-5">
        <h3 className="text-white font-bold uppercase tracking-widest">Add a timer</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Type">
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className={inputCls}
            >
              {TIMER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Name / location">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Fort Sterling"
              className={inputCls}
            />
          </Field>
          <Field label="Hours">
            <input
              type="number"
              min="0"
              max="72"
              value={form.hours}
              onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
              placeholder="0"
              className={inputCls}
            />
          </Field>
          <Field label="Minutes">
            <input
              type="number"
              min="0"
              max="59"
              value={form.minutes}
              onChange={(e) => setForm((f) => ({ ...f, minutes: e.target.value }))}
              placeholder="0"
              className={inputCls}
            />
          </Field>
        </div>
        <button
          type="submit"
          disabled={saving || !form.name.trim()}
          className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-white bg-[#e62b1e] hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? 'Adding…' : 'Add timer'}
        </button>
      </form>

      {error && (
        <div className="bg-red-950/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">{error}</div>
      )}

      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
          Active timers {loading && <span className="text-gray-600 normal-case">· loading…</span>}
        </h3>
        {!loading && timers.length === 0 && <p className="text-gray-500 text-sm">No timers scheduled.</p>}
        <div className="space-y-2">
          {timers.map((t) => (
            <div key={t.id} className="flex items-center gap-3 bg-[#030303] border border-white/5 rounded-xl px-4 py-3">
              <span className="text-lg">{TYPE_ICON[t.type] || '📌'}</span>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-bold truncate">{t.name}</p>
                <p className="text-gray-500 text-xs">
                  {new Date(t.eventTime).toLocaleString()} · <span className="text-[#e62b1e]">{remaining(t.eventTime)}</span>
                </p>
              </div>
              <button
                onClick={() => remove(t.id)}
                className="text-red-400 hover:text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-red-950/40 border border-white/10 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Battle report ----------
// One battle rendered as a card. Shared by the auto (latest) fetch and the
// manual ID lookup so both look identical.
const BattleCard = ({ battle, region, ongoing }) => (
  <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-5">
    <div className="flex flex-wrap items-center gap-4">
      <a
        href={`https://albiononline.com/killboard/battles/${battle.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-white font-black uppercase tracking-tight hover:text-[#e62b1e]"
      >
        Battle {battle.id}
      </a>
      {ongoing && (
        <span className="flex items-center gap-1.5 text-[#e62b1e] text-xs font-bold uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-[#e62b1e] animate-pulse" />
          Live
        </span>
      )}
      {region && <span className="text-gray-500 text-xs uppercase tracking-widest">{region}</span>}
      {battle.clusterName && (
        <span className="text-gray-500 text-xs uppercase tracking-widest">📍 {battle.clusterName}</span>
      )}
      <span className="text-gray-400 text-sm ml-auto">
        {battle.playerCount} players · {battle.guildCount} guilds · {number.format(battle.totalKills)} kills ·{' '}
        {number.format(battle.totalFame)} fame
      </span>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ReportColumn title="☠️ Top kills" rows={battle.topKills} />
      <ReportColumn title="💀 Top deaths" rows={battle.topDeaths} />
      <ReportColumn title="💰 Top fame" rows={battle.topFame} />
    </div>
    {battle.startTime && (
      <p className="text-gray-600 text-xs">
        Started {timeAgo(battle.startTime)}
        {battle.endTime ? ` · ended ${timeAgo(battle.endTime)}` : ' · still running'}
      </p>
    )}
  </div>
);

function BattleTab({ guildId }) {
  const [auto, setAuto] = useState(null);
  const [autoError, setAutoError] = useState('');
  const [autoLoading, setAutoLoading] = useState(true);
  const [battleId, setBattleId] = useState('');
  const [manual, setManual] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');
  const [picked, setPicked] = useState('');

  const loadLatest = useCallback(async () => {
    try {
      const res = await apiFetch(`/guilds/${guildId}/military/latest-battle`);
      setAuto(res);
      setAutoError('');
      return res;
    } catch (err) {
      setAutoError(err.message);
      return null;
    } finally {
      setAutoLoading(false);
    }
  }, [guildId]);

  // Saved battle history — the backend refreshes it lazily if it is stale.
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      setHistoryError('');
      const res = await apiFetch(`/guilds/${guildId}/military/battles`);
      setHistory(res.battles || []);
    } catch (err) {
      setHistoryError(err.message);
    } finally {
      setHistoryLoading(false);
    }
  }, [guildId]);

  const lookup = useCallback(async (id, force = false) => {
    if (!id) return;
    setError('');
    // Render cached result instantly if available.
    const cached = force ? null : peekBattleReport(guildId, id);
    if (cached) setManual(cached);
    setLoading(!cached);
    try {
      const res = await fetchBattleReport(guildId, id, { force });
      setManual(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [guildId]);

  // Pull the freshest battle on open, then keep refreshing every 15s while it is
  // still ongoing (endTime null) so the stats update as kills stream in. The very
  // first hit also opens the full per-player report so the table is never empty.
  useEffect(() => {
    let cancelled = false;
    let timer;
    let didInitialLookup = false;
    (async () => {
      await Promise.resolve();
      loadHistory();
      const stored = getSelectedBattle(guildId);
      const tick = async () => {
        const res = await loadLatest();
        if (cancelled) return;
        if (!didInitialLookup) {
          if (stored) {
            didInitialLookup = true;
            setPicked(stored);
            lookup(stored);
          } else if (res?.found && res.battle) {
            didInitialLookup = true;
            lookup(res.battle.id);
          }
        }
        if (res?.ongoing) timer = setTimeout(tick, 15000);
      };
      tick();
    })();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [guildId, loadLatest, loadHistory, lookup]);

  const runManual = (e) => {
    e.preventDefault();
    if (!battleId) return;
    setSelectedBattle(guildId, battleId);
    lookup(battleId);
  };

  const onPick = (e) => {
    const id = e.target.value;
    setPicked(id);
    setSelectedBattle(guildId, id);
    if (id) lookup(id);
  };

  const autoBattle = auto?.found ? auto.battle : null;

  return (
    <div className="space-y-6">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-white font-bold uppercase tracking-widest">Latest battle</h3>
          <span className="text-gray-500 text-xs">auto-detected from your tracked guild</span>
          <button
            onClick={loadLatest}
            className="ml-auto px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-colors"
          >
            Refresh
          </button>
        </div>

        {autoLoading && <p className="text-gray-500 text-sm">Loading the latest battle…</p>}

        {autoError && (
          <div className="bg-red-950/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
            {autoError}
          </div>
        )}

        {!autoLoading && !autoError && auto && !auto.found && (
          <p className="text-gray-500 text-sm">
            {auto.configured === false
              ? 'Set the guild name in Server Setup to auto-track its battles.'
              : auto.unresolved
                ? 'The saved name is not a real Albion guild, so no battle could be found.'
                : 'No recent battles found for this guild.'}
          </p>
        )}

        {autoBattle && <BattleCard battle={autoBattle} region={auto.region} ongoing={auto.ongoing} />}
        {autoBattle && (
          <button
            onClick={() => lookup(autoBattle.id, true)}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-white bg-[#e62b1e] hover:brightness-110 transition"
          >
            View players
          </button>
        )}
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-white font-bold uppercase tracking-widest">Battle history</h3>
          <span className="text-gray-500 text-xs">pick any saved fight and fetch its data</span>
          <button
            onClick={loadHistory}
            disabled={historyLoading}
            className="ml-auto px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-40"
          >
            {historyLoading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {historyError && (
          <div className="bg-red-950/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
            {historyError}
          </div>
        )}

        {!historyLoading && !historyError && history.length === 0 && (
          <p className="text-gray-500 text-sm">
            No saved battles yet. They are recorded automatically as your guild fights.
          </p>
        )}

        {history.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <select value={picked} onChange={onPick} className={`${inputCls} flex-1 min-w-[240px]`}>
              <option value="">Choose a battle…</option>
              {history.map((b) => (
                <option key={b.battleId} value={b.battleId}>
                  {`#${b.battleId} · ${b.clusterName || b.region || 'unknown'} · ${b.startTime ? new Date(b.startTime).toLocaleString() : ''} · ${number.format(b.totalKills)} kills${b.ongoing ? ' · Live' : ''}`}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => picked && lookup(picked, true)}
              disabled={!picked || loading}
              title="Re-fetch the selected battle from scratch"
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ↻ Refresh
            </button>
          </div>
        )}
        {loading && <p className="text-gray-500 text-sm">Loading battle data…</p>}
      </div>

      <form onSubmit={runManual} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-5">
        <h3 className="text-white font-bold uppercase tracking-widest">Look up a battle by ID</h3>
        <p className="text-gray-500 text-sm">Paste a Killboard battle ID to get the top damage, healing and kills.</p>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={battleId}
            onChange={(e) => setBattleId(e.target.value)}
            placeholder="Battle ID from the Killboard link"
            className={`${inputCls} flex-1 min-w-[240px]`}
          />
          <button
            type="submit"
            disabled={loading || !battleId.trim()}
            className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-white bg-[#e62b1e] hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing…' : 'Analyze'}
          </button>
          <button
            type="button"
            onClick={() => lookup(battleId.trim(), true)}
            disabled={loading || !battleId.trim()}
            title="Re-fetch the selected battle from scratch"
            className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ↻ Refresh
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-950/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">{error}</div>
      )}

      {manual && !manual.found && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-300 text-sm">
          Battle not found on any Albion server.
        </div>
      )}

      {manual?.found && <BattleCard battle={manual.battle} region={manual.region} ongoing={false} />}

      {manual?.found && manual.players?.length > 0 && (
        <BattlePlayers players={manual.players} region={manual.region} battleId={manual.battle.id} />
      )}
    </div>
  );
}

// ---------- Audit CTA ----------
const AUDIT_STATUS = {
  fought: { label: '✓ Fought', cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
  present: { label: '◍ No combat', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  absent: { label: '⚠ AFK', cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
};

const fmtMinutes = (mins) => {
  const m = mins || 0;
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
};

function AuditTab({ guildId }) {
  const [battles, setBattles] = useState([]);
  const [ctas, setCtas] = useState([]);
  const [battleId, setBattleId] = useState('');
  const [ctaId, setCtaId] = useState('');
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      await Promise.resolve();
      try {
        const [b, c] = await Promise.all([
          apiFetch(`/guilds/${guildId}/military/battles`),
          apiFetch(`/guilds/${guildId}/military/ctas`),
        ]);
        if (!active) return;
        const list = b.battles || [];
        setBattles(list);
        const stored = getSelectedBattle(guildId);
        const storedBattle = list.find((x) => String(x.battleId) === stored);
        setBattleId((cur) => cur || String(storedBattle?.battleId || list[0]?.battleId || ''));
        const ctaList = c.ctas || [];
        setCtas(ctaList);
        setCtaId((cur) => cur || String(ctaList[0]?.id || ''));
      } catch {
        /* lists are optional — the audit still works with a manual id */
      }
    })();
    return () => { active = false; };
  }, [guildId]);

  const run = async (e) => {
    e.preventDefault();
    if (!battleId.trim()) return;
    setLoading(true);
    setError('');
    setState(null);
    try {
      const res = await apiFetch(`/guilds/${guildId}/military/audit-cta`, {
        method: 'POST',
        body: JSON.stringify({ battleId, ctaId: ctaId || undefined }),
      });
      setState(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={run} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-5">
        <h3 className="text-white font-bold uppercase tracking-widest">Audit CTA</h3>
        <p className="text-gray-500 text-sm">
          Cross-match a CTA roster with a battle to flag players who joined voice but never fought.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Battle</span>
            {battles.length > 0 ? (
              <select value={battleId} onChange={(e) => { setBattleId(e.target.value); setSelectedBattle(guildId, e.target.value); }} className={inputCls}>
                {battles.map((b) => (
                  <option key={b.battleId} value={b.battleId}>
                    {b.clusterName || 'Unknown'} · {new Date(b.startTime).toLocaleString()}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={battleId}
                onChange={(e) => setBattleId(e.target.value)}
                placeholder="Battle ID from the Killboard link"
                className={inputCls}
              />
            )}
          </label>

          <label className="space-y-2">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">CTA</span>
            <select value={ctaId} onChange={(e) => setCtaId(e.target.value)} className={inputCls}>
              <option value="">Latest finished CTA</option>
              {ctas.map((c) => (
                <option key={c.id} value={c.id}>
                  {new Date(c.endTime).toLocaleString()} · {c.attendeeCount} attendee(s)
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !battleId.trim()}
            className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-white bg-[#e62b1e] hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Auditing…' : 'Audit'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-950/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">{error}</div>
      )}

      {state && !state.hasCta && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-300 text-sm">
          No finished CTA found for this server. Run a CTA in Discord first.
        </div>
      )}
      {state?.hasCta && !state.found && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-300 text-sm">
          Battle not found on any Albion server.
        </div>
      )}

      {state?.hasCta && state.found && (
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-5">
          <p className="text-gray-400 text-sm">
            CTA ended {state.ctaEndTime ? new Date(state.ctaEndTime).toLocaleString() : 'unknown'} · {state.total} attendee(s)
          </p>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-[#030303] border border-green-500/20 rounded-xl p-4">
              <p className="text-green-400 text-2xl font-bold">{state.activeFighters.length}</p>
              <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">Fought</p>
            </div>
            <div className="bg-[#030303] border border-amber-500/20 rounded-xl p-4">
              <p className="text-amber-400 text-2xl font-bold">{state.presentNoCombat?.length || 0}</p>
              <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">Present, no combat</p>
            </div>
            <div className="bg-[#030303] border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 text-2xl font-bold">{state.suspectedAfk.length}</p>
              <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">Suspected AFK</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-widest border-b border-white/10">
                  <th className="text-left px-4 py-3 font-bold">Member</th>
                  <th className="text-right px-4 py-3 font-bold">Time in voice</th>
                  <th className="text-right px-4 py-3 font-bold">K</th>
                  <th className="text-right px-4 py-3 font-bold">D</th>
                  <th className="text-right px-4 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {state.attendees.map((a) => {
                  const s = AUDIT_STATUS[a.status] || AUDIT_STATUS.absent;
                  return (
                    <tr key={a.discordId} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                      <td className="px-4 py-3 text-white">{a.albionName}</td>
                      <td className="px-4 py-3 text-right text-gray-300">{fmtMinutes(a.minutes)}</td>
                      <td className="px-4 py-3 text-right text-gray-300">{a.kills}</td>
                      <td className="px-4 py-3 text-right text-gray-300">{a.deaths}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded-md border text-xs font-bold ${s.cls}`}>
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Military channel selector ----------
function ChannelBar({ guild, onSaved }) {
  const [channels, setChannels] = useState([]);
  const [value, setValue] = useState(guild.settings?.militaryChannelId || '');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!guild.botPresent) return;
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);
      try {
        const res = await apiFetch(`/guilds/${guild.id}/channels`);
        if (!cancelled) setChannels(res.channels || []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [guild.id, guild.botPresent]);

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await apiFetch(`/guilds/${guild.id}/military/channel`, {
        method: 'PATCH',
        body: JSON.stringify({ channelId: value }),
      });
      if (onSaved) onSaved(value);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!guild.botPresent) {
    return (
      <div className="bg-[#0a0a0a] border border-amber-500/30 rounded-2xl px-5 py-4 text-amber-300 text-sm">
        The bot is not in this server yet. Add it first to choose a military channel (timers still work below).
      </div>
    );
  }

  const saved = guild.settings?.militaryChannelId;

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl px-5 py-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1.5">Military channel</p>
          <select value={value} onChange={(e) => setValue(e.target.value)} disabled={loading} className={inputCls}>
            <option value="">{loading ? 'Loading channels…' : 'Select a channel…'}</option>
            {channels.map((c) => (
              <option key={c.id} value={c.id}>#{c.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={save}
          disabled={saving || !value || value === saved}
          className="px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-white bg-[#e62b1e] hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : saved === value && saved ? 'Saved' : 'Save channel'}
        </button>
      </div>
      <p className="text-gray-600 text-xs mt-2">
        The bot posts the live timer board here. Other military tools below run directly on the website.
      </p>
      {error && <p className="text-red-300 text-xs mt-2">{error}</p>}
    </div>
  );
}

// ---------- Panel ----------
const Military = ({ guild, onChannelSaved }) => {
  const [tab, setTab] = useState('timers');

  const tabs = [
    { key: 'timers', label: '⏳ Timers' },
    { key: 'battle', label: '📊 Battle Report' },
    { key: 'regear', label: '♻️ Regear' },
    { key: 'audit', label: '🔍 Audit CTA' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white font-black uppercase tracking-tighter text-2xl lg:text-3xl">Military</h1>
        <p className="text-gray-500 text-sm">Timers, battle intelligence and attendance audits — all from the website.</p>
      </div>

      <ChannelBar guild={guild} onSaved={onChannelSaved} />

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors border ${
              tab === t.key
                ? 'bg-red-950/40 border-[#e62b1e] text-white'
                : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'timers' && <TimersTab guildId={guild.id} />}
      {tab === 'battle' && <BattleTab guildId={guild.id} />}
      {tab === 'regear' && <Regear guild={guild} guildId={guild.id} />}
      {tab === 'audit' && <AuditTab guildId={guild.id} />}
    </div>
  );
};

export default Military;
