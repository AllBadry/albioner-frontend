// client/src/components/Season.jsx
//
// 📈 Season points predictor panel — the web view of the bot's /season command.
// Because the game exposes no public season-points API, leadership logs readings
// here (or with /season log) and the panel projects the finish.

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { number } from '../utils/format';
import { useI18n } from '../i18n';

const Stat = ({ label, value, accent }) => (
  <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4">
    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-lg font-black tabular-nums ${accent || 'text-white'}`}>{value}</p>
  </div>
);

const Season = ({ guildId }) => {
  const { t } = useI18n();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [log, setLog] = useState({ points: '', rival: '', note: '' });
  const [config, setConfig] = useState({ seasonEnd: '', goal: '', name: '' });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const res = await apiFetch(`/guilds/${guildId}/military/season`);
      setData(res);
      setConfig({
        seasonEnd: res.config?.seasonEnd ? String(res.config.seasonEnd).slice(0, 10) : '',
        goal: res.config?.goal || '',
        name: res.config?.name || '',
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

  const submitLog = async (e) => {
    e.preventDefault();
    setBusy(true);
    setNotice('');
    try {
      await apiFetch(`/guilds/${guildId}/military/season`, {
        method: 'POST',
        body: JSON.stringify({ points: Number(log.points), rival: Number(log.rival) || 0, note: log.note }),
      });
      setLog({ points: '', rival: '', note: '' });
      await load();
    } catch (err) {
      setNotice(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitConfig = async (e) => {
    e.preventDefault();
    setBusy(true);
    setNotice('');
    try {
      await apiFetch(`/guilds/${guildId}/military/season/config`, {
        method: 'POST',
        body: JSON.stringify({ seasonEnd: config.seasonEnd, goal: config.goal === '' ? null : Number(config.goal), name: config.name }),
      });
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

  const s = data?.status;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-black uppercase tracking-tight text-lg">{t('season.title')}</h2>
        <p className="text-gray-500 text-sm">{t('season.subtitle')}</p>
      </div>

      {notice && <p className="text-sm text-gray-300">{notice}</p>}

      {data?.empty || !s ? (
        <div className={`${card} p-5`}>
          <p className="text-gray-400 text-sm">{t('season.noData')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label={t('season.points')} value={number.format(s.points)} accent="text-[#f1c40f]" />
            <Stat label={t('season.rate')} value={t('season.perDay', { value: number.format(s.rate) })} />
            <Stat label={t('season.projected')} value={number.format(s.projected)} />
            {s.daysRemaining != null && <Stat label={t('season.remaining')} value={t('season.days', { count: s.daysRemaining })} />}
          </div>

          {s.goal > 0 && (
            <div className={`${card} p-4`}>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{t('season.goal')}</p>
              <p className="text-white font-bold tabular-nums">{number.format(s.goal)}</p>
              <p className={`text-sm mt-1 ${s.onTrack ? 'text-green-400' : 'text-red-400'}`}>
                {s.onTrack
                  ? t('season.onTrack', { date: s.etaDate ? String(s.etaDate).slice(0, 10) : '—' })
                  : t('season.behind', { points: number.format(Math.abs(s.gapToGoal || 0)) })}
              </p>
            </div>
          )}

          {s.rivalPoints > 0 && (
            <div className={`${card} p-4`}>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{t('season.rival')}</p>
              <p className="text-sm text-gray-300">
                {t('season.lead', { current: number.format(s.currentLead), projected: number.format(s.projectedLead) })}
              </p>
            </div>
          )}

          {data.chartUrl && (
            <div className={`${card} p-4`}>
              <img src={data.chartUrl} alt={t('season.title')} className="w-full rounded-lg bg-white" />
            </div>
          )}
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <form onSubmit={submitLog} className={`${card} p-5 space-y-3`}>
          <h3 className="text-white font-bold text-sm uppercase tracking-widest">{t('season.logTitle')}</h3>
          <input type="number" min="0" required value={log.points} onChange={(e) => setLog((l) => ({ ...l, points: e.target.value }))} className={input} placeholder={t('season.points')} />
          <input type="number" min="0" value={log.rival} onChange={(e) => setLog((l) => ({ ...l, rival: e.target.value }))} className={input} placeholder={t('season.rival')} />
          <input value={log.note} onChange={(e) => setLog((l) => ({ ...l, note: e.target.value }))} className={input} placeholder={t('common.optional')} maxLength={150} />
          <button type="submit" disabled={busy} className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-white bg-[#e62b1e] hover:brightness-110 transition disabled:opacity-40">{busy ? t('common.saving') : t('season.log')}</button>
        </form>

        <form onSubmit={submitConfig} className={`${card} p-5 space-y-3`}>
          <h3 className="text-white font-bold text-sm uppercase tracking-widest">{t('season.configTitle')}</h3>
          <input type="date" value={config.seasonEnd} onChange={(e) => setConfig((c) => ({ ...c, seasonEnd: e.target.value }))} className={input} />
          <input type="number" min="0" value={config.goal} onChange={(e) => setConfig((c) => ({ ...c, goal: e.target.value }))} className={input} placeholder={t('season.goal')} />
          <input value={config.name} onChange={(e) => setConfig((c) => ({ ...c, name: e.target.value }))} className={input} placeholder={t('season.nameLabel')} maxLength={60} />
          <button type="submit" disabled={busy} className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-200 border border-white/10 hover:bg-white/5 transition disabled:opacity-40">{t('common.save')}</button>
        </form>
      </div>
    </div>
  );
};

export default Season;
