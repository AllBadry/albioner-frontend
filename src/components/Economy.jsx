// client/src/components/Economy.jsx
//
// 💰 Economy panel — the web home for the same tools the bot exposes in the
// economy channel: crafting tax, laborer journals, cross-city trade, the market
// price chart, refining profit and the alliance chest audit. Every tool is a
// stateless calculator backed by the Albion open-data API, so the web panel runs
// independently of the Discord economy channel (the channel itself is chosen in
// Server Setup and keeps working exactly as before).

import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../api';
import { number } from '../utils/format';
import { useI18n } from '../i18n';

const CITIES = ['Caerleon', 'Bridgewatch', 'Fort Sterling', 'Lymhurst', 'Martlock', 'Thetford', 'Brecilien'];

const inputCls =
  'w-full bg-[#030303] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#e62b1e] transition-colors';

const Card = ({ children }) => (
  <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-5">{children}</div>
);

const Field = ({ label, children }) => (
  <label className="block">
    <span className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-1.5">{label}</span>
    {children}
  </label>
);

const RunButton = ({ loading, children }) => {
  const { t } = useI18n();
  return (
    <button
      type="submit"
      disabled={loading}
      className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-white bg-[#e62b1e] hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {loading ? t('economy.calculating') : children}
    </button>
  );
};

const Notice = ({ kind, children }) => (
  <div
    className={`rounded-xl px-4 py-3 text-sm border ${
      kind === 'err'
        ? 'bg-red-950/20 border-red-500/30 text-red-300'
        : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
    }`}
  >
    {children}
  </div>
);

// A text input backed by the item index (native datalist autocomplete).
const ItemInput = ({ guildId, value, onChange, placeholder }) => {
  const { t } = useI18n();
  const [options, setOptions] = useState([]);
  const timer = useRef(null);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const res = await apiFetch(`/guilds/${guildId}/economy/items?q=${encodeURIComponent(value || '')}`);
        setOptions(res.items || []);
      } catch {
        setOptions([]);
      }
    }, 250);
    return () => clearTimeout(timer.current);
  }, [guildId, value]);

  return (
    <>
      <input
        type="text"
        list="economy-items"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || t('economy.trade.itemPlaceholder')}
        className={inputCls}
      />
      <datalist id="economy-items">
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </datalist>
    </>
  );
};

// ---------- Crafting tax ----------
function TaxTab({ guildId }) {
  const { t, silver } = useI18n();
  const [itemValue, setItemValue] = useState('');
  const [stationFee, setStationFee] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await apiFetch(`/guilds/${guildId}/economy/tax`, {
        method: 'POST',
        body: JSON.stringify({ itemValue: Number(itemValue), stationFee: Number(stationFee) }),
      });
      setResult(res.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={run} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-5">
        <h3 className="text-white font-bold uppercase tracking-widest">{t('economy.tax.title')}</h3>
        <p className="text-gray-500 text-sm">{t('economy.tax.formula')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t('economy.tax.itemValue')}>
            <input type="number" value={itemValue} onChange={(e) => setItemValue(e.target.value)} placeholder={t('economy.tax.itemValuePlaceholder')} className={inputCls} />
          </Field>
          <Field label={t('economy.tax.stationFeePct')}>
            <input type="number" value={stationFee} onChange={(e) => setStationFee(e.target.value)} placeholder={t('economy.tax.stationFeePlaceholder')} className={inputCls} />
          </Field>
        </div>
        <RunButton loading={loading}>{t('economy.tax.run')}</RunButton>
      </form>

      {error && <Notice kind="err">{error}</Notice>}
      {result && (
        <Card>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{t('economy.tax.due')}</p>
          <p className="text-white text-3xl font-black tabular-nums">{silver(result.taxCost)}</p>
          <p className="text-gray-600 text-xs">{t('economy.tax.result', { value: silver(result.itemValue), fee: result.stationFee })}</p>
        </Card>
      )}
    </div>
  );
}

