// client/src/utils/format.js
//
// 🎨 Small display helpers shared by the kill radar and its detail popup, so the
// list and the popup never disagree about how a time or a price is written.

export const number = new Intl.NumberFormat('en-US');

// "just now" / "12s ago" / "4m ago" / "3h ago" / "2d ago"
export function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 5) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// Full local timestamp for the popup — a relative "3h ago" is useless there.
export function fullTime(ts) {
  return new Date(ts).toLocaleString();
}

export function silver(value) {
  return `${number.format(value || 0)} silver`;
}

export function itemImage(type) {
  return `https://render.albiononline.com/v1/item/${type}.png`;
}
