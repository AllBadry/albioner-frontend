import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../api';
import { useI18n } from '../i18n';

const REGION_KEY = {
  americas: 'danger.regionAmericas',
  europe: 'danger.regionEurope',
  asia: 'danger.regionAsia',
};

const DangerousLands = ({ guild }) => {
  const { t, silver, number, timeAgo } = useI18n();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('world');

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

  // The world ranking is rebuilt server-side every minute; re-fetch while the
  // tab is open so the board feels live.
  useEffect(() => {
    if (tab !== 'world' || !guild?.id) return;
    const id = setInterval(() => { load(); }, 60000);
    return () => clearInterval(id);
  }, [tab, guild?.id, load]);

  if (!guild) return null;

  const world = data?.world;
  const lands = world?.lands || [];
  const killZones = data?.killZones || [];
  const hotZones = data?.hotZones || [];
  const maxScore = lands[0]?.score || 1;

  const landLabel = (l) => (world?.kind === 'region' ? t(REGION_KEY[l.name] || l.name) : l.name);

  const tabBtn = (key, label) => (
    <button
      onClick={() => setTab(key)}
      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-colors ${
        tab === key
          ? 'text-white border-[#e62b1e]/60 bg-[#e62b1e]/10'
          : 'text-gray-400 border-white/10 hover:text-white hover:bg-white/5'
      }`}
    >
      {label}
    </button>
  );

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

        <div className="flex flex-wrap gap-2">
          {tabBtn('world', `🌍 ${t('danger.tabWorld')}`)}
          {tabBtn('guild', `🛡️ ${t('danger.tabGuild')}`)}
        </div>

        {error && (
          <div className="bg-red-950/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {tab === 'world' ? (
          <div className="space-y-4">
            <div>
              <h4 className="text-[#e62b1e] font-bold uppercase tracking-widest mb-1">{t('danger.worldTitle')}</h4>
              <p className="text-gray-500 text-xs leading-relaxed">
                {t('danger.worldDesc', { minutes: world?.windowMinutes ?? 15 })}
              </p>
              {world?.updatedAt && (
                <p className="text-gray-600 text-xs mt-1">
                  ⏱️ {t('danger.updatedAt')}: {timeAgo(world.updatedAt)}
                  {world.totalKills ? ` · ${number.format(world.totalKills)} ${t('danger.kills')}` : ''}
                </p>
              )}
            </div>

            {world?.kind === 'region' && (
              <div className="bg-[#030303] border border-amber-500/25 rounded-xl px-4 py-3 text-amber-300/90 text-xs leading-relaxed">
                {t('danger.worldRegionNote')}
              </div>
            )}

            {!world || lands.length === 0 ? (
              <p className="text-gray-600 text-sm">{t('danger.worldNoData')}</p>
            ) : (
              <ul className="space-y-3">
                {lands.map((l, i) => (
                  <li key={l.name} className="flex items-start gap-3 text-sm">
                    <span className="text-[#e62b1e] font-bold w-6 pt-0.5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="text-white truncate">{landLabel(l)}</p>
                        {world.kind === 'zone' && l.region && REGION_KEY[l.region] && (
                          <span className="text-gray-600 text-xs shrink-0">· {t(REGION_KEY[l.region])}</span>
                        )}
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#e62b1e] to-amber-500"
                          style={{ width: `${Math.max(6, (l.score / maxScore) * 100)}%` }}
                        />
                      </div>
                      <p className="text-gray-500 text-xs mt-1">
                        {t('danger.windowKills', { minutes: world.windowMinutes })}: {number.format(l.kills)}
                        {l.lastKillAt ? ` · ${t('danger.lastKill')}: ${timeAgo(l.lastKillAt)}` : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <>
            {!loading && data?.configured === false && (
              <p className="text-gray-500 text-sm">{t('danger.setGuildName')}</p>
            )}

            {data?.configured && (
              <>
                <p className="text-gray-500 text-xs">
                  {t('danger.tracked')}: <span className="text-white font-bold">{data.trackedName}</span>
                </p>

                {data.zoneDataAvailable === false ? (
                  <div className="bg-[#030303] border border-amber-500/25 rounded-xl p-5">
                    <h4 className="text-amber-400 font-bold uppercase tracking-widest mb-3">{t('danger.noZoneDataTitle')}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{t('danger.noZoneData')}</p>
                  </div>
                ) : (
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
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DangerousLands;
