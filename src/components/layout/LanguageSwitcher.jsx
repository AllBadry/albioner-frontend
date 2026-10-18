// client/src/components/layout/LanguageSwitcher.jsx
//
// 🌐 Compact language picker. Used in the navbar (landing), the dashboard
// sidebar and the mobile dashboard bar, so it takes a `variant` to stay legible
// on dark and colored backgrounds.

import { useEffect, useRef, useState } from 'react';
import { useI18n, LANGUAGES } from '../../i18n';

const LanguageSwitcher = ({ align = 'end', className = '' }) => {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-gray-300 hover:text-white text-sm font-bold tracking-widest uppercase transition-colors drop-shadow-md"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden lg:inline">{current.code.toUpperCase()}</span>
        <svg className="w-3 h-3 opacity-60" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className={`absolute top-full mt-2 ${align === 'start' ? 'start-0' : 'end-0'} z-50 w-44 max-h-80 overflow-y-auto no-scrollbar rounded-lg border border-white/10 bg-[#0a0a0a] shadow-2xl py-1`}
        >
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === lang}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors hover:bg-white/10 ${
                  l.code === lang ? 'text-[#e62b1e] font-bold' : 'text-gray-300'
                }`}
              >
                <span className="text-base leading-none">{l.flag}</span>
                <span className="flex-1">{l.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;