// ---------- Laborer journals ----------
function LaborerTab({ guildId }) {
  const { t, silver } = useI18n();
  const [empty, setEmpty] = useState('');
  const [full, setFull] = useState('');
  const [resources, setResources] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await apiFetch(`/guilds/${guildId}/economy/laborer`, {
        method: 'POST',
        body: JSON.stringify({ empty: Number(empty), full: Number(full), resources: Number(resources) }),
      });
      setResult(res.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const rows = result
    ? [
        { label: t('economy.laborer.r1'), value: result.profitSellFull },
        { label: t('economy.laborer.r2'), value: result.profitBuyFullGiveLaborer },
        { label: t('economy.laborer.r3'), value: result.profitFillAndGive },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={run} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-5">
        <h3 className="text-white font-bold uppercase tracking-widest">{t('economy.laborer.title')}</h3>
        <p className="text-gray-500 text-sm">{t('economy.laborer.hint')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label={t('economy.laborer.empty')}>
            <input type="number" value={empty} onChange={(e) => setEmpty(e.target.value)} className={inputCls} />
          </Field>
          <Field label={t('economy.laborer.full')}>
            <input type="number" value={full} onChange={(e) => setFull(e.target.value)} className={inputCls} />
          </Field>
          <Field label={t('economy.laborer.resources')}>
            <input type="number" value={resources} onChange={(e) => setResources(e.target.value)} className={inputCls} />
          </Field>
        </div>
        <RunButton loading={loading}>{t('economy.laborer.compare')}</RunButton>
      </form>

      {error && <Notice kind="err">{error}</Notice>}
      {result && (
        <Card>
          <div className="divide-y divide-white/5">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between py-3">
                <span className="text-gray-300 text-sm">{r.label}</span>
                <span className={`font-bold tabular-nums ${r.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>{silver(r.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ---------- Merchant Duck (trade) ----------
function TradeTab({ guildId }) {
  const { t, silver } = useI18n();
  const [itemName, setItemName] = useState('');
  const [fromCity, setFromCity] = useState('Caerleon');
  const [toCity, setToCity] = useState('Bridgewatch');
  const [state, setState] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setState(null);
    try {
      const res = await apiFetch(`/guilds/${guildId}/economy/trade`, {
        method: 'POST',
        body: JSON.stringify({ itemName, fromCity, toCity }),
      });
      setState(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const select = (value, onChange, exclude) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      {CITIES.filter((c) => c !== exclude).map((c) => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  );

  return (
    <div className="space-y-6">
      <form onSubmit={run} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-5">
        <h3 className="text-white font-bold uppercase tracking-widest">{t('economy.trade.title')}</h3>
        <p className="text-gray-500 text-sm">{t('economy.trade.hint')}</p>
        <Field label={t('economy.trade.item')}>
          <ItemInput guildId={guildId} value={itemName} onChange={setItemName} placeholder={t('economy.trade.itemPlaceholder')} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t('economy.trade.buyIn')}>{select(fromCity, setFromCity, toCity)}</Field>
          <Field label={t('economy.trade.sellIn')}>{select(toCity, setToCity, fromCity)}</Field>
        </div>
        <RunButton loading={loading}>{t('economy.trade.run')}</RunButton>
      </form>

      {error && <Notice kind="err">{error}</Notice>}
      {state && !state.found && <Notice>{t('economy.trade.noPrices', { item: state.item })}</Notice>}
      {state?.found && (
        <Card>
          <div className="flex items-center gap-4">
            <img src={state.itemImage} alt="" className="w-12 h-12 rounded-lg border border-white/10 bg-black/40"
              onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <div>
              <p className="text-white font-bold">{state.item}</p>
              <p className="text-gray-500 text-sm">{state.fromCity} → {state.toCity}</p>
            </div>
            <span className={`ms-auto text-lg font-black ${state.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {state.profit > 0 ? '+' : ''}{silver(state.profit)} ({state.profitPercentage}%)
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
            <div><p className="text-gray-500 text-xs uppercase tracking-widest">{t('economy.trade.buy')}</p><p className="text-white font-bold tabular-nums">{number.format(state.buyPrice)}</p></div>
            <div><p className="text-gray-500 text-xs uppercase tracking-widest">{t('economy.trade.sell')}</p><p className="text-white font-bold tabular-nums">{number.format(state.sellPrice)}</p></div>
            <div><p className="text-gray-500 text-xs uppercase tracking-widest">{t('economy.trade.net')}</p><p className="text-white font-bold tabular-nums">{number.format(state.netSellPrice)}</p></div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ---------- Market chart ----------
function ChartTab({ guildId }) {
  const { t } = useI18n();
  const [item, setItem] = useState('');
  const [days, setDays] = useState('7');
  const [state, setState] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setState(null);
    try {
      const res = await apiFetch(`/guilds/${guildId}/economy/market-chart?item=${encodeURIComponent(item)}&days=${encodeURIComponent(days)}`);
      setState(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={run} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-5">
        <h3 className="text-white font-bold uppercase tracking-widest">{t('economy.chart.title')}</h3>
        <p className="text-gray-500 text-sm">{t('economy.chart.hint')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-4">
          <Field label={t('economy.trade.item')}>
            <ItemInput guildId={guildId} value={item} onChange={setItem} placeholder={t('economy.chart.itemPlaceholder')} />
          </Field>
          <Field label={t('economy.chart.days')}>
            <input type="number" min="1" max="30" value={days} onChange={(e) => setDays(e.target.value)} className={inputCls} />
          </Field>
        </div>
        <RunButton loading={loading}>{t('economy.chart.run')}</RunButton>
      </form>

      {error && <Notice kind="err">{error}</Notice>}
      {state && !state.found && <Notice>{t('economy.chart.noHistory', { item: state.item?.name || state.item?.id })}</Notice>}
      {state?.found && (
        <Card>
          <p className="text-white font-bold">{state.item.name} <span className="text-gray-500 text-sm">({state.item.id})</span></p>
          <img src={state.chartUrl} alt="Price chart" className="w-full rounded-xl border border-white/10 bg-white" />
        </Card>
      )}
    </div>
  );
}

// ---------- Refining ----------
function RefiningTab({ guildId }) {
  const { t, silver } = useI18n();
  const refiningResources = [
    { value: 'wood', label: t('economy.refining.resourceWood') },
    { value: 'ore', label: t('economy.refining.resourceOre') },
    { value: 'hide', label: t('economy.refining.resourceHide') },
    { value: 'fiber', label: t('economy.refining.resourceFiber') },
    { value: 'rock', label: t('economy.refining.resourceRock') },
  ];
  const [form, setForm] = useState({ resource: 'wood', tier: '8', amount: '1', city: 'Fort Sterling', stationFee: '10', marketTax: '4', focus: false });
  const [state, setState] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const run = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setState(null);
    try {
      const res = await apiFetch(`/guilds/${guildId}/economy/refining`, {
        method: 'POST',
        body: JSON.stringify({
          resource: form.resource,
          tier: Number(form.tier),
          amount: Number(form.amount),
          city: form.city,
          stationFee: Number(form.stationFee),
          marketTax: Number(form.marketTax),
          focus: form.focus,
        }),
      });
      setState(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const r = state?.found ? state : null;
  const margin = r && r.totalRevenue > 0 ? ((r.net / r.totalRevenue) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      <form onSubmit={run} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-5">
        <h3 className="text-white font-bold uppercase tracking-widest">{t('economy.refining.title')}</h3>
        <p className="text-gray-500 text-sm">{t('economy.refining.hint')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label={t('economy.refining.resource')}>
            <select value={form.resource} onChange={(e) => set('resource', e.target.value)} className={inputCls}>
              {refiningResources.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
          <Field label={t('economy.refining.tier')}>
            <select value={form.tier} onChange={(e) => set('tier', e.target.value)} className={inputCls}>
              {[2, 3, 4, 5, 6, 7, 8].map((tier) => (
                <option key={tier} value={tier}>T{tier}</option>
              ))}
            </select>
          </Field>
          <Field label={t('economy.refining.amount')}>
            <input type="number" value={form.amount} onChange={(e) => set('amount', e.target.value)} className={inputCls} />
          </Field>
          <Field label={t('economy.refining.city')}>
            <select value={form.city} onChange={(e) => set('city', e.target.value)} className={inputCls}>
              {CITIES.slice(0, 6).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label={t('economy.refining.stationFee')}>
            <input type="number" value={form.stationFee} onChange={(e) => set('stationFee', e.target.value)} className={inputCls} />
          </Field>
          <Field label={t('economy.refining.marketTax')}>
            <input type="number" value={form.marketTax} onChange={(e) => set('marketTax', e.target.value)} className={inputCls} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" checked={form.focus} onChange={(e) => set('focus', e.target.checked)} className="accent-[#e62b1e]" />
          {t('economy.refining.focus')}
        </label>
        <RunButton loading={loading}>{t('economy.refining.run')}</RunButton>
      </form>

      {error && <Notice kind="err">{error}</Notice>}
      {state && !state.found && <Notice>{t('economy.refining.noPrices', { city: state.city })}</Notice>}
      {r && (
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-white font-bold">{r.raw} → {r.refined} · T{r.tier}</p>
            <span className="text-gray-500 text-xs uppercase tracking-widest">{r.city === r.specialtyCity ? t('economy.refining.specialty', { city: r.city }) : r.city}</span>
            <span className={`ms-auto text-lg font-black ${r.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {r.net >= 0 ? '+' : ''}{silver(r.net)}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
            <div><p className="text-gray-500 text-xs uppercase tracking-widest">{t('economy.refining.rrr')}</p><p className="text-white font-bold tabular-nums">{(r.rrr * 100).toFixed(2)}%</p></div>
            <div><p className="text-gray-500 text-xs uppercase tracking-widest">{t('economy.refining.totalCost')}</p><p className="text-white font-bold tabular-nums">{number.format(Math.round(r.totalCost))}</p></div>
            <div><p className="text-gray-500 text-xs uppercase tracking-widest">{t('economy.refining.revenue')}</p><p className="text-white font-bold tabular-nums">{number.format(Math.round(r.totalRevenue))}</p></div>
            <div><p className="text-gray-500 text-xs uppercase tracking-widest">{t('economy.refining.margin')}</p><p className="text-white font-bold tabular-nums">{margin}%</p></div>
          </div>
          <p className="text-gray-600 text-xs">
            {t('economy.refining.detail', { raw: r.raw, rawPrice: number.format(Math.round(r.rawPrice)), refined: r.refined, refinedPrice: number.format(Math.round(r.refinedPrice)), net: silver(r.netPerUnit) })}
          </p>
        </Card>
      )}
    </div>
  );
}

// ---------- Chest audit ----------
function ChestTab({ guildId }) {
  const { t } = useI18n();
  const [log, setLog] = useState('');
  const [state, setState] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setState(null);
    try {
      const res = await apiFetch(`/guilds/${guildId}/economy/chest`, {
        method: 'POST',
        body: JSON.stringify({ log }),
      });
      setState(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={run} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-5">
        <h3 className="text-white font-bold uppercase tracking-widest">{t('economy.chest.title')}</h3>
        <p className="text-gray-500 text-sm">{t('economy.chest.hint')}</p>
        <textarea
          value={log}
          onChange={(e) => setLog(e.target.value)}
          rows={10}
          placeholder={'"2026-01-01 12:00:00" "Player" "T8_LEATHER" "0" "1" "10"'}
          className={`${inputCls} font-mono text-xs resize-y`}
        />
        <RunButton loading={loading}>{t('economy.chest.run')}</RunButton>
      </form>

      {error && <Notice kind="err">{error}</Notice>}
      {state && !state.found && <Notice>{t('economy.chest.noLines')}</Notice>}
      {state?.found && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {state.players.map((p) => (
            <div key={p.name} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 space-y-3">
              <p className="text-white font-bold">{p.name}</p>
              {p.deposits.length > 0 && (
                <div>
                  <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-1">{t('economy.chest.deposits')}</p>
                  <ul className="text-gray-300 text-sm space-y-0.5">{p.deposits.map((d, i) => <li key={i}>📥 {d}</li>)}</ul>
                </div>
              )}
              {p.withdrawals.length > 0 && (
                <div>
                  <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">{t('economy.chest.withdrawals')}</p>
                  <ul className="text-gray-300 text-sm space-y-0.5">{p.withdrawals.map((w, i) => <li key={i}>📤 {w}</li>)}</ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const TAB_COMPONENTS = [
  { key: 'tax', tabKey: 'economy.tabTax', Component: TaxTab },
  { key: 'laborer', tabKey: 'economy.tabLaborer', Component: LaborerTab },
  { key: 'trade', tabKey: 'economy.tabTrade', Component: TradeTab },
  { key: 'chart', tabKey: 'economy.tabChart', Component: ChartTab },
  { key: 'refining', tabKey: 'economy.tabRefining', Component: RefiningTab },
  { key: 'chest', tabKey: 'economy.tabChest', Component: ChestTab },
];

const Economy = ({ guild }) => {
  const { t } = useI18n();
  const [tab, setTab] = useState('tax');
  const Active = TAB_COMPONENTS.find((tc) => tc.key === tab)?.Component || TaxTab;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white font-black uppercase tracking-tighter text-2xl lg:text-3xl">{t('economy.title')}</h1>
        <p className="text-gray-500 text-sm">
          {t('economy.subtitle', { guild: guild.name })}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TAB_COMPONENTS.map((tc) => (
          <button
            key={tc.key}
            onClick={() => setTab(tc.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors border ${
              tab === tc.key
                ? 'bg-red-950/40 border-[#e62b1e] text-white'
                : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t(tc.tabKey)}
          </button>
        ))}
      </div>

      <Active guildId={guild.id} />
    </div>
  );
};

export default Economy;
