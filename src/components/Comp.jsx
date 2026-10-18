// client/src/components/Comp.jsx
//
// 🛡️ Composition draft panel — the web view of the bot's /comp party builder.
// Leadership can post a new draft to the military channel and close the open one;
// members claim their roles on the live Discord message (buttons need the bot).

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { useI18n } from '../i18n';

const ROLES = [
  { key: 'tank', field: 'tanks', icon: '🛡️' },
  { key: 'healer', field: 'healers', icon: '💚' },
  { key: 'dps', field: 'dps', icon: '⚔️' },
  { key: 'support', field: 'supports', icon: '🎯' },
];

const EMPTY_FORM = { tanks: '', healers: '', dps: '', supports: '', title: '', note: '' };

const Comp = ({ guildId }) => {
  const { t } = useI18n();
  const [comp, setComp] = useState(null);
  const [channelId, setChannelId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await apiFetch(`/guilds/${guildId}/military/comp`);
      setComp(data.comp || null);
      setChannelId(data.channelId || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [guildId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (!cancelled) load();
    })();
    return () => { cancelled = true; };
  }, [load]);

  const create = async (e) => {
    e.preventDefault();
    setBusy(true);
    setNotice('');
    try {
      await apiFetch(`/guilds/${guildId}/military/comp`, {
        method: 'POST',
        body: JSON.stringify({
          tanks: Number(form.tanks) || 0,
          healers: Number(form.healers) || 0,
          dps: Number(form.dps) || 0,
          supports: Number(form.supports) || 0,
          title: form.title,
          note: form.note,
        }),
      });
      setNotice(t('comp.created'));
      setForm(EMPTY_FORM);
      setShowForm(false);
      await load();
    } catch (err) {
      setNotice(err.message);
    } finally {
      setBusy(false);
    }
  };

  const close = async () => {
    if (!comp) return;
    setBusy(true);
    try {
      await apiFetch(`/guilds/${guildId}/military/comp/${comp._id}/close`, { method: 'POST' });
      await load();
    } catch (err) {
      setNotice(err.message);
    } finally {
      setBusy(false);
    }
  };

  const card = 'bg-[#030303] border border-white/5 rounded-xl';
  const input = 'w-full bg-[#030303] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e62b1e] transition-colors';

  if (loading) return <p className="text-gray-500 text-sm">{t('common.loading')}</p>;
  if (error) return <p className="text-red-300 text-sm">{error}</p>;

  const counts = ROLES.map((r) => ({
    ...r,
    filled: comp ? comp.signups.filter((s) => s.role === r.key) : [],
    required: comp ? Number(comp.requirements?.[r.key] || 0) : 0,
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-white font-black uppercase tracking-tight text-lg">{t('comp.title')}</h2>
          <p className="text-gray-500 text-sm">{t('comp.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          {comp && comp.status === 'open' && (
            <button onClick={close} disabled={busy} className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-red-300 border border-red-500/30 hover:bg-red-950/30 transition-colors disabled:opacity-50">
              {t('comp.closeDraft')}
            </button>
          )}
          <button onClick={() => setShowForm((v) => !v)} className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-white bg-[#e62b1e] hover:brightness-110 transition-colors">
            {t('comp.newDraft')}
          </button>
        </div>
      </div>

      {notice && <p className="text-sm text-gray-300">{notice}</p>}

      {showForm && (
        <form onSubmit={create} className={`${card} p-5 space-y-4`}>
          {!channelId && <p className="text-amber-300 text-xs">{t('comp.noChannel')}</p>}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ROLES.map((r) => (
              <div key={r.key}>
                <label className="block text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-1">{r.icon} {t(`comp.role_${r.key}`)}</label>
                <input type="number" min="0" value={form[r.field]}
                  onChange={(e) => setForm((f) => ({ ...f, [r.field]: e.target.value }))}
                  className={input} placeholder="0" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={input} placeholder={t('comp.titlePlaceholder')} maxLength={80} />
            <input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} className={input} placeholder={t('comp.notePlaceholder')} maxLength={300} />
          </div>
          <button type="submit" disabled={busy || !channelId} className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-white bg-[#e62b1e] hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed">
            {busy ? t('common.saving') : t('comp.create')}
          </button>
        </form>
      )}

      {!comp ? (
        <div className="border border-dashed border-white/10 rounded-2xl py-16 text-center">
          <div className="text-4xl mb-3 opacity-40">🛡️</div>
          <p className="text-gray-500 text-sm">{t('comp.empty')}</p>
        </div>
      ) : (
        <div className={`${card} p-5 space-y-4`}>
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-white font-bold">{comp.title || t('comp.defaultTitle')}</h3>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${comp.status === 'open' ? 'text-green-300 border-green-500/30 bg-green-950/20' : 'text-gray-400 border-white/10'}`}>
              {comp.status === 'open' ? t('comp.statusOpen') : t('comp.statusClosed')}
            </span>
          </div>
          {comp.note && <p className="text-gray-400 text-sm">{comp.note}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {counts.map((c) => (
              <div key={c.key} className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4">
                <p className="text-gray-300 text-xs font-bold uppercase tracking-widest mb-1">{c.icon} {t(`comp.role_${c.key}`)}</p>
                <p className="text-white font-black tabular-nums">
                  {c.required > 0 ? `${c.filled.length}/${c.required}` : c.filled.length}
                </p>
                <ul className="mt-2 space-y-0.5">
                  {c.filled.length === 0 ? (
                    <li className="text-gray-600 text-xs">{t('comp.noOne')}</li>
                  ) : (
                    c.filled.map((s, i) => <li key={i} className="text-gray-400 text-xs truncate">{s.albionName || s.discordId}</li>)
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Comp;
