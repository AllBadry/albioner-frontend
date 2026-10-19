// client/src/config.js
//
// 🌐 Single place for every environment URL the frontend uses.
// The actual values live in /config/app.config.json (inside this repo), so you
// only edit ONE file to switch from localhost to the production domain.
//
//   dev  → apiUrl http://localhost:3009   frontendUrl http://localhost:5173
//   prod → apiUrl https://api.albioner.cc frontendUrl https://albioner.cc
//
// The right block is picked automatically (Vite dev vs. production build).

import appConfig from '../config/app.config.json';

const env = import.meta.env.PROD ? appConfig.prod : appConfig.dev;

export const API_URL = env.apiUrl;
export const FRONTEND_URL = env.frontendUrl;
export const DISCORD_CLIENT_ID = appConfig.discord.clientId;
export const DISCORD_SCOPE = appConfig.discord.scope;
export const DISCORD_REDIRECT_URI = `${FRONTEND_URL}/auth/callback`;

// Billing behaviour (mirrors the backend toggle in /config/app.config.json).
export const BILLING = {
  autoActivate: appConfig.billing?.autoActivate !== false,
  trialDays: appConfig.billing?.trialDays ?? 30,
};

// Permissions the bot asks for when invited: View Channels, Send Messages,
// Embed Links, Attach Files, Read Message History, Mention Everyone,
// Manage Roles, Manage Nicknames and the thread permissions.
export const BOT_PERMISSIONS = '395541203984';

// Full Discord authorize URL the "Continue with Discord" button redirects to.
export function buildDiscordAuthUrl() {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope: DISCORD_SCOPE,
  });
  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

// Bot invite URL. Passing a guildId pre-selects that server in Discord's UI.
export function buildBotInviteUrl(guildId) {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    permissions: BOT_PERMISSIONS,
    integration_type: '0',
    scope: 'bot applications.commands',
  });
  if (guildId) params.set('guild_id', guildId);
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

// Ready-to-use invite link (no pre-selected server) for the "Add Bot" buttons
// in the navbar, hero and tutorial.
export const BOT_INVITE_URL = buildBotInviteUrl();

// The specialized channels a server configures, in the order the dashboard asks
// for them (admin → military → economy → kill feed → announcements). `key`
// matches the GuildSettings field name; labels and hints are localized and live
// under the `channels.<key>` namespace in client/src/i18n/locales/*.
export const CHANNEL_FIELDS = [
  { key: 'adminChannelId' },
  { key: 'militaryChannelId' },
  { key: 'botCommandsChannelId' },
  { key: 'killFeedChannelId' },
  { key: 'announcementsChannelId', optional: true },
];
