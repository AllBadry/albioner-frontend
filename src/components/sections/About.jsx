import { useState } from 'react';


const About = () => {
  const [activeFeature, setActiveFeature] = useState(null);

  const features = [
    {
      id: 1,
      title: "Economy & Trade Insights",
      desc: "Smart, real-time analysis of in-game economy and prices to help your alliance make sound financial decisions."
    },
    {
      id: 2,
      title: "Automated Verification Gate",
      desc: "A smart verification gate that links member accounts automatically, completely preventing spies from infiltrating your server."
    },
    {
      id: 3,
      title: "One-Click Regear Management",
      desc: "A single-click gear compensation system that eliminates the complexity of tedious manual calculations."
    }
  ];

  return (
    <section className="relative w-full min-h-screen bg-[#03030371] overflow-hidden flex flex-col lg:flex-row items-center px-6 lg:px-16 pt-24 lg:pt-0">
      
      {/* 
        الجديد: صورة المدينة على اليسار 
        تم جعلها كخلفية متلاشية (Faded Background) لكي لا تتعارض مع النصوص
      */}
      {/* 
        صورة المدينة على اليسار 
      */}
      <div className="absolute left-0 top-0 h-full w-full lg:w-[80%] z-0 pointer-events-none animate-fade-in">
        <img 
          src="/cityyyy.jpg"
          alt="Alliance Town" 
          // 1. أضفنا `object-[30%_center]` لسحب الصورة وإظهار الجزء المناسب منها
          className={`object-cover object-[30%_center] w-full h-full opacity-90 transition-transform duration-1000 ${activeFeature ? 'scale-105' : 'scale-100'}`}
          style={{
            // 2. عدلنا التدرج ليتناسب مع العرض الجديد (يبدأ التلاشي من 40% وينتهي عند 90%)
            maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 90%)',
            WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 90%)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#030303]/30 via-[#030303]/70 to-[#030303]"></div>
      </div>

      {/* Ambient Fire Sparks (الشرارات النارية) */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-amber-500 rounded-full animate-ping delay-75"></div>
        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-[#e62b1e] rounded-full animate-ping delay-300"></div>
        <div className="absolute bottom-1/4 left-10 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping delay-500"></div>
      </div>

      {/* Left Section: Text & Interactive Features */}
      <div className="relative z-10 flex flex-col justify-center h-full w-full lg:w-1/2 mt-10 lg:mt-0 animate-slide-up pl-0 lg:pl-8">
        
        <div className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-4 drop-shadow-md">
          <p>The Ultimate Tool</p>
        </div>

        <h2 className="text-[#e62b1e] font-black uppercase leading-[0.9] tracking-tighter text-[60px] sm:text-[80px] lg:text-[110px] transform hover:scale-[1.02] transition-transform duration-300 drop-shadow-lg">
          Beyond <br /> Just ZvZ
        </h2>
        
        <p className="text-gray-200 mt-6 text-lg lg:text-xl leading-relaxed max-w-xl drop-shadow-md font-medium">
          Albioner is not just a battle-tracking bot. It's a complete ecosystem that manages every detail of your alliance, saving your leadership hours of hard work.
        </p>

        {/* Features List */}
        <div className="mt-8 space-y-4 max-w-xl">
          {features.map((feature) => (
            <div
              key={feature.id}
              onMouseEnter={() => setActiveFeature(feature.id)}
              onMouseLeave={() => setActiveFeature(null)}
              className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer backdrop-blur-sm ${
                activeFeature === feature.id
                  ? 'bg-red-950/40 border-[#e62b1e] translate-x-3 shadow-[0_0_15px_rgba(230,43,30,0.3)]'
                  : 'bg-[#030303]/40 border-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`w-3.5 h-3.5 bg-[#e62b1e] transform rotate-45 transition-transform duration-500 shadow-md ${
                  activeFeature === feature.id ? 'scale-125 rotate-[135deg]' : ''
                }`}></span>
                <h3 className="text-white font-bold tracking-widest uppercase text-base lg:text-lg drop-shadow-md">
                  {feature.title}
                </h3>
              </div>
              
              <div className={`overflow-hidden transition-all duration-300 ${
                activeFeature === feature.id ? 'max-h-24 mt-2 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <p className="text-gray-300 text-sm font-medium leading-relaxed mt-2 drop-shadow-md">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Section: Giant Interactive Duck */}
      <div className="absolute right-0 bottom-0 h-[65%] lg:h-full w-full lg:w-1/2 flex justify-end items-end z-0 pointer-events-none animate-slide-in-right">
        
        <div className="relative h-full w-full flex justify-end items-end">
          
          {/* Fire Glow */}
          <div className={`absolute right-12 bottom-12 w-[80%] h-[80%] rounded-full bg-gradient-to-tr from-red-600/10 to-amber-500/10 blur-[120px] transition-opacity duration-700 ${
            activeFeature ? 'opacity-100 scale-105' : 'opacity-50'
          }`}></div>

          {/* Duck Image */}
          <img 
            src="./duck3.png"
            alt="Albioner Guardian Duck" 
            className={`object-contain h-[90%] lg:h-[95%] xl:h-[108%] max-w-none transform transition-all duration-700 translate-y-16 lg:translate-y-28 ${
              activeFeature 
                ? 'scale-[1.04] -translate-x-12 lg:-translate-x-24 rotate-[1deg] brightness-110 drop-shadow-[0_0_35px_rgba(230,43,30,0.25)]' 
                : '-translate-x-8 lg:-translate-x-16 rotate-0'
            }`}
          />
          
          <div className="absolute bottom-0 w-full h-36 bg-gradient-to-t from-[#030303] to-transparent"></div>
        </div>
      </div>

    </section>
  );
};

export default About;