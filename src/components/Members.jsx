// client/src/components/Members.jsx
//
// 👥 Members panel — the tracked guild's roster with war stats. The roster is
// pulled from Albion (by the backend) whenever the guild name is saved, and the
// kill / death / loot-dropped numbers are aggregated from the kill log.

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../api';
import { number, silver, itemImage } from '../utils/format';

const DropGrid = ({ drops }) => (
  <div className="flex flex-wrap gap-2 pt-3">
    {drops.map((d) => (
      <div key={d.type} className="flex items-center gap-2 bg-[#030303] border border-white/10 rounded-lg px-2 py-1">
        <img
          src={itemImage(d.type)}
          alt=""
          className="w-7 h-7 rounded bg-black/40"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <span className="text-gray-400 text-xs">
          {d.count}× <span className="text-gray-300">{d.type}</span>
        </span>
      </div>
    ))}
  </div>
);

const Members = ({ guild }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);

  const load = useCallback(async () => {
    try {
      setError('');
      const res = await apiFetch(`/guilds/${guild.id}/members`);
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [guild.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);
      load();
    })();
    return () => { cancelled = true; };
  }, [load]);

  const sync = async () => {
    setSyncing(true);
    setError('');
    try {
      await apiFetch(`/guilds/${guild.id}/members/sync`, { method: 'POST' });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const members = data?.members || [];
  const filtered = query
    ? members.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()))
    : members;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-black uppercase tracking-tighter text-2xl lg:text-3xl">Members</h1>
          <p className="text-gray-500 text-sm">
            Roster for <span className="text-[#e62b1e] font-bold">{guild.name}</span>
            {data && <span className="text-gray-600"> · {data.count} members</span>}
          </p>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a member…"
          className="bg-[#030303] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#e62b1e] transition-colors"
        />
        <button
          onClick={sync}
          disabled={syncing}
          className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-40"
        >
          {syncing ? 'Syncing…' : 'Sync now'}
        </button>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">{error}</div>
      )}

      {loading && !data && <p className="text-gray-500 text-sm">Loading members…</p>}

      {data && members.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-24 border border-dashed border-white/10 rounded-xl">
          <div className="text-5xl mb-4 opacity-40">👥</div>
          <h3 className="text-white font-bold uppercase tracking-widest mb-2">No roster yet</h3>
          <p className="text-gray-500 text-sm max-w-md mb-6">
            Set the guild name in <span className="text-white">Server Setup</span>, then sync to pull the member list from Albion.
          </p>
          <button
            onClick={sync}
            disabled={syncing}
            className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-white bg-[#e62b1e] hover:brightness-110 transition disabled:opacity-40"
          >
            {syncing ? 'Syncing…' : 'Sync members'}
          </button>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1.1fr_1.1fr_1.2fr] gap-4 px-5 py-3 border-b border-white/10 text-gray-500 text-xs font-bold uppercase tracking-widest">
            <span>Member</span>
            <span className="text-right">Kills</span>
            <span className="text-right">Deaths</span>
            <span className="text-right">Kill fame</span>
            <span className="text-right">Death fame</span>
            <span className="text-right">Loot lost</span>
          </div>
          {filtered.map((m) => (
            <div key={m.memberId} className="border-b border-white/5 last:border-0">
              <button
                onClick={() => setOpenId(openId === m.memberId ? null : m.memberId)}
                disabled={m.drops.length === 0}
                className="w-full grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1.1fr_1.1fr_1.2fr] gap-4 px-5 py-3.5 text-left hover:bg-white/5 transition-colors disabled:cursor-default"
              >
                <span className="text-white font-bold text-sm truncate flex items-center gap-2">
                  {m.name}
                  <span className="text-gray-600 text-[10px] font-normal uppercase tracking-widest">IP {m.averageItemPower}</span>
                  {m.drops.length > 0 && <span className="text-gray-600 text-xs">▾</span>}
                </span>
                <span className="text-green-400 text-sm font-bold tabular-nums text-right">{m.kills}</span>
                <span className="text-red-400 text-sm font-bold tabular-nums text-right">{m.deaths}</span>
                <span className="text-gray-300 text-sm tabular-nums text-right">{number.format(m.killFame || 0)}</span>
                <span className="text-gray-400 text-sm tabular-nums text-right">{number.format(m.deathFame || 0)}</span>
                <span className="text-gray-300 text-sm tabular-nums text-right">
                  {m.lostValue > 0 ? <span className="text-amber-400/80">{silver(m.lostValue)}</span> : '—'}
                </span>
              </button>
              {openId === m.memberId && m.drops.length > 0 && (
                <div className="px-5 pb-4">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Items dropped ({m.drops.length})</p>
                  <DropGrid drops={m.drops} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && members.length > 0 && (
        <p className="text-gray-500 text-sm">No member matches “{query}”.</p>
      )}
    </div>
  );
};

export default Members;
