import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth';

const Navbar = ({ setActiveView, activeView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { loggedIn } = useAuth();

  const handleNavClick = (view, e) => {
    e.preventDefault();
    setActiveView(view);
    setIsOpen(false); // إغلاق القائمة في الهواتف بعد الاختيار
  };

  return (
    // تم تغيير الكلاس هنا إلى bg-transparent ليكون شفافاً بالكامل
    <nav className="fixed w-full top-0 z-50 bg-transparent">
      <div className="w-full px-6 lg:px-16 mx-auto flex items-center justify-between h-20">
        
        {/* الشعار */}
        <Link
          to="/"
          className="flex-shrink-0 cursor-pointer"
          onClick={(e) => {
            if (isHome) {
              handleNavClick('hero', e);
            }
          }}
        >
          <span className="text-white font-black text-2xl lg:text-3xl tracking-tighter uppercase drop-shadow-md">
            Albioner
          </span>
        </Link>

        {/* الروابط للشاشات الكبيرة */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            onClick={(e) => isHome && handleNavClick('hero', e)}
            className={`${isHome && activeView === 'hero' ? 'text-white' : 'text-gray-300'} hover:text-white text-sm font-bold tracking-widest uppercase transition-colors drop-shadow-md`}
          >
            Home
          </Link>
          <Link
            to="/"
            onClick={(e) => isHome && handleNavClick('about', e)}
            className={`${isHome && activeView === 'about' ? 'text-white' : 'text-gray-300'} hover:text-white text-sm font-bold tracking-widest uppercase transition-colors drop-shadow-md`}
          >
            About
          </Link>
          {/* رابط الميزات الجديد */}
          <Link
            to="/"
            onClick={(e) => isHome && handleNavClick('features', e)}
            className={`${isHome && activeView === 'features' ? 'text-white' : 'text-gray-300'} hover:text-white text-sm font-bold tracking-widest uppercase transition-colors drop-shadow-md`}
          >
            Features
          </Link>
          <Link
            to="/"
            onClick={(e) => isHome && handleNavClick('tutorial', e)}
            className={`${isHome && activeView === 'tutorial' ? 'text-white' : 'text-gray-300'} hover:text-white text-sm font-bold tracking-widest uppercase transition-colors drop-shadow-md`}
          >
            Tutorial
          </Link>
        </div>
        
        {/* زر تسجيل الدخول / الداشبورد + زر ديسكورد للشاشات الكبيرة */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          {loggedIn ? (
            <Link to="/dashboard" className="flex items-center gap-2 text-white font-bold uppercase text-sm tracking-widest hover:text-[#e62b1e] transition-colors drop-shadow-md">
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="flex items-center gap-2 text-white font-bold uppercase text-sm tracking-widest hover:text-[#e62b1e] transition-colors drop-shadow-md">
              Login
            </Link>
          )}
          <a href="https://discord.gg/4ApfNZnze" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white font-bold uppercase text-sm tracking-widest hover:text-[#e62b1e] transition-colors drop-shadow-md">
            Discord
            <svg className="w-6 h-6 fill-current" viewBox="0 0 127.14 96.36" xmlns="http://www.w3.org/2000/svg">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.09,53,91.08,65.69,84.69,65.69Z"/>
            </svg>
          </a>
        </div>

        {/* زر القائمة للموبايل */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:text-[#e62b1e] focus:outline-none drop-shadow-md">
            {isOpen ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* قائمة الموبايل المنسدلة (نبقي خلفيتها سوداء شفافة لتكون مقروءة على الموبايل) */}
      {isOpen && (
        <div className="md:hidden bg-[#030303]/95 backdrop-blur-md border-t border-white/5">
          <div className="px-6 pt-4 pb-6 space-y-4 flex flex-col">
            <Link to="/" onClick={(e) => { setIsOpen(false); if (isHome) handleNavClick('hero', e); }} className="text-gray-300 hover:text-white text-sm font-bold tracking-widest uppercase">Home</Link>
            <Link to="/" onClick={(e) => { setIsOpen(false); if (isHome) handleNavClick('about', e); }} className="text-gray-300 hover:text-white text-sm font-bold tracking-widest uppercase">About</Link>
            <Link to="/" onClick={(e) => { setIsOpen(false); if (isHome) handleNavClick('features', e); }} className="text-gray-300 hover:text-white text-sm font-bold tracking-widest uppercase">Features</Link>
            <Link to="/" onClick={(e) => { setIsOpen(false); if (isHome) handleNavClick('tutorial', e); }} className="text-gray-300 hover:text-white text-sm font-bold tracking-widest uppercase">Tutorial</Link>
            {loggedIn ? (
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-[#e62b1e] text-sm font-bold tracking-widest uppercase">Dashboard</Link>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white text-sm font-bold tracking-widest uppercase">Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;