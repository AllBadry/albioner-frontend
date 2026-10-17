// client/src/i18n/provider.jsx
//
// 🌐 React provider that keeps the current language in context, persists it in
// localStorage, auto-detects the browser language on first visit, and sets
// <html lang=".." dir=".."> so Arabic flips the whole layout to RTL.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { I18nContext } from './context';
import { locales, DEFAULT_LANG, RTL_LANGS } from './config';

const STORAGE_KEY = 'albioner-language';
const number = new Intl.NumberFormat('en-US');

function resolve(obj, key) {
  return key.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : undefined), obj);
}

function interpolate(str, vars) {
  if (typeof str !== 'string') return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : `{${k}}`));
}

const isRtl = (lang) => RTL_LANGS.includes(lang);

function detectLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && locales[saved]) return saved;
  } catch {
    /* ignore */
  }
  const nav = (navigator.language || '').slice(0, 2).toLowerCase();
  if (locales[nav]) return nav;
  return DEFAULT_LANG;
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectLang);

  useEffect(() => {
    const dir = isRtl(lang) ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const setLang = useCallback((next) => {
    if (locales[next]) setLangState(next);
  }, []);

  const t = useCallback(
    (key, vars) => {
      let str = resolve(locales[lang], key);
      if (str == null) str = resolve(locales[DEFAULT_LANG], key);
      if (str == null) return key;
      return interpolate(str, vars || {});
    },
    [lang],
  );

  // Localized display helpers (numbers stay en-US, like the bot).
  const silver = useCallback((value) => `${number.format(value || 0)} ${t('common.silver')}`, [t]);
  const timeAgo = useCallback(
    (ts) => {
      const diff = Date.now() - new Date(ts).getTime();
      const secs = Math.floor(diff / 1000);
      if (secs < 5) return t('common.time.justNow');
      if (secs < 60) return t('common.time.sAgo', { n: secs });
      const mins = Math.floor(secs / 60);
      if (mins < 60) return t('common.time.mAgo', { n: mins });
      const hours = Math.floor(mins / 60);
      if (hours < 24) return t('common.time.hAgo', { n: hours });
      return t('common.time.dAgo', { n: Math.floor(hours / 24) });
    },
    [t],
  );

  const value = useMemo(
    () => ({ lang, setLang, t, dir: isRtl(lang) ? 'rtl' : 'ltr', silver, timeAgo, number }),
    [lang, setLang, t, silver, timeAgo],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export default I18nProvider;
