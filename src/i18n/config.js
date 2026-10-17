// client/src/i18n/config.js
//
// 🌐 Locale registry for the website. Mirrors the bot's language set
// (src/i18n/index.js on the backend) so the site and the bot speak the same
// ten languages.

import en from './locales/en';
import es from './locales/es';
import pt from './locales/pt';
import ru from './locales/ru';
import zh from './locales/zh';
import ar from './locales/ar';
import fr from './locales/fr';
import de from './locales/de';
import pl from './locales/pl';
import tr from './locales/tr';

export const locales = { en, es, pt, ru, zh, ar, fr, de, pl, tr };

export const DEFAULT_LANG = 'en';

// Languages written right-to-left — used to flip the whole layout.
export const RTL_LANGS = ['ar'];

// Ordered list used by the language picker (same order as the bot).
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
];
