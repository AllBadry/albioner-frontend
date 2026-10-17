// client/src/i18n/index.js
//
// 🌐 Consumer entry point: the useI18n() hook plus the language metadata that
// the language picker needs.

import { useContext } from 'react';
import { I18nContext } from './context';

export { LANGUAGES, locales, DEFAULT_LANG, RTL_LANGS } from './config';

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider');
  return ctx;
}
