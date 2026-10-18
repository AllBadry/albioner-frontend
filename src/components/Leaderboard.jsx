// client/src/components/Leaderboard.jsx
//
// 🏆 Weekly leaderboards panel — the web view of the bot's /leaderboard command.
// Shows the week-to-date board, the recap history, and the auto-post settings.

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { number } from '../utils/format';
import { useI18n } from '../i18n';

const CATEGORIES = [
  { key: 'kills', titleKey: 'topKiller', stat: 'kills' },
  { key: 'deaths', titleKey: 'topFeeder', stat: 'deaths' },
  { key: 'cta', titleKey: 'mostCta', stat: 'minutes' },
  { key: 'fame', titleKey: 'mostFame', stat: 'fame' },
];

const BoardCard = ({ title, rows, statKey, t }) => (
  <div className="bg-[#030303] border border-white/5 rounded-xl p-4">
    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">{title}</p>
    {rows.length === 0 ? (
      <p className="text-gray-600 text-sm">{t('leaderboard.emptyCategory')}</p>
    ) : (
      <ol className="space-y-2">
        {rows.map((r, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span className="w-5 text-center">{[ '🥇', '🥈', '🥉' ][i] || `${i + 1}.`}</span>
            <span className="text-white flex-1 truncate">{r.name || r._id}</span>
            <span className="text-gray-400 tabular-nums">{number.format(r.value)}{statKey === 'minutes' ? 'm' : ''}</span>
          </li>
        ))}
      </ol>
    )}
  </div>
);

const Leaderboard = ({ guildId }) => {
  const { t } = useI18n();
  const [data, setData] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [config, setConfig] = useState({ enabled: false, channelId: '', mvpRoleId: '' });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const res = await apiFetch(`/guilds/${guildId}/leaderboard`);
      setData(res);
      setConfig({
        enabled: Boolean(res.config?.enabled),
        channelId: res.config?.channelId || '',
        mvpRoleId: res.config?.mvpRoleId || '',
      });
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
  useEffect(() => {
    apiFetch(`/guilds/${guildId}/channels`).then((d) => setChannels(d.channels || [])).catch(() => setChannels([]));
  }, [guildId]);

  const save = async (postNow = false) => {
    setBusy(true);
    setNotice('');
    try {
      const res = await apiFetch(`/guilds/${guildId}/leaderboard/config`, {
        method: 'POST',
        body: JSON.stringify({ ...config, postNow }),
      });
      setNotice(postNow ? (res.posted ? t('leaderboard.posted') : t('leaderboard.postEmpty')) : t('common.saved'));
      await load();
    } catch (err) {
      setNotice(err.message);
    } finally {
      setBusy(false);
    }
  };

  const card = 'bg-[#030303] border border-white/5 rounded-xl';
  const input = 'w-full bg-[#030303] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e62b1e] transition-colors';

  if (loading) return <p className="text-gray-500 text-sm">{t('common.loading')}</p>;
  if (error) return <p className="text-red-300 text-sm">{error}</p>;

  const board = data?.board || { kills: [], deaths: [], cta: [], fame: [] };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-black uppercase tracking-tight text-lg">{t('leaderboard.title')}</h2>
        <p className="text-gray-500 text-sm">{t('leaderboard.subtitle')}</p>
      </div>

      {notice && <p className="text-sm text-gray-300">{notice}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CATEGORIES.map((c) => (
          <BoardCard key={c.key} title={t(`leaderboard.${c.titleKey}`)} rows={board[c.key] || []} statKey={c.stat} t={t} />
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); save(false); }} className={`${card} p-5 space-y-3`}>
        <h3 className="text-white font-bold text-sm uppercase tracking-widest">{t('leaderboard.configTitle')}</h3>
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" checked={config.enabled} onChange={(e) => setConfig((c) => ({ ...c, enabled: e.target.checked }))} className="accent-[#e62b1e]" />
          {t('leaderboard.enabled')}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-1">{t('leaderboard.channel')}</label>
            <select value={config.channelId} onChange={(e) => setConfig((c) => ({ ...c, channelId: e.target.value }))} className={input}>
              <option value="">{t('common.none')}</option>
              {channels.map((ch) => <option key={ch.id} value={ch.id}>#{ch.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-1">{t('leaderboard.mvpRole')}</label>
            <input value={config.mvpRoleId} onChange={(e) => setConfig((c) => ({ ...c, mvpRoleId: e.target.value }))} className={input} placeholder={t('leaderboard.mvpRolePlaceholder')} />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={busy} className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-white bg-[#e62b1e] hover:brightness-110 transition disabled:opacity-40">{t('common.save')}</button>
          <button type="button" onClick={() => save(true)} disabled={busy} className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-200 border border-white/10 hover:bg-white/5 transition disabled:opacity-40">{t('leaderboard.postNow')}</button>
        </div>
      </form>

      {data?.history?.length > 0 && (
        <div className={`${card} p-5`}>
          <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-3">{t('leaderboard.historyTitle')}</h3>
          <ul className="space-y-2">
            {data.history.map((h) => (
              <li key={h._id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-gray-400 tabular-nums">{String(h.weekStart).slice(0, 10)}</span>
                <span className="text-gray-200 truncate">👑 {h.mvp?.name || t('leaderboard.noData')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
