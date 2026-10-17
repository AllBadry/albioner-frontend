// client/src/pages/Dashboard.jsx
//
// 🖥️ Client dashboard: pick a Discord server you administer, invite the bot if
// it's missing, then set the tracked Albion guild + notification channel.

import { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { apiFetch } from '../api';
import { buildBotInviteUrl, CHANNEL_FIELDS } from '../config';
import KillWatcher from '../components/KillWatcher';
import Military from '../components/Military';
import Economy from '../components/Economy';
import Members from '../components/Members';

const EMPTY_FORM = {
  allianceName: '',
  adminChannelId: '',
  militaryChannelId: '',
  botCommandsChannelId: '',
  killFeedChannelId: '',
};

const formFromSettings = (settings) => ({
  allianceName: settings?.allianceName && settings.allianceName !== 'None' ? settings.allianceName : '',
  adminChannelId: settings?.adminChannelId || '',
  militaryChannelId: settings?.militaryChannelId || '',
  botCommandsChannelId: settings?.botCommandsChannelId || '',
  killFeedChannelId: settings?.killFeedChannelId || '',
});

const guildIconUrl = (guild) =>
  guild?.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=64` : null;

const GuildAvatar = ({ guild, size = 'w-10 h-10' }) => {
  const url = guildIconUrl(guild);
  if (url) {
    return <img src={url} alt={guild.name} className={`${size} rounded-xl border border-white/10 object-cover flex-shrink-0`} />;
  }
  return (
    <div className={`${size} rounded-xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center flex-shrink-0`}>
      <span className="text-white font-black text-sm uppercase">{guild?.name?.charAt(0) || '?'}</span>
    </div>
  );
};

const Dashboard = () => {
  const { loggedIn, user, logout } = useAuth();

  const [guilds, setGuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [view, setView] = useState('setup'); // 'setup' | 'kills' | 'military' | 'economy'

  const [channels, setChannels] = useState([]);
  const [channelsLoading, setChannelsLoading] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null); // { type: 'ok' | 'err', text }

  const selected = guilds.find((g) => g.id === selectedId) || null;

  const loadGuilds = useCallback(async () => {
    try {
      setError('');
      const data = await apiFetch('/guilds');
      setGuilds(data.guilds || []);
      return data.guilds || [];
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadChannels = useCallback(async (guildId) => {
    setChannelsLoading(true);
    try {
      const data = await apiFetch(`/guilds/${guildId}/channels`);
      setChannels(data.channels || []);
    } catch (err) {
      setChannels([]);
      if (err.status !== 409) setNotice({ type: 'err', text: err.message });
    } finally {
      setChannelsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (!cancelled) loadGuilds();
    })();
    return () => {
      cancelled = true;
    };
  }, [loggedIn, loadGuilds]);

  const selectGuild = (guild) => {
    setSelectedId(guild.id);
    setView('setup');
    setNotice(null);
    setForm(formFromSettings(guild.settings));
    setChannels([]);
    if (guild.botPresent) loadChannels(guild.id);
  };

  const addBot = () => {
    window.open(buildBotInviteUrl(selected?.id), '_blank', 'noopener');
  };

  const refreshSelected = async () => {
    const fresh = await loadGuilds();
    const g = fresh.find((x) => x.id === selectedId);
    if (g) selectGuild(g);
  };

  // Keep the sidebar form + status in sync when the military channel changes
  // from the Military panel (without resetting the current view).
  const updateMilitaryChannel = (channelId) => {
    setForm((f) => ({ ...f, militaryChannelId: channelId }));
    setGuilds((prev) =>
      prev.map((g) =>
        g.id === selectedId
          ? { ...g, settings: { ...(g.settings || {}), militaryChannelId: channelId } }
          : g
      )
    );
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    setNotice(null);
    try {
      const data = await apiFetch(`/guilds/${selected.id}/settings`, {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setNotice({ type: 'ok', text: 'Settings saved. The bot will now watch this guild.' });
      setGuilds((prev) =>
        prev.map((g) =>
          g.id === selected.id
            ? {
                ...g,
                configured: true,
                settings: { ...(g.settings || {}), ...data.settings },
              }
            : g
        )
      );
    } catch (err) {
      setNotice({ type: 'err', text: err.message });
      if (err.status === 409) {
        await loadGuilds();
      }
    } finally {
      setSaving(false);
    }
  };

  if (!loggedIn) return <Navigate to="/login" replace />;

  const allChannelsChosen = CHANNEL_FIELDS.every((f) => form[f.key]);

  const avatarUrl = user?.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
    : 'https://cdn.discordapp.com/embed/avatars/0.png';
  const displayName = user?.global_name || user?.username || 'Player';

  return (
    <div className="w-full min-h-screen bg-[#030303] pt-20">
      <div className="w-full px-4 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-72 flex-shrink-0">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 lg:sticky lg:top-24">
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/10">
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-11 h-11 rounded-full border border-white/10"
                onError={(e) => { e.currentTarget.src = 'https://cdn.discordapp.com/embed/avatars/0.png'; }}
              />
              <div className="min-w-0">
                <p className="text-white font-bold text-sm truncate">{displayName}</p>
                <p className="text-gray-500 text-xs truncate">@{user?.username || 'user'}</p>
              </div>
            </div>

            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Your servers</p>

            {loading && <p className="text-gray-500 text-sm py-2">Loading servers…</p>}

            {!loading && guilds.length === 0 && (
              <p className="text-gray-500 text-sm py-2">No servers where you are an admin.</p>
            )}

            <div className="flex flex-col gap-2">
              {guilds.map((g) => (
                <button
                  key={g.id}
                  onClick={() => selectGuild(g)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl text-left transition-all duration-200 border ${
                    selectedId === g.id
                      ? 'bg-red-950/40 border-[#e62b1e]'
                      : 'border-white/5 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <GuildAvatar guild={g} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-white font-bold text-sm truncate">{g.name}</span>
                    <span className="block text-[10px] uppercase tracking-widest text-gray-500">
                      {g.botPresent ? (g.configured ? 'Configured' : 'Ready to set up') : 'Bot not added'}
                    </span>
                  </span>
                  {g.botPresent && (
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${g.configured ? 'bg-green-400' : 'bg-amber-400'}`} />
                  )}
                </button>
              ))}
            </div>

            {selected && (
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
                <button
                  onClick={() => setView('setup')}
                  className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors border ${
                    view === 'setup' ? 'bg-red-950/40 border-[#e62b1e] text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  ⚙️ Server Setup
                </button>
                <button
                  onClick={() => setView('kills')}
                  className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors border ${
                    view === 'kills' ? 'bg-red-950/40 border-[#e62b1e] text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  ⚔️ Kill Watcher
                </button>
                <button
                  onClick={() => setView('military')}
                  className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors border ${
                    view === 'military' ? 'bg-red-950/40 border-[#e62b1e] text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  🎯 Military
                </button>
                <button
                  onClick={() => setView('economy')}
                  className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors border ${
                    view === 'economy' ? 'bg-red-950/40 border-[#e62b1e] text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  💰 Economy
                </button>
                <button
                  onClick={() => setView('members')}
                  className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors border ${
                    view === 'members' ? 'bg-red-950/40 border-[#e62b1e] text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  👥 Members
                </button>
              </div>
            )}

            <button
              onClick={() => window.open(buildBotInviteUrl(), '_blank', 'noopener')}
              className="w-full mt-4 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-colors"
            >
              + Add bot to a server
            </button>

            <button
              onClick={logout}
              className="w-full mt-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-red-400 hover:text-white hover:bg-red-950/40 border border-white/10 transition-colors"
            >
              Log out
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {error && (
            <div className="mb-6 flex items-center justify-between gap-4 bg-red-950/30 border border-red-500/30 rounded-xl px-5 py-4">
              <p className="text-red-300 text-sm">{error}</p>
              <button onClick={loadGuilds} className="text-white text-xs font-bold uppercase tracking-widest hover:text-[#e62b1e]">Retry</button>
            </div>
          )}

          {!selected && (
            <div className="flex flex-col items-center justify-center text-center py-28 border border-dashed border-white/10 rounded-2xl animate-fade-in">
              <div className="text-5xl mb-4 opacity-40">🖥️</div>
              <h2 className="text-white font-black uppercase tracking-widest mb-2">Select a server</h2>
              <p className="text-gray-500 text-sm max-w-md">
                Choose one of your servers from the list to set up the kill feed and notifications.
              </p>
            </div>
          )}

          {selected && view === 'setup' && (
            <div key={selected.id} className="animate-fade-in space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                <GuildAvatar guild={selected} size="w-14 h-14" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-white font-black uppercase tracking-tighter text-2xl lg:text-3xl truncate">{selected.name}</h1>
                  <p className="text-gray-500 text-xs font-mono">{selected.id}</p>
                </div>
              </div>

              {/* Step 1: invite the bot if missing */}
              {!selected.botPresent && (
                <div className="bg-[#0a0a0a] border border-amber-500/30 rounded-2xl p-6 lg:p-8">
                  <h2 className="text-white font-bold uppercase tracking-widest mb-2">Step 1 — Add the bot</h2>
                  <p className="text-gray-400 text-sm mb-6 max-w-2xl">
                    The bot is not in this server yet. Click below and approve the Discord screen to invite it.
                    It needs permission to view channels and send messages.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={addBot}
                      className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-white bg-[#5865F2] hover:bg-[#4752C4] transition-colors"
                    >
                      Add Bot to Server
                    </button>
                    <button
                      onClick={refreshSelected}
                      className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      I&apos;ve added it — refresh
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: configure */}
              {selected.botPresent && (
                <form onSubmit={saveSettings} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-6">
                  <div>
                    <h2 className="text-white font-bold uppercase tracking-widest">Step 2 — Configure</h2>
                    <p className="text-gray-500 text-sm mt-1">Tell the bot which Albion guild to watch and where to post alerts.</p>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
                      Guild Name (in Albion)
                    </label>
                    <input
                      type="text"
                      value={form.allianceName}
                      onChange={(e) => setForm((f) => ({ ...f, allianceName: e.target.value }))}
                      placeholder="e.g. Sun"
                      className="w-full bg-[#030303] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#e62b1e] transition-colors"
                    />
                    <p className="text-gray-600 text-xs mt-2">Must match the Albion guild name exactly (case-sensitive).</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Notification channels</h3>
                      {channelsLoading && <span className="text-gray-600 text-xs">Loading channels…</span>}
                    </div>
                    <div className="space-y-4">
                      {CHANNEL_FIELDS.map((field, i) => (
                        <div key={field.key}>
                          <label className="block text-gray-300 text-xs font-bold uppercase tracking-widest mb-1.5">
                            <span className="text-[#e62b1e]">{i + 1}.</span> {field.label}
                          </label>
                          <select
                            value={form[field.key]}
                            onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                            disabled={channelsLoading}
                            className="w-full bg-[#030303] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#e62b1e] transition-colors disabled:opacity-50"
                          >
                            <option value="">Select a channel…</option>
                            {channels.map((c) => (
                              <option key={c.id} value={c.id}>#{c.name}</option>
                            ))}
                          </select>
                          <p className="text-gray-600 text-xs mt-1.5">{field.hint}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {notice && (
                    <div className={`rounded-xl px-4 py-3 text-sm border ${
                      notice.type === 'ok'
                        ? 'bg-green-950/20 border-green-500/30 text-green-300'
                        : 'bg-red-950/20 border-red-500/30 text-red-300'
                    }`}>
                      {notice.text}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={saving || !form.allianceName.trim() || !allChannelsChosen}
                      className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-white bg-[#e62b1e] hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving…' : 'Save settings'}
                    </button>
                    <button
                      type="button"
                      onClick={refreshSelected}
                      className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      Refresh
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {selected && view === 'kills' && (
            <div key={`kills-${selected.id}`} className="animate-fade-in">
              <KillWatcher guild={selected} />
            </div>
          )}

          {selected && view === 'military' && (
            <div key={selected.id} className="animate-fade-in">
              <Military guild={selected} onChannelSaved={updateMilitaryChannel} />
            </div>
          )}

          {selected && view === 'economy' && (
            <div key={`${selected.id}-economy`} className="animate-fade-in">
              <Economy guild={selected} />
            </div>
          )}

          {selected && view === 'members' && (
            <div key={`${selected.id}-members`} className="animate-fade-in">
              <Members guild={selected} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
