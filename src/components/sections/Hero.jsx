// قم بتعديل مسار الصورة حسب مكانها في مشروعك

import { useI18n } from '../../i18n';
import { BOT_INVITE_URL } from '../../config';

// رابط حساب الديسكورد الخاص بالمطوّر (يُستخدم في زر "Programmer" بالأسفل).
const DISCORD_PROFILE = 'https://discord.com/users/1342957056403181701';

const Hero = () => {
  const { t, dir } = useI18n();
  const rtl = dir === 'rtl';

  return (
    // الحاوية الرئيسية: شاشة كاملة، خلفية سوداء داكنة جداً
    <section className="relative w-full min-h-screen bg-[#030303] overflow-hidden flex flex-col lg:flex-row items-center px-6 lg:px-16 pt-24 lg:pt-0">
      

      {/* القسم الأيسر: النصوص الضخمة */}
      <div className="relative z-10 flex flex-col justify-center h-full w-full lg:w-3/5 mt-10 lg:mt-0">
        
        {/* النص الأحمر الضخم */}
        <h1 className={`flex flex-col text-[#e62b1e] font-black uppercase leading-[0.85] text-[70px] sm:text-[100px] lg:text-[130px] xl:text-[160px] ${rtl ? 'tracking-normal' : 'tracking-tighter'}`}>
          <span>{t('hero.line1')}</span>
          <span>{t('hero.line2')}</span>
          <span>{t('hero.line3')}</span>
        </h1>
        
        {/* النص الأبيض المائل (يشبه خط اليد) */}
        <div className={`mt-4 lg:mt-8 transform -rotate-2 ${rtl ? 'ms-2 lg:ms-12' : 'ml-2 lg:ml-12'}`}>
          <span 
            className="text-white text-4xl lg:text-6xl tracking-wide" 
            style={{ fontFamily: rtl ? "'Cairo', 'Segoe UI', sans-serif" : "'Caveat', 'Segoe UI', cursive" }}
          >
            {t('hero.freeBot')}
          </span>
        </div>
      </div>

      {/* القسم الأيمن: صورة البطة */}
      <div className={`absolute bottom-0 h-[60%] lg:h-full w-full lg:w-1/2 flex justify-end items-end z-0 pointer-events-none ${rtl ? 'left-0 justify-start' : 'right-0 justify-end'}`}>
        <img 
          src="./duck_result.webp"
          alt="Albioner Duck Mascot" 
          className={`object-contain h-full lg:h-[95%] xl:h-[105%] max-w-none transform rtl-flip-x ${rtl ? '-translate-x-10 lg:-translate-x-16' : 'translate-x-10 lg:translate-x-16'}`}
        />
        {/* تدرج لوني خفيف أسفل الصورة لدمجها أكثر مع الخلفية إن لزم الأمر */}
        <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-[#030303] to-transparent"></div>
      </div>

      {/* الأزرار / الروابط في أسفل اليمين */}
      <div className={`absolute bottom-8 lg:bottom-12 z-20 flex flex-wrap items-center gap-6 lg:gap-10 ${rtl ? 'left-8 lg:left-16' : 'right-8 lg:right-16'}`}>
        <a 
          href="/login" 
          className={`text-white font-bold uppercase text-sm lg:text-lg border-b-4 border-[#e62b1e] pb-1 hover:text-[#e62b1e] transition-colors ${rtl ? 'tracking-normal' : 'tracking-widest'}`}
        >
          {t('hero.getStarted')}
        </a>
        <a 
          href={BOT_INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`bg-[#e62b1e] hover:bg-[#c4221a] text-white font-bold uppercase text-sm lg:text-base px-5 py-2.5 rounded-lg transition-colors drop-shadow-md ${rtl ? 'tracking-normal' : 'tracking-wide'}`}
        >
          {t('hero.addBot')}
        </a>
        <a 
          href={DISCORD_PROFILE}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-white font-bold uppercase text-sm lg:text-lg border-b-4 border-[#e62b1e] pb-1 hover:text-[#e62b1e] transition-colors ${rtl ? 'tracking-normal' : 'tracking-widest'}`}
        >
          {t('hero.programmer')}
        </a>
      </div>

    </section>
  );
};

export default Hero;
