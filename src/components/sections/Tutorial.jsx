import { useState } from 'react';
import { useI18n } from '../../i18n';

const Tutorial = () => {
  const [activeTab, setActiveTab] = useState('setup');
  const { t } = useI18n();

  const tabs = [
    { id: 'setup', title: t('tutorial.tabs.setup') },
    { id: 'verification', title: t('tutorial.tabs.verification') },
    { id: 'commands', title: t('tutorial.tabs.commands') },
    { id: 'auto', title: t('tutorial.tabs.auto') },
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

  const verification = {
    member: [1, 2, 3, 4].map((n) => t(`tutorial.verification.member${n}`)),
    admin: [1, 2, 3, 4].map((n) => t(`tutorial.verification.admin${n}`)),
  };

  const commandGroups = [
    { title: t('tutorial.commands.adminTitle'), color: 'text-[#e62b1e]', items: [1, 2, 3, 4].map((n) => t(`tutorial.commands.admin${n}`)) },
    { title: t('tutorial.commands.militaryTitle'), color: 'text-blue-400', items: [1, 2, 3, 4].map((n) => t(`tutorial.commands.military${n}`)) },
    { title: t('tutorial.commands.economyTitle'), color: 'text-green-400', items: [1, 2, 3, 4].map((n) => t(`tutorial.commands.economy${n}`)) },
    { title: t('tutorial.commands.generalTitle'), color: 'text-yellow-400', items: [1, 2, 3].map((n) => t(`tutorial.commands.general${n}`)) },
  ];

  const autoCards = [1, 2, 3, 4, 5, 6].map((n) => ({
    title: t(`tutorial.auto.c${n}title`),
    desc: t(`tutorial.auto.c${n}desc`),
  }));

  return (
    <section className="relative w-full min-h-screen bg-[#030303] text-gray-300 flex flex-col items-center px-4 lg:px-16 pt-32 pb-20 animate-fade-in overflow-hidden">

      <div className="absolute top-0 right-0 w-[60%] h-[400px] bg-[#e62b1e]/5 blur-[200px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-7xl mb-12 text-center lg:text-start z-10 animate-slide-up">
        <h2 className="text-white font-black uppercase leading-[0.9] tracking-tighter text-[40px] sm:text-[60px] flex items-center justify-center lg:justify-start gap-6 drop-shadow-md">
          {t('tutorial.headingA')} <span className="text-[#e62b1e]">{t('tutorial.headingB')}</span>
        </h2>
        <p className="mt-4 text-gray-400 font-medium max-w-2xl mx-auto lg:mx-0">
          {t('tutorial.intro')}
        </p>
      </div>

      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8 z-10">

        {/* التبويبات الجانبية */}
        <div className="w-full lg:w-1/4 flex flex-col gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-start px-6 py-4 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 border ${
                activeTab === tab.id
                  ? 'bg-red-950/40 border-[#e62b1e] text-white translate-x-2'
                  : 'bg-[#0a0a0a] border-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300'
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>

        {/* محتوى التبويبات */}
        <div className="w-full lg:w-3/4 bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-10 shadow-2xl relative overflow-hidden min-h-[600px]">

          {/* محتوى الإعداد الأولي */}
          {activeTab === 'setup' && (
            <div className="animate-fade-in space-y-8">
              <h3 className="text-3xl font-black text-white uppercase border-b border-white/10 pb-4">{t('tutorial.setup.title')}</h3>
              <p>{t('tutorial.setup.intro')}</p>

              <div className="space-y-6">
                {setupBlocks.map((block, i) => (
                  <div key={i} className="bg-[#030303] p-5 rounded-lg border border-white/5">
                    <h4 className="text-[#e62b1e] font-bold mb-2">{block.title}</h4>
                    {block.intro && <p className="mb-3 text-sm">{block.intro}</p>}
                    {block.commands && (
                      <ul className="list-disc list-inside text-sm space-y-2 text-gray-400">
                        {block.commands.map((c, j) => (
                          <li key={j}>
                            <code className="text-white bg-white/10 px-2 py-1 rounded">{c.code}</code> {c.text}
                          </li>
                        ))}
                      </ul>
                    )}
                    {block.body && <p className="text-sm text-gray-400">{block.body}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* محتوى التوثيق */}
          {activeTab === 'verification' && (
            <div className="animate-fade-in space-y-8">
              <h3 className="text-3xl font-black text-white uppercase border-b border-white/10 pb-4">{t('tutorial.verification.title')}</h3>
              <p>{t('tutorial.verification.intro')}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#030303] p-6 rounded-xl border border-white/5 border-s-4 border-s-blue-500">
                  <h4 className="text-blue-400 font-bold mb-4 uppercase tracking-widest">{t('tutorial.verification.memberTitle')}</h4>
                  <ol className="list-decimal list-inside space-y-3 text-sm text-gray-400">
                    {verification.member.map((step, i) => <li key={i}>{step}</li>)}
                  </ol>
                </div>

                <div className="bg-[#030303] p-6 rounded-xl border border-white/5 border-s-4 border-s-[#e62b1e]">
                  <h4 className="text-[#e62b1e] font-bold mb-4 uppercase tracking-widest">{t('tutorial.verification.adminTitle')}</h4>
                  <ol className="list-decimal list-inside space-y-3 text-sm text-gray-400">
                    {verification.admin.map((step, i) => <li key={i}>{step}</li>)}
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* محتوى الأوامر */}
          {activeTab === 'commands' && (
            <div className="animate-fade-in space-y-6">
              <h3 className="text-3xl font-black text-white uppercase border-b border-white/10 pb-4">{t('tutorial.commands.title')}</h3>

              <div className="space-y-4 max-h-[450px] overflow-y-auto pe-2 custom-scrollbar">
                {commandGroups.map((group, i) => (
                  <div key={i} className="bg-[#030303] p-5 rounded-lg border border-white/5">
                    <h4 className={`${group.color} font-bold mb-3 flex items-center gap-2`}>{group.title}</h4>
                    <ul className="space-y-3 text-sm">
                      {group.items.map((item, j) => <li key={j}>{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* الميزات التلقائية */}
          {activeTab === 'auto' && (
            <div className="animate-fade-in space-y-8">
              <h3 className="text-3xl font-black text-white uppercase border-b border-white/10 pb-4">{t('tutorial.auto.title')}</h3>
              <p>{t('tutorial.auto.intro')}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {autoCards.map((card, i) => (
                  <div key={i} className="bg-[#030303] p-5 rounded-lg border border-white/5">
                    <h4 className="text-white font-bold mb-2">{card.title}</h4>
                    <p className="text-sm text-gray-400">{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};

export default Tutorial;
