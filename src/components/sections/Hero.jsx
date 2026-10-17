// قم بتعديل مسار الصورة حسب مكانها في مشروعك

// رابط حساب الديسكورد الخاص بالمطوّر (يُستخدم في زر "Programmer" بالأسفل).
const DISCORD_PROFILE = 'https://discord.com/users/1al_badry';

const Hero = () => {
  return (
    // الحاوية الرئيسية: شاشة كاملة، خلفية سوداء داكنة جداً
    <section className="relative w-full min-h-screen bg-[#030303] overflow-hidden flex flex-col lg:flex-row items-center px-6 lg:px-16 pt-24 lg:pt-0">
      
      

      {/* القسم الأيسر: النصوص الضخمة */}
      <div className="relative z-10 flex flex-col justify-center h-full w-full lg:w-3/5 mt-10 lg:mt-0">
        
        {/* النص الأحمر الضخم */}
        <h1 className="flex flex-col text-[#e62b1e] font-black uppercase leading-[0.85] tracking-tighter text-[70px] sm:text-[100px] lg:text-[130px] xl:text-[160px]">
          <span>Albion</span>
          <span>Alliance</span>
          <span>Manager</span>
        </h1>
        
        {/* النص الأبيض المائل (يشبه خط اليد) */}
        <div className="mt-4 lg:mt-8 ml-2 lg:ml-12 transform -rotate-2">
          <span 
            className="text-white text-4xl lg:text-6xl tracking-wide" 
            style={{ fontFamily: "'Brush Script MT', 'Caveat', cursive" }}
          >
            Free Bot ©
          </span>
        </div>
      </div>

      {/* القسم الأيمن: صورة البطة */}
      <div className="absolute right-0 bottom-0 h-[60%] lg:h-full w-full lg:w-1/2 flex justify-end items-end z-0 pointer-events-none">
        <img 
          src="./duck.png"
          alt="Albioner Duck Mascot" 
          className="object-contain h-full lg:h-[95%] xl:h-[105%] max-w-none transform translate-x-10 lg:translate-x-16"
        />
        {/* تدرج لوني خفيف أسفل الصورة لدمجها أكثر مع الخلفية إن لزم الأمر */}
        <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-[#030303] to-transparent"></div>
      </div>

      {/* الأزرار / الروابط في أسفل اليمين */}
      <div className="absolute bottom-8 lg:bottom-12 right-8 lg:right-16 z-20 flex gap-6 lg:gap-10">
        <a 
          href="/login" 
          className="text-white font-bold uppercase text-sm lg:text-lg tracking-widest border-b-4 border-[#e62b1e] pb-1 hover:text-[#e62b1e] transition-colors"
        >
          Get Started
        </a>
        <a 
          href={DISCORD_PROFILE}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white font-bold uppercase text-sm lg:text-lg tracking-widest border-b-4 border-[#e62b1e] pb-1 hover:text-[#e62b1e] transition-colors"
        >
          Programmer
        </a>
      </div>

    </section>
  );
};

export default Hero;