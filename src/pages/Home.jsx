import Hero from '../components/sections/Hero';
import About from '../components/sections/About';
import Features from '../components/sections/Features'; // استيراد قسم الميزات
import Tutorial from '../components/sections/Tutorial'; // 
const Home = ({ activeView }) => {
  
  const renderView = () => {
    switch(activeView) {
      case 'hero': 
        return <Hero />;
      case 'about': 
        return <About />;
      case 'features': 
        return <Features />;
      case 'tutorial': // <--- أضف هذا
        return <Tutorial />;
      default: 
        return <Hero />;
    }
  };

  return (
    <main className="w-full min-h-screen overflow-hidden bg-[#030303]">
      {/* 
        حركة الانتقال (Transition):
        خاصية key={activeView} ستعيد تشغيل كلاس animate-fade-in
        في كل مرة يتغير فيها القسم، مما يخلق تلاشياً وانتقالاً ناعماً.
      */}
      <div key={activeView} className="animate-fade-in w-full h-full">
        {renderView()}
      </div>
    </main>
  );
};

export default Home;