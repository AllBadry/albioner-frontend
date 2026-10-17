// client/src/components/KillWatcher.jsx
//
// ⚔️ Web Kill Watcher — shows recent kills/deaths for the server's tracked Albion
// guild. Needs no Discord channel; it activates as soon as the guild name is set.

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../api';
import { number } from '../utils/format';
import { useI18n } from '../i18n';
import KillDetail from './KillDetail';

const KillRow = ({ kill, onOpen }) => {
  const { t, silver, timeAgo } = useI18n();
  const accent = kill.victory ? 'border-s-green-500' : 'border-s-red-500';
  return (
    <div className={`bg-[#0a0a0a] border border-white/10 ${accent} border-s-4 rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
          kill.victory ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
        }`}>
          {kill.victory ? t('kills.victory') : t('kills.loss')}
        </span>
        <span className="text-gray-600 text-xs">{kill.region}</span>
        <span className="text-gray-600 text-xs ms-auto">{timeAgo(kill.timeStamp)}</span>
      </div>

      <div className="flex items-center gap-3">
        {kill.killer.weapon && (
          <img
            src={`https://render.albiononline.com/v1/item/${kill.killer.weapon}.png`}
            alt=""
            className="w-10 h-10 rounded-lg border border-white/10 bg-black/40 flex-shrink-0"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-white text-sm truncate">
            <span className="font-bold">{kill.killer.name}</span>
            <span className="text-gray-500"> {kill.killer.guild ? `[${kill.killer.guild}]` : ''}</span>
            <span className="text-[#e62b1e] mx-2">›</span>
            <span className="font-bold">{kill.victim.name}</span>
            <span className="text-gray-500"> {kill.victim.guild ? `[${kill.victim.guild}]` : ''}</span>
          </p>
          <p className="text-gray-500 text-xs mt-1">
            {t('kills.rowMeta', {
              ki: kill.killer.ip,
              vi: kill.victim.ip,
              players: kill.participants,
              fame: number.format(kill.fame),
            })}
            {kill.victim.gearValue > 0 && (
              <span className="text-amber-400/80"> · {t('kills.lost', { silver: silver(kill.victim.gearValue) })}</span>
            )}
          </p>
        </div>
        <button
          onClick={() => onOpen(kill)}
          className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest flex-shrink-0"
        >
          {t('kills.open')}
        </button>
      </div>
    </div>
  );
};

const KillWatcher = ({ guild }) => {
  const { t, timeAgo } = useI18n();
  const configured = Boolean(guild?.settings?.allianceName && guild.settings.allianceName !== 'None');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    try {
      setError('');
      const res = await apiFetch(`/guilds/${guild.id}/kills`);
      setData(res);
      setUpdatedAt(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [guild.id]);

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);
      load();
    })();
    const timer = setInterval(() => {
      if (!cancelled) load();
    }, 10000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [configured, load]);

  if (!configured) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-28 border border-dashed border-white/10 rounded-2xl">
        <div className="text-5xl mb-4 opacity-40">⚔️</div>
        <h2 className="text-white font-black uppercase tracking-widest mb-2">{t('kills.notConfiguredTitle')}</h2>
        <p className="text-gray-500 text-sm max-w-md">{t('kills.notConfiguredBody')}</p>
      </div>
    );
  }

  const kills = data?.kills || [];
  const victories = kills.filter((k) => k.victory).length;
  const losses = kills.length - victories;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-black uppercase tracking-tighter text-2xl lg:text-3xl">{t('kills.notConfiguredTitle')}</h1>
          <p className="text-gray-500 text-sm">
            {t('kills.tracking')} <span className="text-[#e62b1e] font-bold">{data?.guildName || guild.settings.allianceName}</span>
            {updatedAt && <span className="text-gray-600"> · {t('kills.updated', { time: timeAgo(updatedAt) })}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-green-400 text-sm font-bold">{victories}W</span>
          <span className="text-red-400 text-sm font-bold">{losses}L</span>
          <button
            onClick={load}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-colors"
          >
            {t('common.refresh')}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">{error}</div>
      )}

      {data?.unresolved && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-300 text-sm">
          <span className="font-bold">{t('kills.notGuildTitle', { name: data.guildName })}</span>{' '}
          {t('kills.notGuildBody')}
        </div>
      )}

      {loading && !data && <p className="text-gray-500 text-sm">{t('kills.loadingKills')}</p>}

      {!loading && kills.length === 0 && !data?.unresolved && (
        <div className="flex flex-col items-center justify-center text-center py-24 border border-dashed border-white/10 rounded-xl">
          <div className="text-5xl mb-4 opacity-40">🕓</div>
          <h3 className="text-white font-bold uppercase tracking-widest mb-2">{t('kills.noActivityTitle')}</h3>
          <p className="text-gray-500 text-sm max-w-md">{t('kills.noActivityBody')}</p>
        </div>
      )}

      {!loading && kills.length === 0 && data?.unresolved && (
        <div className="flex flex-col items-center justify-center text-center py-24 border border-dashed border-white/10 rounded-xl">
          <div className="text-5xl mb-4 opacity-40">🧭</div>
          <h3 className="text-white font-bold uppercase tracking-widest mb-2">{t('kills.waitingTitle')}</h3>
          <p className="text-gray-500 text-sm max-w-md">{t('kills.waitingBody')}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {kills.map((kill) => (
          <KillRow key={kill.eventId} kill={kill} onOpen={setSelected} />
        ))}
      </div>

      {selected && <KillDetail kill={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default KillWatcher;
