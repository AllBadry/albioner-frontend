// مسیر تصویر را بر اساس پوشه پروژه خود تنظیم کنید


const About = () => {
  return (
    <section className="relative w-full min-h-screen bg-[#030303] overflow-hidden flex flex-col lg:flex-row items-center px-6 lg:px-16 pt-24 lg:pt-0 animate-fade-in">
      
      {/* بخش متن (سمت چپ) */}
      <div className="relative z-10 flex flex-col justify-center h-full w-full lg:w-1/2 mt-10 lg:mt-0 animate-slide-up">
        
        <div className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-4">
          <p>The Ultimate Tool</p>
        </div>

        <h2 className="text-[#e62b1e] font-black uppercase leading-[0.9] tracking-tighter text-[60px] sm:text-[80px] lg:text-[110px]">
          Beyond <br /> Just ZvZ
        </h2>
        
        <p className="text-gray-300 mt-8 text-lg lg:text-xl leading-relaxed max-w-xl">
          Albioner is a complete ecosystem for your alliance. We handle the heavy lifting so your leadership can focus on the game. It goes far beyond tracking battles.
        </p>

        <ul className="mt-8 space-y-5 text-white font-bold tracking-widest uppercase text-sm">
          <li className="flex items-center gap-4">
            <span className="w-3 h-3 bg-[#e62b1e] transform rotate-45"></span> 
            Economy & Trade Insights
          </li>
          <li className="flex items-center gap-4">
            <span className="w-3 h-3 bg-[#e62b1e] transform rotate-45"></span> 
            Automated Verification Gate
          </li>
          <li className="flex items-center gap-4">
            <span className="w-3 h-3 bg-[#e62b1e] transform rotate-45"></span> 
            One-Click Regear Management
          </li>
        </ul>
      </div>

      {/* بخش تصویر اردک (سمت راست) */}
      <div className="absolute right-0 bottom-0 h-[60%] lg:h-full w-full lg:w-1/2 flex justify-end items-end z-0 pointer-events-none animate-slide-in-right">
        <img 
          src="./duck3_result.webp" 
          alt="Albioner Guardian Duck" 
          className="object-contain h-full lg:h-[85%] xl:h-[95%] max-w-none transform -translate-x-10 lg:-translate-x-20"
        />
        {/* گرادیان برای ترکیب بهتر با پس‌زمینه */}
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#030303] to-transparent"></div>
      </div>

    </section>
  );
};

export default About;