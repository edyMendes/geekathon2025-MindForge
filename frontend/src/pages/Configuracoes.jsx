import { useRef, useState } from "react";
import { Percent, ShoppingCart, Cpu, Boxes } from "lucide-react";

// pequenos utilitários para modais inline
function Section({ title, icon: Icon, children }) {
  return (
    <div className="card shadow-sm p-6 card-hover" data-aos="fade-up">
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
        <Icon className="mr-2 text-emerald-600 dark:text-emerald-400" /> {title}
      </h3>
      {children}
    </div>
  );
}

export default function Configuracoes() {
  // Comparador
  const [cmp, setCmp] = useState([]);
  const nameRef = useRef(); const priceRef = useRef(); const protRef = useRef();

  // Otimizador compras
  const dRef = useRef(); const sRef = useRef(); const cRef = useRef(); const bagRef = useRef();

  // Descontos
  const pRef = useRef(); const pctRef = useRef(); const bRef = useRef(); const qRef = useRef();

  // Misturador
  const tRef = useRef(); const apRef = useRef(); const acRef = useRef(); const bpRef = useRef(); const bcRef = useRef();
  const [mxOut, setMxOut] = useState(null);

  const addCmp = () => {
    const name = nameRef.current.value.trim();
    const price = parseFloat(priceRef.current.value);
    const prot = parseFloat(protRef.current.value);
    if (!name || !price || !prot) return alert("Fill Brand, €/kg and Protein %.");
    setCmp((s) => [...s, { name, price, prot }]);
  };

  const sortBy = (k) => {
    setCmp((s) => [...s].sort((a, b) => k === "score" ? (b.prot / b.price) - (a.prot / a.price) : (k === "price" ? a.price - b.price : b.prot - a.prot)));
  };

  const calcPurch = () => {
    const days = parseInt(dRef.current.value) || 30;
    const stock = parseFloat(sRef.current.value) || 0;
    const daily = parseFloat(cRef.current.value) || 0;
    const bag = parseFloat(bagRef.current.value) || 25;
    const need = Math.max(0, days * daily - stock);
    const bags = Math.ceil(need / bag);
    alert(`Need for ${days} days: ${(days*daily).toFixed(2)} kg\nStock: ${stock.toFixed(2)} kg\nShortage: ${need.toFixed(2)} kg ≈ ${bags} bags of ${bag} kg`);
  };

  const calcDisc = () => {
    const price = parseFloat(pRef.current.value) || 0;
    const pct = parseFloat(pctRef.current.value) || 0;
    const bag = parseFloat(bRef.current.value) || 25;
    const qty = parseInt(qRef.current.value) || 1;
    const priceDisc = price * (1 - pct / 100);
    const perKg = priceDisc / bag;
    const total = priceDisc * qty;
    alert(`Price with discount: ${priceDisc.toFixed(2)} €\n€/kg: ${perKg.toFixed(3)} €\nTotal: ${total.toFixed(2)} €`);
  };

  const calcMix = () => {
    const target = parseFloat(tRef.current.value);
    const pa = parseFloat(apRef.current.value);
    const ca = parseFloat(acRef.current.value);
    const pb = parseFloat(bpRef.current.value);
    const cb = parseFloat(bcRef.current.value);
    if ([target, pa, ca, pb, cb].some((v) => isNaN(v) || v <= 0)) return alert("Fill all fields > 0.");
    let best = null;
    for (let a = 0; a <= 100; a++) {
      const b = 100 - a;
      const prot = (a * pa + b * pb) / 100;
      if (Math.abs(prot - target) <= 0.2) {
        const cost = (a * ca + b * cb) / 100;
        if (!best || cost < best.cost) best = { a, b, cost, prot };
      }
    }
    setMxOut(best);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      <Section title="Feed Comparator" icon={Boxes}>
        <div className="grid md:grid-cols-3 gap-3 mb-3">
          <input ref={nameRef} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400" placeholder="Brand" />
          <input ref={priceRef} type="number" step="0.01" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400" placeholder="€ / kg" />
          <input ref={protRef} type="number" step="0.1" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400" placeholder="Protein %" />
        </div>
        <div className="flex gap-2 mb-4">
          <button onClick={addCmp} className="btn-sec px-4 py-2 rounded">Add</button>
          <button onClick={() => setCmp([])} className="btn-sec px-4 py-2 rounded">Clear</button>
          <button onClick={() => sortBy("price")} className="btn-sec px-4 py-2 rounded">€/kg</button>
          <button onClick={() => sortBy("prot")} className="btn-sec px-4 py-2 rounded">Protein%</button>
          <button onClick={() => sortBy("score")} className="btn-sec px-4 py-2 rounded">Score</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b dark:border-slate-600">
              <tr><th className="py-2 text-slate-700 dark:text-slate-300">Brand</th><th className="text-slate-700 dark:text-slate-300">€/kg</th><th className="text-slate-700 dark:text-slate-300">Protein%</th><th className="text-slate-700 dark:text-slate-300">Score</th></tr>
            </thead>
            <tbody>
              {cmp.map((r, i) => (
                <tr key={i} className="border-b dark:border-slate-600">
                  <td className="py-2 text-slate-900 dark:text-slate-100">{r.name}</td>
                  <td className="text-slate-700 dark:text-slate-300">{r.price.toFixed(3)}</td>
                  <td className="text-slate-700 dark:text-slate-300">{r.prot.toFixed(1)}</td>
                  <td className="text-slate-700 dark:text-slate-300">{(r.prot / r.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Purchase Optimizer" icon={ShoppingCart}>
        <div className="grid md:grid-cols-4 gap-3 mb-4">
          <input ref={dRef} type="number" min="1" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400" placeholder="Days (ex: 30)" />
          <input ref={sRef} type="number" step="0.01" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400" placeholder="Stock (kg)" />
          <input ref={cRef} type="number" step="0.01" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400" placeholder="Consumption/day (kg)" />
          <input ref={bagRef} type="number" step="0.01" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400" placeholder="Bag (kg)" />
        </div>
        <button onClick={calcPurch} className="btn-sec px-4 py-2 rounded">Calculate</button>
      </Section>

      <Section title="Discount Calculator" icon={Percent}>
        <div className="grid md:grid-cols-4 gap-3 mb-4">
          <input ref={pRef} type="number" step="0.01" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400" placeholder="Normal price (€)" />
          <input ref={pctRef} type="number" step="0.1" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400" placeholder="Discount %" />
          <input ref={bRef} type="number" step="0.01" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400" placeholder="Bag weight (kg)" />
          <input ref={qRef} type="number" step="1" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400" placeholder="Qtd bags" />
        </div>
          <button onClick={calcDisc} className="btn-sec px-4 py-2 rounded">Calculate</button>
      </Section>

      <Section title="Feed Mixer (2 sources)" icon={Cpu}>
        <div className="grid md:grid-cols-5 gap-3 mb-2">
            <input ref={tRef} type="number" step="0.1" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400" placeholder="Target Protein %" />
          <input ref={apRef} type="number" step="0.1" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400" placeholder="A Protein%" />
          <input ref={acRef} type="number" step="0.01" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400" placeholder="A €/kg" />
          <input ref={bpRef} type="number" step="0.1" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400" placeholder="B Protein%" />
          <input ref={bcRef} type="number" step="0.01" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400" placeholder="B €/kg" /> 
        </div>
        <button onClick={calcMix} className="btn-sec px-4 py-2 rounded mb-2">Calculate optimal mix</button>
        {mxOut === null ? null : mxOut ? (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded text-sm text-slate-800 dark:text-slate-200">
            Mix: <b>{mxOut.a}%</b> A + <b>{mxOut.b}%</b> B • Prot <b>{mxOut.prot.toFixed(2)}%</b> • Cost <b>{mxOut.cost.toFixed(3)} €/kg</b>
          </div>
        ) : (
          <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded text-sm text-slate-800 dark:text-slate-200">No combination ±0.2%.</div>
        )}
      </Section>
    </div>
  );
}
