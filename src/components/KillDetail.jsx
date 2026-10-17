// client/src/components/KillDetail.jsx
//
// 🔍 The kill popup. Shows the same details the Albion killboard shows — both
// fighters, their item power, the loot value and every piece of gear as an icon
// — so the site rarely has to send the user to the official killboard.
// The "Albion killboard" link stays there as the fallback.

import { useEffect } from 'react';
import { number, fullTime, itemImage } from '../utils/format';
import { useI18n } from '../i18n';

// One equipped item icon (+ a xN badge when stacked).
const ItemCell = ({ item }) => (
  <div className="relative w-12 h-12 rounded-lg border border-white/10 bg-black/40 flex items-center justify-center">
    <img
      src={itemImage(item.type)}
      alt={item.type}
      title={item.type}
      className="w-10 h-10 object-contain"
      onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
    />
    {item.count > 1 && (
      <span className="absolute -bottom-1 -end-1 text-[10px] font-bold bg-[#e62b1e] text-white rounded-full px-1.5 leading-4">
        {item.count}
      </span>
    )}
  </div>
);

const ItemGrid = ({ label, items, empty }) => (
  <div>
    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{label}</h4>
    {items && items.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => <ItemCell key={`${item.type}-${i}`} item={item} />)}
      </div>
    ) : (
      <p className="text-gray-600 text-xs">{empty}</p>
    )}
  </div>
);

const Fighter = ({ side, role, victory }) => {
  const { t } = useI18n();
  const tag = side.guild || side.alliance || t('common.noGuild');
  const color = role === 'killer'
    ? (victory ? 'text-green-400' : 'text-gray-400')
    : (victory ? 'text-gray-400' : 'text-red-400');
  return (
    <div className="flex-1 min-w-0">
      <span className={`text-[10px] font-bold uppercase tracking-widest ${color}`}>
        {role === 'killer' ? t('killDetail.killer') : t('killDetail.victim')}
      </span>
      <p className="text-white font-bold truncate mt-1">{side.name || t('common.unknown')}</p>
      <p className="text-gray-500 text-xs truncate">{tag}</p>
      <p className="text-gray-600 text-xs mt-1">IP {side.ip || 0}</p>
    </div>
  );
};

const KillDetail = ({ kill, onClose }) => {
  const { t, silver, timeAgo } = useI18n();
  // Escape closes the popup, and the page behind it is frozen while it is open.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const victory = kill.victory;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl my-8 bg-[#0a0a0a] border border-white/10 rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 end-4 text-gray-500 hover:text-white text-xl leading-none"
          aria-label={t('common.close')}
        >
          ×
        </button>

        <div className="flex items-center gap-2 mb-5">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
            victory ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
          }`}>
            {victory ? t('kills.victory') : t('kills.loss')}
          </span>
          <span className="text-gray-600 text-xs">{kill.region}</span>
          <span className="text-gray-600 text-xs ms-auto pe-6" title={fullTime(kill.timeStamp)}>
            {timeAgo(kill.timeStamp)}
          </span>
        </div>

        <div className="flex items-start gap-4 bg-black/30 border border-white/5 rounded-xl p-4 mb-5">
          <Fighter side={kill.killer} role="killer" victory={victory} />
          <span className="text-[#e62b1e] text-lg font-black self-center">›</span>
          <Fighter side={kill.victim} role="victim" victory={victory} />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-black/30 border border-white/5 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('killDetail.fame')}</p>
            <p className="text-white font-bold">{number.format(kill.fame || 0)}</p>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('killDetail.participants')}</p>
            <p className="text-white font-bold">{kill.participants || 1}</p>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('killDetail.loot')}</p>
            <p className="text-white font-bold">{silver(kill.victim?.gearValue)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          <ItemGrid
            label={kill.victim?.name ? t('killDetail.fellFrom', { name: kill.victim.name }) : t('killDetail.fellFromFallback')}
            items={kill.victim?.equipment}
            empty={t('killDetail.noItems')}
          />
          <ItemGrid
            label={kill.killer?.name ? t('killDetail.loadout', { name: kill.killer.name }) : t('killDetail.loadoutFallback')}
            items={kill.killer?.equipment}
            empty={t('killDetail.noItems')}
          />
        </div>

        <a
          href={kill.killboard}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center w-full px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-colors"
        >
          {t('killDetail.openOnKillboard')}
        </a>
      </div>
    </div>
  );
};

export default KillDetail;
