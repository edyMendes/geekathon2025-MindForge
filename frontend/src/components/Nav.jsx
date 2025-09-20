import { Layers, Settings, BarChart2 } from "lucide-react";

export default function Nav({ active, onChange }) {
  const Item = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => onChange(id)}
      className={`px-4 py-2 rounded-lg border transition-all ${
        active === id
          ? "bg-emerald-600 text-white border-emerald-600"
          : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
      }`}
    >
      <span className="inline-flex items-center gap-2">
        <Icon size={18} />
        {label}
      </span>
    </button>
  );

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <Item id="dashboard" icon={Layers} label="Grupos & Operação" />
      <Item id="config" icon={Settings} label="Ferramentas & Configuração" />
      <Item id="reports" icon={BarChart2} label="Relatórios" />
    </div>
  );
}
