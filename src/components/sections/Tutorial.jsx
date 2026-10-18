import { useState } from 'react';
import { useI18n } from '../../i18n';

const Tutorial = () => {
  const { t, dir } = useI18n();
  const rtl = dir === 'rtl';
  const [group, setGroup] = useState('discord');
  const [activeTab, setActiveTab] = useState('setup');

  // ---- Navigation -----------------------------------------------------------
  const groups = [
    { id: 'discord', icon: '🤖', title: t('tutorial.groupDiscord'), desc: t('tutorial.groupDiscordDesc') },
    { id: 'web', icon: '🌐', title: t('tutorial.groupWeb'), desc: t('tutorial.groupWebDesc') },
  ];

  const discordTabs = [
    { id: 'setup', icon: '🚀', title: t('tutorial.tabs.setup') },
    { id: 'verification', icon: '🔒', title: t('tutorial.tabs.verification') },
    { id: 'requests', icon: '📮', title: t('tutorial.tabs.requests') },
    { id: 'commands', icon: '💻', title: t('tutorial.tabs.commands') },
    { id: 'auto', icon: '🤖', title: t('tutorial.tabs.auto') },
  ];

  // ---- Content --------------------------------------------------------------
  const channelRef = [
    { id: 'killfeed', icon: '📡', name: t('tutorial.setup.chKillfeedName'), desc: t('tutorial.setup.chKillfeedDesc'), cmds: t('tutorial.setup.chKillfeedCmds'), required: false },
    { id: 'economy', icon: '💰', name: t('tutorial.setup.chEconomyName'), desc: t('tutorial.setup.chEconomyDesc'), cmds: t('tutorial.setup.chEconomyCmds'), required: true },
    { id: 'military', icon: '⚔️', name: t('tutorial.setup.chMilitaryName'), desc: t('tutorial.setup.chMilitaryDesc'), cmds: t('tutorial.setup.chMilitaryCmds'), required: true },
    { id: 'admin', icon: '🛠️', name: t('tutorial.setup.chAdminName'), desc: t('tutorial.setup.chAdminDesc'), cmds: t('tutorial.setup.chAdminCmds'), required: true },
  ];

  const setupBlocks = [
    {
      title: t('tutorial.setup.b1title'),
      intro: t('tutorial.setup.b1intro'),
      commands: [
        { code: t('tutorial.setup.b1c1code'), text: t('tutorial.setup.b1c1text') },
        { code: t('tutorial.setup.b1c2code'), text: t('tutorial.setup.b1c2text') },
        { code: t('tutorial.setup.b1c3code'), text: t('tutorial.setup.b1c3text') },
        { code: t('tutorial.setup.b1c4code'), text: t('tutorial.setup.b1c4text') },
      ],
    },
    { title: t('tutorial.setup.b2title'), body: t('tutorial.setup.b2body') },
    { title: t('tutorial.setup.b3title'), body: t('tutorial.setup.b3body') },
  ];

  const requestItems = [
    { icon: '🔒', title: t('tutorial.requests.r1title'), cmd: t('tutorial.requests.r1cmd'), member: t('tutorial.requests.r1member'), arrival: t('tutorial.requests.r1arrival') },
    { icon: '📋', title: t('tutorial.requests.r2title'), cmd: t('tutorial.requests.r2cmd'), member: t('tutorial.requests.r2member'), arrival: t('tutorial.requests.r2arrival') },
    { icon: '🛡️', title: t('tutorial.requests.r3title'), cmd: t('tutorial.requests.r3cmd'), member: t('tutorial.requests.r3member'), arrival: t('tutorial.requests.r3arrival') },
    { icon: '🎯', title: t('tutorial.requests.r4title'), cmd: t('tutorial.requests.r4cmd'), member: t('tutorial.requests.r4member'), arrival: t('tutorial.requests.r4arrival') },
    { icon: '🎧', title: t('tutorial.requests.r5title'), cmd: t('tutorial.requests.r5cmd'), member: t('tutorial.requests.r5member'), arrival: t('tutorial.requests.r5arrival') },
    { icon: '📦', title: t('tutorial.requests.r6title'), cmd: t('tutorial.requests.r6cmd'), member: t('tutorial.requests.r6member'), arrival: t('tutorial.requests.r6arrival') },
  ];

  const verification = {
    member: [1, 2, 3, 4].map((n) => t(`tutorial.verification.member${n}`)),
    admin: [1, 2, 3, 4].map((n) => t(`tutorial.verification.admin${n}`)),
  };

  const commandGroups = [
    { title: t('tutorial.commands.adminTitle'), color: 'text-[#e62b1e]', items: [1, 2, 3, 4].map((n) => t(`tutorial.commands.admin${n}`)) },
    { title: t('tutorial.commands.militaryTitle'), color: 'text-blue-400', items: [1, 2, 3, 4, 5, 6].map((n) => t(`tutorial.commands.military${n}`)) },
    { title: t('tutorial.commands.economyTitle'), color: 'text-green-400', items: [1, 2, 3, 4, 5].map((n) => t(`tutorial.commands.economy${n}`)) },
    { title: t('tutorial.commands.generalTitle'), color: 'text-yellow-400', items: [1, 2, 3, 4, 5].map((n) => t(`tutorial.commands.general${n}`)) },
  ];

  const autoCards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({
    title: t(`tutorial.auto.c${n}title`),
    desc: t(`tutorial.auto.c${n}desc`),
  }));

  const webBlocks = [
    { title: t('tutorial.web.loginTitle'), body: t('tutorial.web.loginBody'), icon: '🔑' },
    { title: t('tutorial.web.setupTitle'), body: t('tutorial.web.setupBody'), icon: '⚙️' },
    { title: t('tutorial.web.killsTitle'), body: t('tutorial.web.killsBody'), icon: '📡' },
    { title: t('tutorial.web.militaryTitle'), body: t('tutorial.web.militaryBody'), icon: '⚔️' },
    { title: t('tutorial.web.economyTitle'), body: t('tutorial.web.economyBody'), icon: '💰' },
    { title: t('tutorial.web.membersTitle'), body: t('tutorial.web.membersBody'), icon: '👥' },
    { title: t('tutorial.web.communityTitle'), body: t('tutorial.web.communityBody'), icon: '🏅' },
    { title: t('tutorial.web.inboxTitle'), body: t('tutorial.web.inboxBody'), icon: '📥' },
  ];

  const card = 'bg-[#030303] rounded-xl border border-white/5';

  return (
    <section className="relative w-full min-h-screen bg-[#030303] text-gray-300 flex flex-col items-center px-4 lg:px-16 pt-32 pb-20 animate-fade-in overflow-hidden">

      <div className="absolute top-0 end-0 w-[60%] h-[400px] bg-[#e62b1e]/5 blur-[200px] rounded-full pointer-events-none"></div>

      {/* Header */}
      <div className="w-full max-w-7xl mb-10 text-center z-10 animate-slide-up">
        <h2 className="text-white font-black uppercase leading-[0.9] text-[40px] sm:text-[60px] flex items-center justify-center gap-4 drop-shadow-md">
          {t('tutorial.headingA')} <span className="text-[#e62b1e]">{t('tutorial.headingB')}</span>
        </h2>
        <p className="mt-4 text-gray-400 font-medium max-w-2xl mx-auto">
          {t('tutorial.intro')}
        </p>
      </div>

      {/* Where do you want to use it? */}
      <div className="w-full max-w-7xl z-10 mb-8">
        <p className="text-center text-gray-500 text-xs font-bold uppercase mb-4">{t('tutorial.groupTitle')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {groups.map((g) => {
            const active = group === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setGroup(g.id)}
                className={`text-start p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                  active
                    ? 'bg-red-950/40 border-[#e62b1e] shadow-[0_0_25px_rgba(230,43,30,0.2)]'
                    : 'bg-[#0a0a0a] border-white/10 hover:border-white/25'
                }`}
              >
                <span className="text-3xl leading-none">{g.icon}</span>
                <span className="flex-1">
                  <span className={`block font-black uppercase text-sm ${active ? 'text-white' : 'text-gray-300'}`}>{g.title}</span>
                  <span className="block text-xs text-gray-500 mt-1 leading-relaxed">{g.desc}</span>
                </span>
                <span className={`mt-1 w-3 h-3 rounded-full shrink-0 ${active ? 'bg-[#e62b1e]' : 'bg-white/10'}`}></span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Discord guide */}
      {group === 'discord' && (
        <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8 z-10">
          {/* Sub-tabs */}
          <div className="w-full lg:w-1/4 flex flex-col gap-2">
            {discordTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-start px-5 py-4 rounded-xl font-bold uppercase text-sm transition-all duration-300 border flex items-center gap-3 ${
                  activeTab === tab.id
                    ? `bg-red-950/40 border-[#e62b1e] text-white ${rtl ? '-translate-x-2' : 'translate-x-2'}`
                    : 'bg-[#0a0a0a] border-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300'
                }`}
              >
                <span className="text-lg leading-none">{tab.icon}</span>
                <span>{tab.title}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="w-full lg:w-3/4 bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-10 shadow-2xl relative overflow-hidden min-h-[600px]">

            {activeTab === 'setup' && (
              <div className="animate-fade-in space-y-6">
                <h3 className="text-3xl font-black text-white uppercase border-b border-white/10 pb-4">{t('tutorial.setup.title')}</h3>
                <p>{t('tutorial.setup.intro')}</p>

                <div>
                  <h4 className="text-white font-bold mb-1">{t('tutorial.setup.channelsTitle')}</h4>
                  <p className="text-sm text-gray-400 mb-3">{t('tutorial.setup.channelsIntro')}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {channelRef.map((c) => (
                      <div key={c.id} className={`${card} p-4 border-s-4 ${c.required ? 'border-s-[#e62b1e]' : 'border-s-blue-500'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span>{c.icon}</span>
                          <h5 className="text-white font-bold text-sm">{c.name}</h5>
                          <span className={`ms-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${c.required ? 'bg-[#e62b1e]/20 text-[#ff6b5e]' : 'bg-blue-500/20 text-blue-300'}`}>
                            {c.required ? t('tutorial.setup.required') : t('tutorial.setup.recommended')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{c.desc}</p>
                        <p className="text-[11px] text-gray-500 font-mono leading-relaxed">{c.cmds}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  {setupBlocks.map((block, i) => (
                    <div key={i} className={`${card} p-5`}>
                      <h4 className="text-[#e62b1e] font-bold mb-2">{block.title}</h4>
                      {block.intro && <p className="mb-3 text-sm">{block.intro}</p>}
                      {block.commands && (
                        <ul className="space-y-2 text-sm text-gray-400">
                          {block.commands.map((c, j) => (
                            <li key={j} className="flex flex-wrap items-center gap-2">
                              <code className="text-white bg-white/10 px-2 py-1 rounded font-mono text-xs">{c.code}</code>
                              <span>{c.text}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {block.body && <p className="text-sm text-gray-400">{block.body}</p>}
                    </div>
                  ))}
                </div>

                <div className="bg-[#030303] border border-white/5 border-s-4 border-s-yellow-500 p-5 rounded-xl">
                  <h4 className="text-yellow-400 font-bold mb-2">{t('tutorial.setup.whyTitle')}</h4>
                  <p className="text-sm text-gray-400">{t('tutorial.setup.whyBody')}</p>
                </div>
              </div>
            )}

            {activeTab === 'verification' && (
              <div className="animate-fade-in space-y-6">
                <h3 className="text-3xl font-black text-white uppercase border-b border-white/10 pb-4">{t('tutorial.verification.title')}</h3>
                <p>{t('tutorial.verification.intro')}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#030303] p-6 rounded-xl border border-white/5 border-s-4 border-s-blue-500">
                    <h4 className="text-blue-400 font-bold mb-4 uppercase text-sm">{t('tutorial.verification.memberTitle')}</h4>
                    <ol className="space-y-3 text-sm text-gray-400">
                      {verification.member.map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-[#030303] p-6 rounded-xl border border-white/5 border-s-4 border-s-[#e62b1e]">
                    <h4 className="text-[#e62b1e] font-bold mb-4 uppercase text-sm">{t('tutorial.verification.adminTitle')}</h4>
                    <ol className="space-y-3 text-sm text-gray-400">
                      {verification.admin.map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="shrink-0 w-6 h-6 rounded-full bg-[#e62b1e]/20 text-[#ff6b5e] text-xs font-bold flex items-center justify-center">{i + 1}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="animate-fade-in space-y-6">
                <h3 className="text-3xl font-black text-white uppercase border-b border-white/10 pb-4">{t('tutorial.requests.title')}</h3>
                <p>{t('tutorial.requests.intro')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requestItems.map((r, i) => (
                    <div key={i} className={`${card} p-5 space-y-3`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl leading-none">{r.icon}</span>
                        <h4 className="text-white font-bold text-sm">{r.title}</h4>
                      </div>
                      <code className="inline-block text-white bg-white/10 px-2 py-1 rounded font-mono text-xs">{r.cmd}</code>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-gray-500 mb-0.5">{t('tutorial.requests.memberLabel')}</p>
                        <p className="text-sm text-gray-400">{r.member}</p>
                      </div>
                      <div className="border-s-2 border-s-[#e62b1e] ps-3">
                        <p className="text-[10px] font-bold uppercase text-[#ff6b5e] mb-0.5">{t('tutorial.requests.arrivalLabel')}</p>
                        <p className="text-sm text-gray-300">{r.arrival}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'commands' && (
              <div className="animate-fade-in space-y-6">
                <h3 className="text-3xl font-black text-white uppercase border-b border-white/10 pb-4">{t('tutorial.commands.title')}</h3>
                <div className="space-y-4">
                  {commandGroups.map((grp, i) => (
                    <div key={i} className={`${card} p-5`}>
                      <h4 className={`${grp.color} font-bold mb-3 text-sm`}>{grp.title}</h4>
                      <ul className="space-y-2 text-sm text-gray-400">
                        {grp.items.map((item, j) => <li key={j}>{item}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'auto' && (
              <div className="animate-fade-in space-y-6">
                <h3 className="text-3xl font-black text-white uppercase border-b border-white/10 pb-4">{t('tutorial.auto.title')}</h3>
                <p>{t('tutorial.auto.intro')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {autoCards.map((c, i) => (
                    <div key={i} className={`${card} p-5`}>
                      <h4 className="text-white font-bold mb-2 text-sm">{c.title}</h4>
                      <p className="text-sm text-gray-400">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Web guide */}
      {group === 'web' && (
        <div className="w-full max-w-7xl z-10 animate-fade-in">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-10 shadow-2xl">
            <h3 className="text-3xl font-black text-white uppercase border-b border-white/10 pb-4">{t('tutorial.web.title')}</h3>
            <p className="mt-4 mb-8 text-gray-400">{t('tutorial.web.intro')}</p>

            <ol className="space-y-4">
              {webBlocks.map((block, i) => (
                <li key={i} className={`${card} p-5 flex gap-4`}>
                  <span className="shrink-0 w-9 h-9 rounded-full bg-[#e62b1e]/15 text-[#ff6b5e] font-black flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <h4 className="text-white font-bold mb-1 flex items-center gap-2">
                      <span>{block.icon}</span>
                      <span>{block.title}</span>
                    </h4>
                    <p className="text-sm text-gray-400 leading-relaxed">{block.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </section>
  );
};

export default Tutorial;
