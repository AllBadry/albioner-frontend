
import { useI18n } from '../../i18n';

const Features = () => {
  const { t } = useI18n();

  return (
    <section className="relative w-full min-h-screen bg-[#030303] flex flex-col items-center px-6 lg:px-16 pt-32 pb-20 animate-fade-in overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-[#e62b1e]/10 blur-[150px] rounded-full pointer-events-none"></div>

      {/* Header */}
      <div className="w-full max-w-7xl mb-12 animate-slide-up flex flex-col items-start">
        <h2 className="text-white font-black uppercase leading-[0.9] tracking-tighter text-[50px] sm:text-[70px] flex items-center gap-6">
          {t('features.heading')}
          {/* خط التصميم بجانب الكلمة كما في الصورة المرجعية */}
          <span className="h-2 w-32 md:w-96 bg-[#333] rounded-full block mt-2"></span>
        </h2>
      </div>

      {/* 
        Grid Layout (Asymmetrical Poster Design)
        شبكة مقسمة لـ 3 أعمدة في الشاشات الكبيرة
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full max-w-7xl h-auto xl:h-[700px] animate-slide-up" style={{ animationDelay: '0.2s' }}>
        
        {/* Poster 1: Economy (طولي - اليسار) */}
        <div className="relative group rounded-2xl overflow-hidden border border-white/10 hover:border-[#e62b1e]/50 transition-colors duration-500 h-[400px] xl:h-full">
          <img 
            src="/11_result.webp" 
            alt="Economy Insights" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8">
            <p className="text-[#e62b1e] text-xs font-bold tracking-widest uppercase mb-2">{t('features.c1kicker')}</p>
            <h3 className="text-white text-4xl font-black uppercase tracking-tighter mb-3">{t('features.c1title')}</h3>
            <p className="text-gray-300 text-sm font-medium leading-relaxed max-w-xs">
              {t('features.c1desc')}
            </p>
          </div>
        </div>

        {/* Poster 2: ZvZ Battles (طولي - المنتصف) */}
        <div className="relative group rounded-2xl overflow-hidden border border-white/10 hover:border-[#e62b1e]/50 transition-colors duration-500 h-[400px] xl:h-full">
          <img 
            src="/22_result.webp" 
            alt="ZvZ Alerts" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8">
            <p className="text-[#e62b1e] text-xs font-bold tracking-widest uppercase mb-2">{t('features.c2kicker')}</p>
            <h3 className="text-white text-4xl font-black uppercase tracking-tighter mb-3">{t('features.c2title')}</h3>
            <p className="text-gray-300 text-sm font-medium leading-relaxed max-w-xs">
              {t('features.c2desc')}
            </p>
          </div>
        </div>

        {/* Column 3: Stacked Posters (اليمين - مقسم لكرتين فوق بعض) */}
        <div className="flex flex-col gap-6 h-[800px] xl:h-full">
          
          {/* Poster 3: Scouting (مربع علوي) */}
          <div className="relative group rounded-2xl overflow-hidden border border-white/10 hover:border-[#e62b1e]/50 transition-colors duration-500 flex-1">
            <img 
              src="/33_result.webp" 
              alt="Scouting Intel" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6">
              <p className="text-[#e62b1e] text-xs font-bold tracking-widest uppercase mb-2">{t('features.c3kicker')}</p>
              <h3 className="text-white text-2xl font-black uppercase tracking-tighter mb-2">{t('features.c3title')}</h3>
              <p className="text-gray-300 text-sm font-medium leading-relaxed">
                {t('features.c3desc')}
              </p>
            </div>
          </div>

          {/* Poster 4: Regear (مربع سفلي) */}
          <div className="relative group rounded-2xl overflow-hidden border border-white/10 hover:border-[#e62b1e]/50 transition-colors duration-500 flex-1">
            <img 
              src="/44_result.webp" 
              alt="Regear Management" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6">
              <p className="text-[#e62b1e] text-xs font-bold tracking-widest uppercase mb-2">{t('features.c4kicker')}</p>
              <h3 className="text-white text-2xl font-black uppercase tracking-tighter mb-2">{t('features.c4title')}</h3>
              <p className="text-gray-300 text-sm font-medium leading-relaxed">
                {t('features.c4desc')}
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Features;