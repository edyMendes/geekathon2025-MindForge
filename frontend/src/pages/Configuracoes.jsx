import { useRef, useState } from "react";
import { Percent, ShoppingCart, Cpu, Boxes } from "lucide-react";

// pequenos utilitários para modais inline
function Section({ title, icon: Icon, children }) {
  return (
    <div className="card shadow-sm p-6 card-hover" data-aos="fade-up">
      <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
        <Icon className="mr-2 text-emerald-600" /> {title}
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
    if (!name || !price || !prot) return alert("Preenche Marca, €/kg e Proteína %.");
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
    alert(`Necessidade para ${days} dias: ${(days*daily).toFixed(2)} kg\nEstoque: ${stock.toFixed(2)} kg\nFalta: ${need.toFixed(2)} kg ≈ ${bags} sacos de ${bag} kg`);
  };

  const calcDisc = () => {
    const price = parseFloat(pRef.current.value) || 0;
    const pct = parseFloat(pctRef.current.value) || 0;
    const bag = parseFloat(bRef.current.value) || 25;
    const qty = parseInt(qRef.current.value) || 1;
    const priceDisc = price * (1 - pct / 100);
    const perKg = priceDisc / bag;
    const total = priceDisc * qty;
    alert(`Preço c/ desconto: ${priceDisc.toFixed(2)} €\n€/kg: ${perKg.toFixed(3)} €\nTotal: ${total.toFixed(2)} €`);
  };

  const calcMix = () => {
    const target = parseFloat(tRef.current.value);
    const pa = parseFloat(apRef.current.value);
    const ca = parseFloat(acRef.current.value);
    const pb = parseFloat(bpRef.current.value);
    const cb = parseFloat(bcRef.current.value);
    if ([target, pa, ca, pb, cb].some((v) => isNaN(v) || v <= 0)) return alert("Preenche todos os campos > 0.");
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
      <Section title="Comparador de Rações" icon={Boxes}>
        <div className="grid md:grid-cols-3 gap-3 mb-3">
          <input ref={nameRef} className="px-3 py-2 border rounded" placeholder="Marca" />
          <input ref={priceRef} type="number" step="0.01" className="px-3 py-2 border rounded" placeholder="€ / kg" />
          <input ref={protRef} type="number" step="0.1" className="px-3 py-2 border rounded" placeholder="Proteína %" />
        </div>
        <div className="flex gap-2 mb-4">
          <button onClick={addCmp} className="btn-sec px-4 py-2 rounded">Adicionar</button>
          <button onClick={() => setCmp([])} className="btn-sec px-4 py-2 rounded">Limpar</button>
          <button onClick={() => sortBy("price")} className="btn-sec px-4 py-2 rounded">€/kg</button>
          <button onClick={() => sortBy("prot")} className="btn-sec px-4 py-2 rounded">Prot%</button>
          <button onClick={() => sortBy("score")} className="btn-sec px-4 py-2 rounded">Score</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b">
              <tr><th className="py-2">Marca</th><th>€/kg</th><th>Prot%</th><th>Score</th></tr>
            </thead>
            <tbody>
              {cmp.map((r, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2">{r.name}</td>
                  <td>{r.price.toFixed(3)}</td>
                  <td>{r.prot.toFixed(1)}</td>
                  <td>{(r.prot / r.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Otimizador de Compras" icon={ShoppingCart}>
        <div className="grid md:grid-cols-4 gap-3 mb-4">
          <input ref={dRef} type="number" min="1" className="px-3 py-2 border rounded" placeholder="Dias (ex: 30)" />
          <input ref={sRef} type="number" step="0.01" className="px-3 py-2 border rounded" placeholder="Estoque (kg)" />
          <input ref={cRef} type="number" step="0.01" className="px-3 py-2 border rounded" placeholder="Consumo/dia (kg)" />
          <input ref={bagRef} type="number" step="0.01" className="px-3 py-2 border rounded" placeholder="Saco (kg)" />
        </div>
        <button onClick={calcPurch} className="btn-sec px-4 py-2 rounded">Calcular</button>
      </Section>

      <Section title="Calculadora de Descontos" icon={Percent}>
        <div className="grid md:grid-cols-4 gap-3 mb-4">
          <input ref={pRef} type="number" step="0.01" className="px-3 py-2 border rounded" placeholder="Preço normal (€)" />
          <input ref={pctRef} type="number" step="0.1" className="px-3 py-2 border rounded" placeholder="Desconto %" />
          <input ref={bRef} type="number" step="0.01" className="px-3 py-2 border rounded" placeholder="Peso saco (kg)" />
          <input ref={qRef} type="number" step="1" className="px-3 py-2 border rounded" placeholder="Qtd sacos" />
        </div>
        <button onClick={calcDisc} className="btn-sec px-4 py-2 rounded">Calcular</button>
      </Section>

      <Section title="Misturador de Rações (2 fontes)" icon={Cpu}>
        <div className="grid md:grid-cols-5 gap-3 mb-2">
          <input ref={tRef} type="number" step="0.1" className="px-3 py-2 border rounded" placeholder="Proteína alvo %" />
          <input ref={apRef} type="number" step="0.1" className="px-3 py-2 border rounded" placeholder="A Prot%" />
          <input ref={acRef} type="number" step="0.01" className="px-3 py-2 border rounded" placeholder="A €/kg" />
          <input ref={bpRef} type="number" step="0.1" className="px-3 py-2 border rounded" placeholder="B Prot%" />
          <input ref={bcRef} type="number" step="0.01" className="px-3 py-2 border rounded" placeholder="B €/kg" />
        </div>
        <button onClick={calcMix} className="btn-sec px-4 py-2 rounded mb-2">Calcular mistura ótima</button>
        {mxOut === null ? null : mxOut ? (
          <div className="p-3 bg-emerald-50 rounded text-sm">
            Mistura: <b>{mxOut.a}%</b> A + <b>{mxOut.b}%</b> B • Prot <b>{mxOut.prot.toFixed(2)}%</b> • Custo <b>{mxOut.cost.toFixed(3)} €/kg</b>
          </div>
        ) : (
          <div className="p-3 bg-rose-50 rounded text-sm">Sem combinação ±0.2%.</div>
        )}
      </Section>
    </div>
  );
}
