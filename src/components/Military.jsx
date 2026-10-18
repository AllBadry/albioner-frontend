// client/src/components/Military.jsx
//
// 🎯 Military panel — the web home for everything we classified as "military".
// Timers, Battle Reports and CTA audits run straight from here (DB + Albion API),
// so they need no Discord channel. The military channel is only where the bot
// posts the live timer board — and it is chosen right here.

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../api';
import { number, itemImage } from '../utils/format';
import { useI18n } from '../i18n';
import { fetchBattleReport, peekBattleReport } from '../utils/battleCache';
import { getSelectedBattle, setSelectedBattle } from '../utils/selectedBattle';
import Regear from './Regear';
import Comp from './Comp';
import Season from './Season';

const TYPE_ICON = { castle: '🏰', territory: '⚔️', hideout: '🛡️' };

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
          <span className="text-gray-400 tabular-nums">{number.format(r.value)}</span>
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
  const { t, silver } = useI18n();
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
        <button onClick={onClose} className="absolute top-4 end-4 text-gray-500 hover:text-white text-xl leading-none" aria-label={t('common.close')}>✕</button>

        <div className="mb-5">
          <p className="text-white font-bold text-lg">{player.name}</p>
          <p className="text-gray-500 text-xs">
            {player.guildName || t('common.noGuild')} · IP {player.averageItemPower}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 mb-5">
          <Stat label={t('military.battle.kills')} value={player.kills} cls="text-green-400" />
          <Stat label={t('military.battle.deaths')} value={player.deaths} cls="text-red-400" />
          <Stat label={t('military.battle.killFame')} value={number.format(player.killFame)} cls="text-gray-200" />
          <Stat label={t('military.battle.gearDestroyed')} value={silver(player.destroyedValue || 0)} cls="text-green-400/80" />
          <Stat label={t('military.battle.gearDropped')} value={silver(player.lostValue || 0)} cls="text-red-400/80" />
          <span className="text-gray-600 text-xs sm:ms-auto">{t('military.battle.battleNo', { id: battleId })}{region ? ` · ${region}` : ''}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <h4 className="text-green-400 text-xs font-bold uppercase tracking-widest mb-3">
              {t('military.battle.killedTitle', { n: player.killed.length })}
            </h4>
            {player.killed.length === 0 ? (
              <p className="text-gray-600 text-sm">{t('military.battle.noKills')}</p>
            ) : (
              <div className="space-y-3">
                {player.killed.map((k, i) => (
                  <div key={i} className="bg-[#030303] border border-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-white text-sm font-bold truncate">{k.name}</p>
                      <span className="text-gray-500 text-[11px]">{k.guildName || t('common.noGuild')}</span>
                      <span className="ms-auto text-green-400/80 text-xs font-bold tabular-nums">{silver(k.value || 0)}</span>
                    </div>
                    <GearIcons items={k.equipment} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-red-400 text-xs font-bold uppercase tracking-widest mb-3">
              {t('military.battle.diedTitle', { n: player.died.length })}
            </h4>
            {player.died.length === 0 ? (
              <p className="text-gray-600 text-sm">{t('military.battle.neverDied')}</p>
            ) : (
              <div className="space-y-3">
                {player.died.map((d, i) => (
                  <div key={i} className="bg-[#030303] border border-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      {d.killerName && (
                        <p className="text-gray-500 text-[11px]">
                          {t('military.battle.killedBy', { name: d.killerName })}
                        </p>
                      )}
                      <span className="ms-auto text-red-400/80 text-xs font-bold tabular-nums">{silver(d.value || 0)}</span>
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
  const { t, silver } = useI18n();
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
          <h3 className="text-white font-bold uppercase tracking-widest">{t('military.battle.playersTitle')}</h3>
          <span className="text-gray-500 text-xs">{t('military.battle.playersCount', { n: players.length })}</span>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('military.battle.searchPlayer')}
            className="ms-auto bg-[#030303] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#e62b1e] transition-colors"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-500 text-xs font-bold uppercase tracking-widest border-b border-white/10">
                <th className="text-start py-2.5 font-bold">{t('common.player')}</th>
                <th className="text-end py-2.5 font-bold">{t('common.kills')}</th>
                <th className="text-end py-2.5 font-bold">{t('common.deaths')}</th>
                <th className="text-end py-2.5 font-bold">{t('common.fame')}</th>
                <th className="text-end py-2.5 font-bold">{t('military.battle.gearLost')}</th>
                <th className="text-end py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id || p.name} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="py-2.5">
                    <span className="text-white font-bold text-sm">{p.name}</span>
                    {p.guildName && <span className="text-gray-600 text-xs ms-2">{p.guildName}</span>}
                  </td>
                  <td className="text-end text-green-400 font-bold tabular-nums">{p.kills}</td>
                  <td className="text-end text-red-400 font-bold tabular-nums">{p.deaths}</td>
                  <td className="text-end text-gray-300 tabular-nums">{number.format(p.killFame)}</td>
                  <td className="text-end text-amber-400/80 tabular-nums">{p.lostValue ? silver(p.lostValue) : '—'}</td>
                  <td className="text-end">
                    <button
                      onClick={() => setSelected(p)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      {t('military.battle.view')}
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

function remaining(t, eventTime) {
  const diff = new Date(eventTime).getTime() - Date.now();
  if (diff <= 0) return t('military.remaining.now');
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return t('military.remaining.hm', { h, m });
  return t('military.remaining.m', { m });
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
  const { t } = useI18n();
  const timerTypes = [
    { value: 'castle', label: t('military.timers.typeCastle') },
    { value: 'territory', label: t('military.timers.typeTerritory') },
    { value: 'hideout', label: t('military.timers.typeHideout') },
  ];
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
        <h3 className="text-white font-bold uppercase tracking-widest">{t('military.timers.addTitle')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label={t('military.timers.type')}>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className={inputCls}
            >
              {timerTypes.map((tt) => (
                <option key={tt.value} value={tt.value}>{tt.label}</option>
              ))}
            </select>
          </Field>
          <Field label={t('military.timers.nameLocation')}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={t('military.timers.namePlaceholder')}
              className={inputCls}
            />
          </Field>
          <Field label={t('military.timers.hours')}>
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
          <Field label={t('military.timers.minutes')}>
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
          {saving ? t('military.timers.adding') : t('military.timers.add')}
        </button>
      </form>

      {error && (
        <div className="bg-red-950/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">{error}</div>
      )}

      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
          {t('military.timers.active')} {loading && <span className="text-gray-600 normal-case">· {t('common.loading')}</span>}
        </h3>
        {!loading && timers.length === 0 && <p className="text-gray-500 text-sm">{t('military.timers.none')}</p>}
        <div className="space-y-2">
          {timers.map((tm) => (
            <div key={tm.id} className="flex items-center gap-3 bg-[#030303] border border-white/5 rounded-xl px-4 py-3">
              <span className="text-lg">{TYPE_ICON[tm.type] || '📌'}</span>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-bold truncate">{tm.name}</p>
                <p className="text-gray-500 text-xs">
                  {new Date(tm.eventTime).toLocaleString()} · <span className="text-[#e62b1e]">{remaining(t, tm.eventTime)}</span>
                </p>
              </div>
              <button
                onClick={() => remove(tm.id)}
                className="text-red-400 hover:text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-red-950/40 border border-white/10 transition-colors"
              >
                {t('military.timers.remove')}
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
const BattleCard = ({ battle, region, ongoing }) => {
  const { t, timeAgo } = useI18n();
  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-5">
      <div className="flex flex-wrap items-center gap-4">
        <a
          href={`https://albiononline.com/killboard/battles/${battle.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white font-black uppercase tracking-tight hover:text-[#e62b1e]"
        >
          {t('military.battle.battleNo', { id: battle.id })}
        </a>
        {ongoing && (
          <span className="flex items-center gap-1.5 text-[#e62b1e] text-xs font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-[#e62b1e] animate-pulse" />
            {t('common.live')}
          </span>
        )}
        {region && <span className="text-gray-500 text-xs uppercase tracking-widest">{region}</span>}
        {battle.clusterName && (
          <span className="text-gray-500 text-xs uppercase tracking-widest">📍 {battle.clusterName}</span>
        )}
        <span className="text-gray-400 text-sm ms-auto">
          {battle.playerCount} {t('common.players')} · {battle.guildCount} {t('common.guilds')} · {number.format(battle.totalKills)} {t('common.kills')} ·{' '}
          {number.format(battle.totalFame)} {t('common.fame')}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ReportColumn title={t('military.battle.topKills')} rows={battle.topKills} />
        <ReportColumn title={t('military.battle.topDeaths')} rows={battle.topDeaths} />
        <ReportColumn title={t('military.battle.topFame')} rows={battle.topFame} />
      </div>
      {battle.startTime && (
        <p className="text-gray-600 text-xs">
          {t('military.battle.started', { time: timeAgo(battle.startTime) })}
          {battle.endTime ? ` ${t('military.battle.ended', { time: timeAgo(battle.endTime) })}` : ` ${t('military.battle.stillRunning')}`}
        </p>
      )}
    </div>
  );
};

function BattleTab({ guildId }) {
  const { t } = useI18n();
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
          <h3 className="text-white font-bold uppercase tracking-widest">{t('military.battle.latestTitle')}</h3>
          <span className="text-gray-500 text-xs">{t('military.battle.autoDetected')}</span>
          <button
            onClick={loadLatest}
            className="ms-auto px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-colors"
          >
            {t('common.refresh')}
          </button>
        </div>

        {autoLoading && <p className="text-gray-500 text-sm">{t('military.battle.loadingLatest')}</p>}

        {autoError && (
          <div className="bg-red-950/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
            {autoError}
          </div>
        )}

        {!autoLoading && !autoError && auto && !auto.found && (
          <p className="text-gray-500 text-sm">
            {auto.configured === false
              ? t('military.battle.setGuildName')
              : auto.unresolved
                ? t('military.battle.notRealGuild')
                : t('military.battle.noRecent')}
          </p>
        )}

        {autoBattle && <BattleCard battle={autoBattle} region={auto.region} ongoing={auto.ongoing} />}
        {autoBattle && (
          <button
            onClick={() => lookup(autoBattle.id, true)}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-white bg-[#e62b1e] hover:brightness-110 transition"
          >
            {t('military.battle.viewPlayers')}
          </button>
        )}
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-white font-bold uppercase tracking-widest">{t('military.battle.historyTitle')}</h3>
          <span className="text-gray-500 text-xs">{t('military.battle.historyHint')}</span>
          <button
            onClick={loadHistory}
            disabled={historyLoading}
            className="ms-auto px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-40"
          >
            {historyLoading ? t('common.refreshing') : t('common.refresh')}
          </button>
        </div>

        {historyError && (
          <div className="bg-red-950/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
            {historyError}
          </div>
        )}

        {!historyLoading && !historyError && history.length === 0 && (
          <p className="text-gray-500 text-sm">
            {t('military.battle.noSaved')}
          </p>
        )}

        {history.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <select value={picked} onChange={onPick} className={`${inputCls} flex-1 min-w-[240px]`}>
              <option value="">{t('military.battle.choose')}</option>
              {history.map((b) => (
                <option key={b.battleId} value={b.battleId}>
                  {`#${b.battleId} · ${b.clusterName || b.region || t('common.unknown')} · ${b.startTime ? new Date(b.startTime).toLocaleString() : ''} · ${number.format(b.totalKills)} ${t('common.kills')}${b.ongoing ? ` · ${t('common.live')}` : ''}`}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => picked && lookup(picked, true)}
              disabled={!picked || loading}
              title={t('military.battle.refreshTitle')}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ↻ {t('common.refresh')}
            </button>
          </div>
        )}
        {loading && <p className="text-gray-500 text-sm">{t('military.battle.loadingData')}</p>}
      </div>

      <form onSubmit={runManual} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-5">
        <h3 className="text-white font-bold uppercase tracking-widest">{t('military.battle.lookupTitle')}</h3>
        <p className="text-gray-500 text-sm">{t('military.battle.lookupHint')}</p>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={battleId}
            onChange={(e) => setBattleId(e.target.value)}
            placeholder={t('military.battle.idPlaceholder')}
            className={`${inputCls} flex-1 min-w-[240px]`}
          />
          <button
            type="submit"
            disabled={loading || !battleId.trim()}
            className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-white bg-[#e62b1e] hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? t('military.battle.analyzing') : t('military.battle.analyze')}
          </button>
          <button
            type="button"
            onClick={() => lookup(battleId.trim(), true)}
            disabled={loading || !battleId.trim()}
            title={t('military.battle.refreshTitle')}
            className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ↻ {t('common.refresh')}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-950/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">{error}</div>
      )}

      {manual && !manual.found && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-300 text-sm">
          {t('military.battle.notFound')}
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
const AUDIT_STATUS_CLS = {
  fought: 'bg-green-500/15 text-green-400 border-green-500/30',
  present: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  absent: 'bg-red-500/15 text-red-400 border-red-500/30',
};
const AUDIT_STATUS_KEY = {
  fought: 'military.audit.statusFought',
  present: 'military.audit.statusPresent',
  absent: 'military.audit.statusAfk',
};

const fmtMinutes = (t, mins) => {
  const m = mins || 0;
  const h = Math.floor(m / 60);
  return h > 0 ? t('military.minutes.hm', { h, m: m % 60 }) : t('military.minutes.m', { m });
};

function AuditTab({ guildId }) {
  const { t } = useI18n();
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
        <h3 className="text-white font-bold uppercase tracking-widest">{t('military.audit.title')}</h3>
        <p className="text-gray-500 text-sm">
          {t('military.audit.hint')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{t('military.audit.battleLabel')}</span>
            {battles.length > 0 ? (
              <select value={battleId} onChange={(e) => { setBattleId(e.target.value); setSelectedBattle(guildId, e.target.value); }} className={inputCls}>
                {battles.map((b) => (
                  <option key={b.battleId} value={b.battleId}>
                    {b.clusterName || t('common.unknown')} · {new Date(b.startTime).toLocaleString()}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={battleId}
                onChange={(e) => setBattleId(e.target.value)}
                placeholder={t('military.battle.idPlaceholder')}
                className={inputCls}
              />
            )}
          </label>

          <label className="space-y-2">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{t('military.audit.ctaLabel')}</span>
            <select value={ctaId} onChange={(e) => setCtaId(e.target.value)} className={inputCls}>
              <option value="">{t('military.audit.latestCta')}</option>
              {ctas.map((c) => (
                <option key={c.id} value={c.id}>
                  {new Date(c.endTime).toLocaleString()} · {t('military.audit.attendees', { n: c.attendeeCount })}
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
            {loading ? t('military.audit.running') : t('military.audit.run')}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-950/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">{error}</div>
      )}

      {state && !state.hasCta && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-300 text-sm">
          {t('military.audit.noCta')}
        </div>
      )}
      {state?.hasCta && !state.found && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-300 text-sm">
          {t('military.audit.notFound')}
        </div>
      )}

      {state?.hasCta && state.found && (
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-5">
          <p className="text-gray-400 text-sm">
            {t('military.audit.ended', { time: state.ctaEndTime ? new Date(state.ctaEndTime).toLocaleString() : t('common.unknown'), n: state.total })}
          </p>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-[#030303] border border-green-500/20 rounded-xl p-4">
              <p className="text-green-400 text-2xl font-bold">{state.activeFighters.length}</p>
              <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">{t('military.audit.fought')}</p>
            </div>
            <div className="bg-[#030303] border border-amber-500/20 rounded-xl p-4">
              <p className="text-amber-400 text-2xl font-bold">{state.presentNoCombat?.length || 0}</p>
              <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">{t('military.audit.presentNoCombat')}</p>
            </div>
            <div className="bg-[#030303] border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 text-2xl font-bold">{state.suspectedAfk.length}</p>
              <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">{t('military.audit.suspectedAfk')}</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-widest border-b border-white/10">
                  <th className="text-start px-4 py-3 font-bold">{t('military.audit.member')}</th>
                  <th className="text-end px-4 py-3 font-bold">{t('military.audit.timeInVoice')}</th>
                  <th className="text-end px-4 py-3 font-bold">{t('military.audit.k')}</th>
                  <th className="text-end px-4 py-3 font-bold">{t('military.audit.d')}</th>
                  <th className="text-end px-4 py-3 font-bold">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody>
                {state.attendees.map((a) => {
                  const key = AUDIT_STATUS_CLS[a.status] ? a.status : 'absent';
                  return (
                    <tr key={a.discordId} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                      <td className="px-4 py-3 text-white">{a.albionName}</td>
                      <td className="px-4 py-3 text-end text-gray-300">{fmtMinutes(t, a.minutes)}</td>
                      <td className="px-4 py-3 text-end text-gray-300">{a.kills}</td>
                      <td className="px-4 py-3 text-end text-gray-300">{a.deaths}</td>
                      <td className="px-4 py-3 text-end">
                        <span className={`inline-block px-2 py-0.5 rounded-md border text-xs font-bold ${AUDIT_STATUS_CLS[key]}`}>
                          {t(AUDIT_STATUS_KEY[key])}
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
  const { t } = useI18n();
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
        {t('military.botMissing')}
      </div>
    );
  }

  const saved = guild.settings?.militaryChannelId;

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl px-5 py-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1.5">{t('military.channelLabel')}</p>
          <select value={value} onChange={(e) => setValue(e.target.value)} disabled={loading} className={inputCls}>
            <option value="">{loading ? t('common.loadingChannels') : t('military.channelPlaceholder')}</option>
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
          {saving ? t('common.saving') : saved === value && saved ? t('common.saved') : t('military.channelSave')}
        </button>
      </div>
      <p className="text-gray-600 text-xs mt-2">
        {t('military.channelNote')}
      </p>
      {error && <p className="text-red-300 text-xs mt-2">{error}</p>}
    </div>
  );
}

// ---------- Panel ----------
const Military = ({ guild, onChannelSaved }) => {
  const { t } = useI18n();
  const [tab, setTab] = useState('timers');

  const tabs = [
    { key: 'timers', label: t('military.tabTimers') },
    { key: 'battle', label: t('military.tabBattle') },
    { key: 'regear', label: t('military.tabRegear') },
    { key: 'audit', label: t('military.tabAudit') },
    { key: 'comp', label: t('military.tabComp') },
    { key: 'season', label: t('military.tabSeason') },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white font-black uppercase tracking-tighter text-2xl lg:text-3xl">{t('military.title')}</h1>
        <p className="text-gray-500 text-sm">{t('military.subtitle')}</p>
      </div>

      <ChannelBar guild={guild} onSaved={onChannelSaved} />

      <div className="flex flex-wrap gap-2">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors border ${
              tab === tb.key
                ? 'bg-red-950/40 border-[#e62b1e] text-white'
                : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {tab === 'timers' && <TimersTab guildId={guild.id} />}
      {tab === 'battle' && <BattleTab guildId={guild.id} />}
      {tab === 'regear' && <Regear guild={guild} guildId={guild.id} />}
      {tab === 'audit' && <AuditTab guildId={guild.id} />}
      {tab === 'comp' && <Comp guildId={guild.id} />}
      {tab === 'season' && <Season guildId={guild.id} />}
    </div>
  );
};

export default Military;
