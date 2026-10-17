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

const CITIES = ['Caerleon', 'Bridgewatch', 'Fort Sterling', 'Lymhurst', 'Martlock', 'Thetford', 'Brecilien'];
const REFINING_RESOURCES = [
  { value: 'wood', label: '🌳 Wood → Planks' },
  { value: 'ore', label: '⛏️ Ore → Metal Bars' },
  { value: 'hide', label: '🐄 Hide → Leather' },
  { value: 'fiber', label: '🌿 Fiber → Cloth' },
  { value: 'rock', label: '🪨 Rock → Stone Blocks' },
];

const inputCls =
  'w-full bg-[#030303] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#e62b1e] transition-colors';

const silver = (v) => `${number.format(Math.round(v || 0))} silver`;

const Card = ({ children }) => (
  <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-5">{children}</div>
);

const Field = ({ label, children }) => (
  <label className="block">
    <span className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-1.5">{label}</span>
    {children}
  </label>
);

const RunButton = ({ loading, children }) => (
  <button
    type="submit"
    disabled={loading}
    className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-white bg-[#e62b1e] hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
  >
    {loading ? 'Calculating…' : children}
  </button>
);

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
        placeholder={placeholder || 'e.g. T8_LEATHER'}
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
        <h3 className="text-white font-bold uppercase tracking-widest">Crafting tax</h3>
        <p className="text-gray-500 text-sm">Silver Fee = Item Value × 0.05 × (Station Fee / 100).</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Item value">
            <input type="number" value={itemValue} onChange={(e) => setItemValue(e.target.value)} placeholder="Base item value" className={inputCls} />
          </Field>
          <Field label="Station fee %">
            <input type="number" value={stationFee} onChange={(e) => setStationFee(e.target.value)} placeholder="e.g. 500" className={inputCls} />
          </Field>
        </div>
        <RunButton loading={loading}>Calculate tax</RunButton>
      </form>

      {error && <Notice kind="err">{error}</Notice>}
      {result && (
        <Card>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Tax due</p>
          <p className="text-white text-3xl font-black tabular-nums">{silver(result.taxCost)}</p>
          <p className="text-gray-600 text-xs">on an item value of {silver(result.itemValue)} at {result.stationFee}% station fee.</p>
        </Card>
      )}
    </div>
  );
}

