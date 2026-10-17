import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../api';
import { number } from '../utils/format';
import { useI18n } from '../i18n';

const DangerousLands = ({ guild }) => {
  const { t, silver } = useI18n();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!guild?.id) return;
    setLoading(true);
    setError('');
    try {
      const d = await apiFetch(`/guilds/${guild.id}/military/dangerous-lands`);
      setData(d);
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [guild]);

  useEffect(() => {
    if (!guild?.id) return;
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      load();
    })();
    return () => { cancelled = true; };
  }, [load, guild?.id]);

  if (!guild) return null;

  const killZones = data?.killZones || [];
  const hotZones = data?.hotZones || [];

  return (
    <div className="space-y-6">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-white font-bold uppercase tracking-widest">{t('danger.title')}</h3>
          <span className="text-gray-500 text-xs">{t('danger.subtitle')}</span>
          <button
            onClick={load}
            disabled={loading}
            className="ms-auto px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-40"
          >
            {loading ? t('common.refreshing') : t('common.refresh')}
          </button>
        </div>

        {error && (
          <div className="bg-red-950/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {!loading && data?.configured === false && (
          <p className="text-gray-500 text-sm">{t('danger.setGuildName')}</p>
        )}

        {data?.configured && (
          <>
            <p className="text-gray-500 text-xs">
              {t('danger.tracked')}: <span className="text-white font-bold">{data.trackedName}</span>
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Kill zones: where our members die the most */}
              <div className="bg-[#030303] border border-white/5 rounded-xl p-5">
                <h4 className="text-[#e62b1e] font-bold uppercase tracking-widest mb-3">{t('danger.killZonesTitle')}</h4>
                <p className="text-gray-500 text-xs mb-4">{t('danger.killZonesDesc')}</p>
                {killZones.length === 0 && <p className="text-gray-600 text-sm">—</p>}
                <ul className="space-y-3">
                  {killZones.map((z, i) => (
                    <li key={z.cluster} className="flex items-center gap-3 text-sm">
                      <span className="text-[#e62b1e] font-bold w-5">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white truncate">{z.cluster}</p>
                        <p className="text-gray-500 text-xs">
                          {t('danger.deaths')}: {number.format(z.ourDeaths)} · {t('danger.lost')}: {silver(z.ourLostValue)} · {t('danger.battles')}: {z.battleCount}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hot zones: highest total kill count */}
              <div className="bg-[#030303] border border-white/5 rounded-xl p-5">
                <h4 className="text-blue-400 font-bold uppercase tracking-widest mb-3">{t('danger.hotZonesTitle')}</h4>
                <p className="text-gray-500 text-xs mb-4">{t('danger.hotZonesDesc')}</p>
                {hotZones.length === 0 && <p className="text-gray-600 text-sm">—</p>}
                <ul className="space-y-3">
                  {hotZones.map((z, i) => (
                    <li key={z.cluster} className="flex items-center gap-3 text-sm">
                      <span className="text-blue-400 font-bold w-5">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white truncate">{z.cluster}</p>
                        <p className="text-gray-500 text-xs">
                          {t('danger.kills')}: {number.format(z.totalKills)} · {t('danger.fame')}: {number.format(z.totalFame)} · {t('danger.battles')}: {z.battleCount}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
        </div>
      </div>
  );
};

export default DangerousLands;
