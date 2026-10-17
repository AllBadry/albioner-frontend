// client/src/components/Inbox.jsx
//
// 📥 Admin Inbox — every pending member request lands here so an admin can
// review it straight from the website: join applications (with the player's
// stats snapshot) and regear requests (with the gear that dropped and its
// silver value). Approving/rejecting also notifies the member on Discord.

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { number, silver, itemImage, timeAgo } from '../utils/format';

const Card = ({ children, className = '' }) => (
  <div className={`bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 sm:p-6 ${className}`}>{children}</div>
);

const Stat = ({ label, value, tone = 'text-white' }) => (
  <div className="min-w-[90px]">
    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{label}</p>
    <p className={`${tone} text-lg font-black tabular-nums`}>{value}</p>
  </div>
);

const Pill = ({ children, tone }) => (
  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${tone}`}>
    {children}
  </span>
);

const ReviewButtons = ({ onReview, busy }) => (
  <div className="flex gap-2">
    <button
      onClick={() => onReview('approve')}
      disabled={busy}
      className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-white bg-green-600 hover:bg-green-500 transition-colors disabled:opacity-40"
    >
      Approve
    </button>
    <button
      onClick={() => onReview('reject')}
      disabled={busy}
      className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-white bg-red-700 hover:bg-red-600 transition-colors disabled:opacity-40"
    >
      Reject
    </button>
  </div>
);

// ---------- Regear request ----------
function RegearCard({ req, guildId, onDone }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const expand = async () => {
    const next = !open;
    setOpen(next);
    if (next && !detail) {
      setLoading(true);
      setError('');
      try {
        setDetail(await apiFetch(`/guilds/${guildId}/inbox/regear/${req.id}`));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const review = async (action) => {
    setBusy(true);
    setError('');
    try {
      await apiFetch(`/guilds/${guildId}/inbox/regear/${req.id}`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      onDone(req.id);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-2xl">♻️</span>
        <div className="min-w-0 flex-1">
          <p className="text-white font-bold truncate">{req.albionName}</p>
          <p className="text-gray-500 text-xs">
            Regear request · {req.createdAt ? timeAgo(req.createdAt) : ''}
            {req.eventId ? ` · kill ${req.eventId}` : ''}
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Claimed</p>
          <p className="text-[#e62b1e] font-black tabular-nums">{silver(req.silverValue)}</p>
        </div>
        <button
          onClick={expand}
          className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-colors"
        >
          {open ? 'Hide gear' : 'View gear'}
        </button>
      </div>

      {error && <p className="text-red-300 text-sm mt-3">{error}</p>}
      {open && loading && <p className="text-gray-500 text-sm mt-3">Loading gear…</p>}

      {open && detail && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
          {detail.detail ? (
            <>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-400">
                {detail.detail.killerName && (
                  <span>
                    Killed by <span className="text-white font-bold">{detail.detail.killerName}</span>
                    {detail.detail.killerIp ? ` [${detail.detail.killerIp} IP]` : ''}
                  </span>
                )}
                {detail.detail.victimIp ? <span>Victim IP {detail.detail.victimIp}</span> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {detail.detail.items.map((it, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#030303] px-2 py-1.5">
                    <img
                      src={itemImage(it.type)}
                      alt=""
                      className="w-7 h-7 object-contain"
                      onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                    />
                    <span className="text-gray-300 text-xs">
                      {it.count > 1 ? `${it.count}× ` : ''}{it.type}
                    </span>
                    <span className="text-gray-400 text-xs tabular-nums ml-1">{it.price ? silver(it.value) : '—'}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-xs">
                  Re-fetched live gear value: <span className="text-white font-bold">{silver(detail.detail.total)}</span>
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-sm">No killboard link attached, so gear cannot be re-fetched.</p>
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
        <ReviewButtons onReview={review} busy={busy} />
      </div>
    </Card>
  );
}

// ---------- Join application ----------
function ApplicationCard({ app, guildId, onDone }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const review = async (action) => {
    setBusy(true);
    setError('');
    try {
      await apiFetch(`/guilds/${guildId}/inbox/application/${app.id}`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      onDone(app.id);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-2xl">📋</span>
        <div className="min-w-0 flex-1">
          <p className="text-white font-bold truncate">{app.albionName}</p>
          <p className="text-gray-500 text-xs">
            Join application · {app.createdAt ? timeAgo(app.createdAt) : ''}
            {app.serverRegion ? ` · ${app.serverRegion}` : ''}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Stat label="PvP fame" value={number.format(app.pvpFame)} tone="text-green-400" />
        <Stat label="PvE fame" value={number.format(app.pveFame)} />
        <Stat label="Death fame" value={number.format(app.deathFame)} tone="text-red-400" />
        <Stat label="Ratio" value={app.fameRatio ?? '∞'} />
        <Stat label="Kills" value={number.format(app.killCount)} />
        <Stat label="Win rate" value={`${app.winRate}%`} tone="text-amber-400" />
      </div>

      {app.history?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Guild / alliance history</p>
          <div className="flex flex-wrap gap-2">
            {app.history.map((h, i) => (
              <Pill key={i} tone="border-white/10 text-gray-300 bg-white/5">
                {h.name} ({h.count})
              </Pill>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-red-300 text-sm mt-3">{error}</p>}

      <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
        <ReviewButtons onReview={review} busy={busy} />
      </div>
    </Card>
  );
}

// ---------- Panel ----------
const Inbox = ({ guildId, onReviewed }) => {
  const [tab, setTab] = useState('regears');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setError('');
      setData(await apiFetch(`/guilds/${guildId}/inbox`));
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
      if (!cancelled) load();
    })();
    return () => { cancelled = true; };
  }, [load]);

  const removeRegear = (id) => {
    setData((d) => (d ? { ...d, regears: d.regears.filter((r) => r.id !== id) } : d));
    onReviewed?.();
  };
  const removeApplication = (id) => {
    setData((d) => (d ? { ...d, applications: d.applications.filter((a) => a.id !== id) } : d));
    onReviewed?.();
  };

  const regears = data?.regears || [];
  const applications = data?.applications || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <h1 className="text-white font-black uppercase tracking-tighter text-2xl lg:text-3xl">Inbox</h1>
          <p className="text-gray-500 text-sm">Member requests waiting for your review.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="ml-auto px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-40"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTab('regears')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors border ${
            tab === 'regears'
              ? 'bg-red-950/40 border-[#e62b1e] text-white'
              : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          ♻️ Regear {regears.length > 0 ? `(${regears.length})` : ''}
        </button>
        <button
          onClick={() => setTab('applications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors border ${
            tab === 'applications'
              ? 'bg-red-950/40 border-[#e62b1e] text-white'
              : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          📋 Applications {applications.length > 0 ? `(${applications.length})` : ''}
        </button>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">{error}</div>
      )}

      {!loading && !error && tab === 'regears' && regears.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-4xl mb-3 opacity-40">♻️</p>
          <p className="text-gray-500 text-sm">No pending regear requests.</p>
        </Card>
      )}
      {!loading && !error && tab === 'applications' && applications.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-4xl mb-3 opacity-40">📋</p>
          <p className="text-gray-500 text-sm">No pending applications.</p>
        </Card>
      )}

      <div className="space-y-4">
        {tab === 'regears' && regears.map((r) => (
          <RegearCard key={r.id} req={r} guildId={guildId} onDone={removeRegear} />
        ))}
        {tab === 'applications' && applications.map((a) => (
          <ApplicationCard key={a.id} app={a} guildId={guildId} onDone={removeApplication} />
        ))}
      </div>
    </div>
  );
};

export default Inbox;
