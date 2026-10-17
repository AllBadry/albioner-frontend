import { useState } from 'react';

const Tutorial = () => {
  const [activeTab, setActiveTab] = useState('setup');

  const tabs = [
    { id: 'setup', title: '🚀 الإعداد الأولي' },
    { id: 'verification', title: '🔒 نظام التوثيق' },
    { id: 'commands', title: '💻 دليل الأوامر' },
    { id: 'auto', title: '🤖 الميزات التلقائية' },
  ];

  return (
    <section className="relative w-full min-h-screen bg-[#030303] text-gray-300 flex flex-col items-center px-4 lg:px-16 pt-32 pb-20 animate-fade-in overflow-hidden">
      
      <div className="absolute top-0 right-0 w-[60%] h-[400px] bg-[#e62b1e]/5 blur-[200px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-7xl mb-12 text-center lg:text-left z-10 animate-slide-up">
        <h2 className="text-white font-black uppercase leading-[0.9] tracking-tighter text-[40px] sm:text-[60px] flex items-center justify-center lg:justify-start gap-6 drop-shadow-md">
          BOT <span className="text-[#e62b1e]">GUIDE</span>
        </h2>
        <p className="mt-4 text-gray-400 font-medium max-w-2xl mx-auto lg:mx-0">
          دليلك الشامل لاستخدام بوت Albioner. جميع الأوامر تُكتب باللغة الإنجليزية، ولكن البوت يمكنه الرد بـ 10 لغات مختلفة[cite: 16].
        </p>
      </div>

      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8 z-10">
        
        {/* التبويبات الجانبية */}
        <div className="w-full lg:w-1/4 flex flex-col gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-left px-6 py-4 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 border ${
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
              <h3 className="text-3xl font-black text-white uppercase border-b border-white/10 pb-4">إعداد السيرفر لأول مرة</h3>
              <p>يجب على مسؤول السيرفر (Administrator) القيام بهذه الخطوات لمرة واحدة فقط[cite: 16].</p>
              
              <div className="space-y-6">
                <div className="bg-[#030303] p-5 rounded-lg border border-white/5">
                  <h4 className="text-[#e62b1e] font-bold mb-2">1. إعداد القنوات المخصصة</h4>
                  <p className="mb-3 text-sm">استخدم أمر `/set` لربط البوت بقنوات السيرفر[cite: 16]:</p>
                  <ul className="list-disc list-inside text-sm space-y-2 text-gray-400">
                    <li><code className="text-white bg-white/10 px-2 py-1 rounded">/set killfeed channel:#kill-feed</code> لقناة القتلى والإنذارات[cite: 16].</li>
                    <li><code className="text-white bg-white/10 px-2 py-1 rounded">/set economy channel:#economy</code> لقناة الاقتصاد والسوق[cite: 16].</li>
                    <li><code className="text-white bg-white/10 px-2 py-1 rounded">/set military channel:#military</code> لقناة المعارك والمؤقتات[cite: 16].</li>
                    <li><code className="text-white bg-white/10 px-2 py-1 rounded">/set admin channel:#leadership</code> لقناة الإدارة (تصلها طلبات التوثيق)[cite: 16].</li>
                  </ul>
                </div>

                <div className="bg-[#030303] p-5 rounded-lg border border-white/5">
                  <h4 className="text-[#e62b1e] font-bold mb-2">2. إنشاء لوحة التحكم</h4>
                  <p className="text-sm text-gray-400">
                    استخدم <code className="text-white bg-white/10 px-2 py-1 rounded">/setup-panel</code> لإنشاء لوحة تحكم دائمة[cite: 16]. منها يمكنك تحديد "الرابطة المتابعة" (Tracked Guild) لكي يعمل رادار القتلى بشكل صحيح[cite: 16].
                  </p>
                </div>

                <div className="bg-[#030303] p-5 rounded-lg border border-white/5">
                  <h4 className="text-[#e62b1e] font-bold mb-2">3. تغيير اللغة</h4>
                  <p className="text-sm text-gray-400">
                    استخدم <code className="text-white bg-white/10 px-2 py-1 rounded">/language</code> لتغيير لغة ردود البوت (يدعم 10 لغات منها العربية)[cite: 16].
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* محتوى التوثيق */}
          {activeTab === 'verification' && (
            <div className="animate-fade-in space-y-8">
              <h3 className="text-3xl font-black text-white uppercase border-b border-white/10 pb-4">نظام الحماية والتوثيق</h3>
              <p>يعمل التوثيق كبوابة حماية للسيرفر. الأعضاء غير الموثقين لا يمكنهم استخدام أي أمر سوى `/verify` و `/apply`[cite: 16].</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#030303] p-6 rounded-xl border border-white/5 border-l-4 border-l-blue-500">
                  <h4 className="text-blue-400 font-bold mb-4 uppercase tracking-widest">خطوات العضو</h4>
                  <ol className="list-decimal list-inside space-y-3 text-sm text-gray-400">
                    <li>يكتب العضو <code className="text-white">/verify ign:Name</code>[cite: 16].</li>
                    <li>يتحقق البوت من واجهة Albion الرسمية للتأكد من وجوده داخل الرابطة[cite: 16].</li>
                    <li>يطلب البوت من العضو الانتظار ريثما تتم مراجعة طلبه من الإدارة[cite: 16].</li>
                    <li>يستلم العضو رسالة خاصة (DM) عند قبوله مع الرتبة المخصصة[cite: 16].</li>
                  </ol>
                </div>

                <div className="bg-[#030303] p-6 rounded-xl border border-white/5 border-l-4 border-l-[#e62b1e]">
                  <h4 className="text-[#e62b1e] font-bold mb-4 uppercase tracking-widest">خطوات الإدارة</h4>
                  <ol className="list-decimal list-inside space-y-3 text-sm text-gray-400">
                    <li>يفتح البوت تذكرة خاصة في قناة الإدارة (Admin Channel)[cite: 16].</li>
                    <li>تظهر إحصائيات اللاعب (K/D, Fame) لمساعدتك في اتخاذ القرار[cite: 16].</li>
                    <li>يظهر تنبيه ⚠️ إذا كان الحساب مرتبطاً بديسكورد آخر[cite: 16].</li>
                    <li>يضغط الإداري على <span className="text-green-400">Approve</span> للقبول أو <span className="text-red-400">Reject</span> للرفض[cite: 16].</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* محتوى الأوامر */}
          {activeTab === 'commands' && (
            <div className="animate-fade-in space-y-6">
              <h3 className="text-3xl font-black text-white uppercase border-b border-white/10 pb-4">دليل الأوامر</h3>
              
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                
                {/* الإدارة */}
                <div className="bg-[#030303] p-5 rounded-lg border border-white/5">
                  <h4 className="text-[#e62b1e] font-bold mb-3 flex items-center gap-2">🛠️ أوامر الإدارة (Admin)</h4>
                  <ul className="space-y-3 text-sm">
                    <li><code className="text-white">/setup-panel</code>: لإنشاء لوحة التحكم[cite: 16].</li>
                    <li><code className="text-white">/inactivity-report</code>: لكشف الأعضاء المتغيبين عن المعارك الأخيرة[cite: 16].</li>
                    <li><code className="text-white">/scout guild_name</code>: لاستطلاع تحالف عدو ومعرفة أسلحتهم وقوتهم[cite: 16].</li>
                    <li><code className="text-white">/killfeed-status</code>: لتشخيص حالة رادار القتلى ومعرفة سبب توقفه[cite: 16].</li>
                  </ul>
                </div>

                {/* العسكرية */}
                <div className="bg-[#030303] p-5 rounded-lg border border-white/5">
                  <h4 className="text-blue-400 font-bold mb-3 flex items-center gap-2">⚔️ أوامر العسكرية (Military)</h4>
                  <ul className="space-y-3 text-sm">
                    <li><code className="text-white">/cta start</code> & <code className="text-white">/cta end</code>: لتتبع حضور الأعضاء في القنوات الصوتية[cite: 16].</li>
                    <li><code className="text-white">/battle-report</code>: تقرير استخباراتي كامل لمعركة ZvZ[cite: 16].</li>
                    <li><code className="text-white">/audit-cta</code>: كشف اللاعبين الـ AFK بمقارنة الحضور مع القتالات الفعلية[cite: 16].</li>
                    <li><code className="text-white">/timer add/list/remove</code>: إدارة لوحة المؤقتات الخاصة بالقلاع والأراضي[cite: 16].</li>
                  </ul>
                </div>

                {/* الاقتصاد */}
                <div className="bg-[#030303] p-5 rounded-lg border border-white/5">
                  <h4 className="text-green-400 font-bold mb-3 flex items-center gap-2">💰 أوامر الاقتصاد (Economy)</h4>
                  <ul className="space-y-3 text-sm">
                    <li><code className="text-white">/market-chart</code>: رسم بياني لتغير أسعار أداة معينة[cite: 16].</li>
                    <li><code className="text-white">/duckmarket</code>: حساب أرباح نقل البضائع بين المدن[cite: 16].</li>
                    <li><code className="text-white">/refining-calculator</code>: حاسبة أرباح صقل الموارد[cite: 16].</li>
                    <li><code className="text-white">/audit-chest</code>: تدقيق سجلات صندوق التحالف ومعرفة السحوبات[cite: 16].</li>
                  </ul>
                </div>

                {/* العامة */}
                <div className="bg-[#030303] p-5 rounded-lg border border-white/5">
                  <h4 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">🌐 أوامر عامة (General)</h4>
                  <ul className="space-y-3 text-sm">
                    <li><code className="text-white">/regear</code>: لطلب تعويض عن العتاد المفقود برابط الـ Killboard[cite: 16].</li>
                    <li><code className="text-white">/emergency</code>: لإرسال إنذار طوارئ لجميع الأعضاء @everyone[cite: 16].</li>
                    <li><code className="text-white">/build</code>: لإضافة وعرض بيلدات التحالف[cite: 16].</li>
                  </ul>
                </div>

              </div>
            </div>
          )}

          {/* الميزات التلقائية */}
          {activeTab === 'auto' && (
            <div className="animate-fade-in space-y-8">
              <h3 className="text-3xl font-black text-white uppercase border-b border-white/10 pb-4">الميزات التلقائية (تعمل بالخلفية)</h3>
              <p>بمجرد إعداد السيرفر، ستقوم هذه الميزات بالعمل تلقائياً دون الحاجة لأي أوامر[cite: 16]:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#030303] p-5 rounded-lg border border-white/5">
                  <h4 className="text-white font-bold mb-2">📡 رادار القتلى (Kill Feed)</h4>
                  <p className="text-sm text-gray-400">يفحص اللعبة كل 60 ثانية وينشر القتلى والوفيات الخاصة برابطتك مباشرة[cite: 16].</p>
                </div>
                
                <div className="bg-[#030303] p-5 rounded-lg border border-white/5">
                  <h4 className="text-white font-bold mb-2">🚨 إنذار التجمعات (Gank Warning)</h4>
                  <p className="text-sm text-gray-400">إذا مات عدة أعضاء في نفس المنطقة خلال دقائق، يرسل البوت إنذاراً للجميع[cite: 16].</p>
                </div>

                <div className="bg-[#030303] p-5 rounded-lg border border-white/5">
                  <h4 className="text-white font-bold mb-2">🩺 رسالة التعويض الذكية</h4>
                  <p className="text-sm text-gray-400">إذا مات عضو أثناء وقت معركة مسجل، يرسل له البوت رسالة خاصة تحتوي على زر التعويض الفوري[cite: 16].</p>
                </div>

                <div className="bg-[#030303] p-5 rounded-lg border border-white/5">
                  <h4 className="text-white font-bold mb-2">⚔️ تنبيهات المعارك</h4>
                  <p className="text-sm text-gray-400">يكتشف المعارك الكبيرة التي تشارك فيها رابطتك وينبه القناة[cite: 16].</p>
                </div>

                <div className="bg-[#030303] p-5 rounded-lg border border-white/5">
                  <h4 className="text-white font-bold mb-2">⏳ لوحة المؤقتات</h4>
                  <p className="text-sm text-gray-400">تُحدّث نفسها تلقائياً وترسل تنبيهاً قبل 15 دقيقة من أي حدث (قلعة، أرض)[cite: 16].</p>
                </div>

                <div className="bg-[#030303] p-5 rounded-lg border border-white/5">
                  <h4 className="text-white font-bold mb-2">🧹 الطرد التلقائي (Auto-kicker)</h4>
                  <p className="text-sm text-gray-400">يقوم البوت دورياً بسحب الرتبة من الأعضاء الذين غادروا الرابطة داخل اللعبة ويبلغهم بالرسائل الخاصة[cite: 16].</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};

export default Tutorial;