// ---------- Laborer journals ----------
function LaborerTab({ guildId }) {
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
        { label: 'Fill the journal, then sell it full', value: result.profitSellFull },
        { label: 'Buy a full journal, run the laborer', value: result.profitBuyFullGiveLaborer },
        { label: 'Fill it yourself, then run the laborer', value: result.profitFillAndGive },
      ]
    : [];

  return (
    <div className="space-y-6">
      <form onSubmit={run} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-5">
        <h3 className="text-white font-bold uppercase tracking-widest">Laborer journals</h3>
        <p className="text-gray-500 text-sm">Compare the three ways to profit from a laborer journal.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Empty journal price">
            <input type="number" value={empty} onChange={(e) => setEmpty(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Full journal price">
            <input type="number" value={full} onChange={(e) => setFull(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Resources value">
            <input type="number" value={resources} onChange={(e) => setResources(e.target.value)} className={inputCls} />
          </Field>
        </div>
        <RunButton loading={loading}>Compare</RunButton>
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
        <h3 className="text-white font-bold uppercase tracking-widest">Merchant Duck — cross-city trade</h3>
        <p className="text-gray-500 text-sm">Buy in one city, sell in another, net of the 6.5% market tax.</p>
        <Field label="Item (name or ID)">
          <ItemInput guildId={guildId} value={itemName} onChange={setItemName} placeholder="e.g. T8_LEATHER" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Buy in">{select(fromCity, setFromCity, toCity)}</Field>
          <Field label="Sell in">{select(toCity, setToCity, fromCity)}</Field>
        </div>
        <RunButton loading={loading}>Check profit</RunButton>
      </form>

      {error && <Notice kind="err">{error}</Notice>}
      {state && !state.found && <Notice>No prices found for {state.item} in those cities.</Notice>}
      {state?.found && (
        <Card>
          <div className="flex items-center gap-4">
            <img src={state.itemImage} alt="" className="w-12 h-12 rounded-lg border border-white/10 bg-black/40"
              onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <div>
              <p className="text-white font-bold">{state.item}</p>
              <p className="text-gray-500 text-sm">{state.fromCity} → {state.toCity}</p>
            </div>
            <span className={`ml-auto text-lg font-black ${state.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {state.profit > 0 ? '+' : ''}{silver(state.profit)} ({state.profitPercentage}%)
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
            <div><p className="text-gray-500 text-xs uppercase tracking-widest">Buy</p><p className="text-white font-bold tabular-nums">{number.format(state.buyPrice)}</p></div>
            <div><p className="text-gray-500 text-xs uppercase tracking-widest">Sell</p><p className="text-white font-bold tabular-nums">{number.format(state.sellPrice)}</p></div>
            <div><p className="text-gray-500 text-xs uppercase tracking-widest">Net (after tax)</p><p className="text-white font-bold tabular-nums">{number.format(state.netSellPrice)}</p></div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ---------- Market chart ----------
function ChartTab({ guildId }) {
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
        <h3 className="text-white font-bold uppercase tracking-widest">Market chart</h3>
        <p className="text-gray-500 text-sm">Price trend across the royal cities over the last few days.</p>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-4">
          <Field label="Item (name or ID)">
            <ItemInput guildId={guildId} value={item} onChange={setItem} placeholder="e.g. T8_WOOD" />
          </Field>
          <Field label="Days">
            <input type="number" min="1" max="30" value={days} onChange={(e) => setDays(e.target.value)} className={inputCls} />
          </Field>
        </div>
        <RunButton loading={loading}>Show chart</RunButton>
      </form>

      {error && <Notice kind="err">{error}</Notice>}
      {state && !state.found && <Notice>No price history found for {state.item?.name || state.item?.id}.</Notice>}
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
        <h3 className="text-white font-bold uppercase tracking-widest">Refining calculator</h3>
        <p className="text-gray-500 text-sm">Profit of refining raw resources, including city bonuses and station fees.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Resource">
            <select value={form.resource} onChange={(e) => set('resource', e.target.value)} className={inputCls}>
              {REFINING_RESOURCES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Tier">
            <select value={form.tier} onChange={(e) => set('tier', e.target.value)} className={inputCls}>
              {[2, 3, 4, 5, 6, 7, 8].map((t) => (
                <option key={t} value={t}>T{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Amount">
            <input type="number" value={form.amount} onChange={(e) => set('amount', e.target.value)} className={inputCls} />
          </Field>
          <Field label="City">
            <select value={form.city} onChange={(e) => set('city', e.target.value)} className={inputCls}>
              {CITIES.slice(0, 6).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Station fee %">
            <input type="number" value={form.stationFee} onChange={(e) => set('stationFee', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Market tax %">
            <input type="number" value={form.marketTax} onChange={(e) => set('marketTax', e.target.value)} className={inputCls} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" checked={form.focus} onChange={(e) => set('focus', e.target.checked)} className="accent-[#e62b1e]" />
          Use Focus (+59%)
        </label>
        <RunButton loading={loading}>Calculate</RunButton>
      </form>

      {error && <Notice kind="err">{error}</Notice>}
      {state && !state.found && <Notice>No prices found for that resource/tier in {state.city}.</Notice>}
      {r && (
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-white font-bold">{r.raw} → {r.refined} · T{r.tier}</p>
            <span className="text-gray-500 text-xs uppercase tracking-widest">{r.city}{r.city === r.specialtyCity ? ' (specialty)' : ''}</span>
            <span className={`ml-auto text-lg font-black ${r.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {r.net >= 0 ? '+' : ''}{silver(r.net)}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
            <div><p className="text-gray-500 text-xs uppercase tracking-widest">RRR</p><p className="text-white font-bold tabular-nums">{(r.rrr * 100).toFixed(2)}%</p></div>
            <div><p className="text-gray-500 text-xs uppercase tracking-widest">Total cost</p><p className="text-white font-bold tabular-nums">{number.format(Math.round(r.totalCost))}</p></div>
            <div><p className="text-gray-500 text-xs uppercase tracking-widest">Revenue</p><p className="text-white font-bold tabular-nums">{number.format(Math.round(r.totalRevenue))}</p></div>
            <div><p className="text-gray-500 text-xs uppercase tracking-widest">Margin</p><p className="text-white font-bold tabular-nums">{margin}%</p></div>
          </div>
          <p className="text-gray-600 text-xs">
            Raw {r.raw} @ {number.format(Math.round(r.rawPrice))} · Refined {r.refined} @ {number.format(Math.round(r.refinedPrice))} · per unit net {silver(r.netPerUnit)}
          </p>
        </Card>
      )}
    </div>
  );
}

// ---------- Chest audit ----------
function ChestTab({ guildId }) {
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
        <h3 className="text-white font-bold uppercase tracking-widest">Chest audit</h3>
        <p className="text-gray-500 text-sm">Paste the alliance chest log (from the game&apos;s &ldquo;Copy to clipboard&rdquo;) to see who deposited and withdrew what.</p>
        <textarea
          value={log}
          onChange={(e) => setLog(e.target.value)}
          rows={10}
          placeholder={'"2026-01-01 12:00:00" "Player" "T8_LEATHER" "0" "1" "10"'}
          className={`${inputCls} font-mono text-xs resize-y`}
        />
        <RunButton loading={loading}>Audit</RunButton>
      </form>

      {error && <Notice kind="err">{error}</Notice>}
      {state && !state.found && <Notice>No valid log lines were found.</Notice>}
      {state?.found && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {state.players.map((p) => (
            <div key={p.name} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 space-y-3">
              <p className="text-white font-bold">{p.name}</p>
              {p.deposits.length > 0 && (
                <div>
                  <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-1">Deposits</p>
                  <ul className="text-gray-300 text-sm space-y-0.5">{p.deposits.map((d, i) => <li key={i}>📥 {d}</li>)}</ul>
                </div>
              )}
              {p.withdrawals.length > 0 && (
                <div>
                  <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">Withdrawals</p>
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

const TABS = [
  { key: 'tax', label: '🏭 Crafting Tax', Component: TaxTab },
  { key: 'laborer', label: '👷 Laborers', Component: LaborerTab },
  { key: 'trade', label: '🦆 Merchant Duck', Component: TradeTab },
  { key: 'chart', label: '📈 Market Chart', Component: ChartTab },
  { key: 'refining', label: '🧪 Refining', Component: RefiningTab },
  { key: 'chest', label: '🗃️ Chest Audit', Component: ChestTab },
];

const Economy = ({ guild }) => {
  const [tab, setTab] = useState('tax');
  const Active = TABS.find((t) => t.key === tab)?.Component || TaxTab;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white font-black uppercase tracking-tighter text-2xl lg:text-3xl">Economy</h1>
        <p className="text-gray-500 text-sm">
          Market and crafting tools for <span className="text-[#e62b1e] font-bold">{guild.name}</span> — the same math as the bot&apos;s economy channel.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors border ${
              tab === t.key
                ? 'bg-red-950/40 border-[#e62b1e] text-white'
                : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Active guildId={guild.id} />
    </div>
  );
};

export default Economy;
