// client/src/components/BlackMarket.jsx
//
// 🛒 Black Market scanner panel — the web view of the bot's /bm command. Add
// items to watch and see live Black Market vs. royal-city market margins.

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { number } from '../utils/format';
import { useI18n } from '../i18n';

const BlackMarket = ({ guildId }) => {
  const { t, timeAgo } = useI18n();
  const [watches, setWatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [item, setItem] = useState('');
  const [threshold, setThreshold] = useState('40');
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await apiFetch(`/guilds/${guildId}/economy/bm`);
      setWatches(data.watches || []);
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

  const search = async (q) => {
    setItem(q);
    if (q.trim().length < 2) { setResults([]); return; }
    try {
      const data = await apiFetch(`/guilds/${guildId}/economy/items?q=${encodeURIComponent(q)}`);
      setResults((data.items || []).slice(0, 8));
    } catch { setResults([]); }
  };

  const add = async (e) => {
    e.preventDefault();
    if (!item.trim()) return;
    setBusy(true);
    setNotice('');
    try {
      await apiFetch(`/guilds/${guildId}/economy/bm`, {
        method: 'POST',
        body: JSON.stringify({ item: item.trim(), threshold: Number(threshold) || 40 }),
      });
      setItem('');
      setResults([]);
      await load();
    } catch (err) {
      setNotice(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    try {
      await apiFetch(`/guilds/${guildId}/economy/bm/${id}`, { method: 'DELETE' });
      setWatches((w) => w.filter((x) => x.id !== id));
    } catch (err) {
      setNotice(err.message);
    }
  };

  const scan = async () => {
    setBusy(true);
    setNotice('');
    try {
      const res = await apiFetch(`/guilds/${guildId}/economy/bm/scan`, { method: 'POST' });
      setWatches(res.watches || []);
      setNotice(t('bm.scanDone', { checked: res.checked || 0, alerts: res.alerts || 0 }));
    } catch (err) {
      setNotice(err.message);
    } finally {
      setBusy(false);
    }
  };

  const card = 'bg-[#030303] border border-white/5 rounded-xl';
  const input = 'w-full bg-[#030303] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e62b1e] transition-colors';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-white font-black uppercase tracking-tight text-lg">{t('bm.title')}</h2>
          <p className="text-gray-500 text-sm">{t('bm.subtitle')}</p>
        </div>
        <button onClick={scan} disabled={busy || watches.length === 0} className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-200 border border-white/10 hover:bg-white/5 transition disabled:opacity-40">
          {busy ? t('common.loading') : t('bm.scanNow')}
        </button>
      </div>

      {notice && <p className="text-sm text-gray-300">{notice}</p>}

      <form onSubmit={add} className={`${card} p-5 flex flex-wrap items-end gap-3`}>
        <div className="flex-1 min-w-[220px] relative">
          <label className="block text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-1">{t('bm.item')}</label>
          <input value={item} onChange={(e) => search(e.target.value)} className={input} placeholder={t('bm.itemPlaceholder')} />
          {results.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
              {results.map((r) => (
                <li key={r.id}>
                  <button type="button" onClick={() => { setItem(r.name); setResults([]); }} className="w-full text-start px-3 py-2 text-sm text-gray-300 hover:bg-white/5">
                    {r.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="w-32">
          <label className="block text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-1">{t('bm.threshold')}</label>
          <input type="number" min="1" max="500" value={threshold} onChange={(e) => setThreshold(e.target.value)} className={input} />
        </div>
        <button type="submit" disabled={busy || !item.trim()} className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-white bg-[#e62b1e] hover:brightness-110 transition disabled:opacity-40">
          {t('bm.add')}
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500 text-sm">{t('common.loading')}</p>
      ) : error ? (
        <p className="text-red-300 text-sm">{error}</p>
      ) : watches.length === 0 ? (
        <div className="border border-dashed border-white/10 rounded-2xl py-16 text-center">
          <div className="text-4xl mb-3 opacity-40">🛒</div>
          <p className="text-gray-500 text-sm">{t('bm.empty')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {watches.map((w) => (
            <div key={w.id} className={`${card} p-4 flex flex-wrap items-center gap-4`}>
              <div className="flex-1 min-w-[160px]">
                <p className="text-white font-bold text-sm">{w.itemName}</p>
                <p className="text-gray-600 text-[11px] font-mono">{w.itemId}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-[10px] uppercase tracking-widest">{t('bm.bmPrice')}</p>
                <p className="text-[#f1c40f] font-bold tabular-nums text-sm">{number.format(w.bmPrice)}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-[10px] uppercase tracking-widest">{t('bm.marketPrice')}</p>
                <p className="text-gray-200 font-bold tabular-nums text-sm">{number.format(w.marketPrice)}{w.city ? ` (${w.city})` : ''}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-[10px] uppercase tracking-widest">{t('bm.margin')}</p>
                <p className={`font-bold tabular-nums text-sm ${w.overThreshold ? 'text-green-400' : 'text-gray-300'}`}>
                  {w.gainPct == null ? '—' : `${w.gainPct >= 0 ? '+' : ''}${w.gainPct}%`}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-[10px] uppercase tracking-widest">{t('bm.threshold')}</p>
                <p className="text-gray-300 tabular-nums text-sm">{w.threshold}%</p>
              </div>
              <div className="text-end">
                <p className="text-gray-600 text-[11px]">{w.lastAlertAt ? t('bm.alerted', { time: timeAgo(w.lastAlertAt) }) : t('bm.neverAlerted')}</p>
              </div>
              <button onClick={() => remove(w.id)} className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest text-red-300 border border-red-500/30 hover:bg-red-950/30 transition-colors">
                {t('common.remove')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlackMarket;
