// client/src/components/Community.jsx
//
// 🏅 Community panel — groups the guild's social/gamification features: the
// weekly leaderboard and the guild armory (lending tracker).

import { useState } from 'react';
import { useI18n } from '../i18n';
import Leaderboard from './Leaderboard';
import Loans from './Loans';

const Community = ({ guild }) => {
  const { t } = useI18n();
  const [tab, setTab] = useState('leaderboard');

  const tabs = [
    { key: 'leaderboard', label: t('community.tabLeaderboard') },
    { key: 'lend', label: t('community.tabLend') },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white font-black uppercase tracking-tighter text-2xl lg:text-3xl">{t('community.title')}</h1>
        <p className="text-gray-500 text-sm">{t('community.subtitle')}</p>
      </div>

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

      {tab === 'leaderboard' && <Leaderboard guildId={guild.id} />}
      {tab === 'lend' && <Loans guildId={guild.id} />}
    </div>
  );
};

export default Community;
