// client/src/components/Loans.jsx
//
// 📦 Guild armory panel — the web view of the bot's /lend command. Record gear
// handed to a member, and mark returns / extensions straight from the site.

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { useI18n } from '../i18n';

const STATUS_STYLE = {
  out: 'text-[#f1c40f] border-[#f1c40f]/30 bg-[#f1c40f]/10',
  overdue: 'text-red-300 border-red-500/30 bg-red-950/20',
  returned: 'text-green-300 border-green-500/30 bg-green-950/20',
};

const Loans = ({ guildId }) => {
  const { t, timeAgo } = useI18n();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ borrowerId: '', item: '', quantity: '1', hours: '24' });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await apiFetch(`/guilds/${guildId}/loans`);
      setLoans(data.loans || []);
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

  const add = async (e) => {
    e.preventDefault();
    setBusy(true);
    setNotice('');
    try {
      await apiFetch(`/guilds/${guildId}/loans`, {
        method: 'POST',
        body: JSON.stringify({
          borrowerId: form.borrowerId.trim(),
          item: form.item.trim(),
          quantity: Number(form.quantity) || 1,
          hours: Number(form.hours) || 24,
        }),
      });
      setForm({ borrowerId: '', item: '', quantity: '1', hours: '24' });
      await load();
    } catch (err) {
      setNotice(err.message);
    } finally {
      setBusy(false);
    }
  };

  const act = async (id, action) => {
    try {
      await apiFetch(`/guilds/${guildId}/loans/${id}/${action}`, { method: 'POST' });
      await load();
    } catch (err) {
      setNotice(err.message);
    }
  };

  const card = 'bg-[#030303] border border-white/5 rounded-xl';
  const input = 'w-full bg-[#030303] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#e62b1e] transition-colors';

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-black uppercase tracking-tight text-lg">{t('loan.title')}</h2>
        <p className="text-gray-500 text-sm">{t('loan.subtitle')}</p>
      </div>

      {notice && <p className="text-sm text-gray-300">{notice}</p>}

      <form onSubmit={add} className={`${card} p-5 grid grid-cols-1 sm:grid-cols-4 gap-3`}>
        <div>
          <label className="block text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-1">{t('loan.borrowerId')}</label>
          <input value={form.borrowerId} onChange={(e) => setForm((f) => ({ ...f, borrowerId: e.target.value }))} className={input} placeholder={t('loan.borrowerIdPlaceholder')} required />
        </div>
        <div>
          <label className="block text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-1">{t('loan.item')}</label>
          <input value={form.item} onChange={(e) => setForm((f) => ({ ...f, item: e.target.value }))} className={input} placeholder={t('loan.itemPlaceholder')} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-1">{t('loan.quantity')}</label>
            <input type="number" min="1" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} className={input} />
          </div>
          <div>
            <label className="block text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-1">{t('loan.hours')}</label>
            <input type="number" min="1" value={form.hours} onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))} className={input} />
          </div>
        </div>
        <button type="submit" disabled={busy} className="self-end px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-white bg-[#e62b1e] hover:brightness-110 transition disabled:opacity-40">
          {t('loan.give')}
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500 text-sm">{t('common.loading')}</p>
      ) : error ? (
        <p className="text-red-300 text-sm">{error}</p>
      ) : loans.length === 0 ? (
        <div className="border border-dashed border-white/10 rounded-2xl py-16 text-center">
          <div className="text-4xl mb-3 opacity-40">📦</div>
          <p className="text-gray-500 text-sm">{t('loan.empty')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {loans.map((l) => (
            <div key={l._id} className={`${card} p-4 flex flex-wrap items-center gap-4`}>
              <div className="flex-1 min-w-[160px]">
                <p className="text-white font-bold text-sm">{l.item}{l.quantity > 1 ? ` ×${l.quantity}` : ''}</p>
                <p className="text-gray-500 text-xs">{l.borrowerName || `<@${l.borrowerId}>`}</p>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${STATUS_STYLE[l.status] || STATUS_STYLE.out}`}>
                {t(`loan.status_${l.status}`)}
              </span>
              <div className="text-end">
                <p className="text-gray-500 text-[10px] uppercase tracking-widest">{t('loan.due')}</p>
                <p className="text-gray-300 text-xs">{l.dueAt ? timeAgo(l.dueAt) : '—'}</p>
              </div>
              {l.status !== 'returned' && (
                <div className="flex gap-2">
                  <button onClick={() => act(l._id, 'return')} className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest text-green-300 border border-green-500/30 hover:bg-green-950/20 transition-colors">
                    {t('loan.markReturned')}
                  </button>
                  <button onClick={() => act(l._id, 'extend')} className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest text-gray-300 border border-white/10 hover:bg-white/5 transition-colors">
                    {t('loan.extend')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Loans;
