// client/src/utils/format.js
//
// 🎨 Small language-neutral display helpers. Relative times and silver values
// are localized through the i18n layer (useI18n().timeAgo / .silver); the full
// timestamp and item thumbnails stay the same in every language.

export const number = new Intl.NumberFormat('en-US');

// Full local timestamp for the popup — a relative "3h ago" is useless there.
export function fullTime(ts) {
  return new Date(ts).toLocaleString();
}

export function itemImage(type) {
  return `https://render.albiononline.com/v1/item/${type}.png`;
}
