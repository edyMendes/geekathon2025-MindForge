import { Cpu, Save, Folder } from "lucide-react";
import { useState } from "react";
import { preciseFeedAmount, optimalFeedingTimes } from "../utils/calculate.js";
import { saveProfile, loadProfile, listProfiles } from "../hooks/useSettings.js";

export default function ChickenForm({ onCalculated, onLoaded }) {
  const [form, setForm] = useState({
    breed: "",
    age: "",
    weight: "",
    quantity: "",
    health: "healthy",
    environment: "free_range",
    season: "summer",
    eggPurpose: "consumption",
    stressLevel: "low",
    feedType: "commercial",
    feedBrand: "",
    feedCost: 0.8,
    eggPrice: 0,
    molting: "no",
    lightHours: 14,
    vaccination: "none",
  });

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const calc = (e) => {
    e.preventDefault();
    const { breed, age, weight, quantity, health, environment, season, eggPurpose, stressLevel, feedType, feedBrand, feedCost, molting, lightHours, vaccination, eggPrice } = form;

    const iAge = parseInt(age), iQty = parseInt(quantity), fW = parseFloat(weight);
    if (!iAge || !iQty || !fW) return alert("Preencha idade, peso e quantidade com valores válidos.");

    const gPerChicken = preciseFeedAmount(breed, iAge, fW, health, environment, season, stressLevel, lightHours, molting);
    const totalKg = (gPerChicken * iQty) / 1000;

    const times = optimalFeedingTimes(iAge, season, environment, lightHours, health, stressLevel);

    onCalculated({
      form,
      perChicken: gPerChicken,
      totalKg,
      times,
    });
  };

  const save = () => {
    const { age, weight, quantity } = form;
    if (!parseInt(age) || !parseInt(quantity) || !parseFloat(weight)) return alert("Preencha idade, peso e quantidade com valores válidos.");
    const name = prompt("Nome do grupo:");
    if (!name) return;
    saveProfile(name, { ...form, age: +form.age, weight: +form.weight, quantity: +form.quantity });
    onLoaded?.(name);
    alert("Perfil salvo!");
  };

  const load = () => {
    const profiles = listProfiles();
    if (!profiles.length) return alert("Sem perfis.");
    const name = prompt("Perfis:\n" + profiles.join("\n") + "\n\nIndica o nome a carregar:");
    if (!name || !profiles.includes(name)) return;
    const data = loadProfile(name);
    setForm(data);
    onLoaded?.(name);
    alert("Perfil carregado.");
  };

  return (
    <div className="card shadow-sm p-6 card-hover" data-aos="fade-right">
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center">
        Dados das Galinhas
      </h2>

      <form onSubmit={calc} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Raça</label>
            <select value={form.breed} onChange={(e) => set("breed", e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
              <option value="">Selecione</option>
              <option value="rhode_island">Rhode Island Red</option>
              <option value="leghorn">Leghorn Branca</option>
              <option value="sussex">Sussex</option>
              <option value="orpington">Orpington</option>
              <option value="plymouth">Plymouth Rock</option>
              <option value="outra">Outra</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Idade (semanas)</label>
            <input value={form.age} onChange={(e)=>set("age", e.target.value)} type="number" min="0" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400" placeholder="Ex: 20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Peso médio (kg)</label>
            <input value={form.weight} onChange={(e)=>set("weight", e.target.value)} type="number" step="0.01" min="0" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400" placeholder="Ex: 2.50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantidade</label>
            <input value={form.quantity} onChange={(e)=>set("quantity", e.target.value)} type="number" min="1" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400" placeholder="Ex: 50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Saúde</label>
            <select value={form.health} onChange={(e)=>set("health", e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
              <option value="healthy">Saudáveis</option>
              <option value="respiratory">Problemas respiratórios</option>
              <option value="digestive">Problemas digestivos</option>
              <option value="parasites">Parasitas internos</option>
              <option value="other">Outros</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ambiente</label>
            <select value={form.environment} onChange={(e)=>set("environment", e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
              <option value="free_range">Livre</option>
              <option value="barn">Galpão</option>
              <option value="battery">Gaiola</option>
              <option value="organic">Orgânico</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estação</label>
            <select value={form.season} onChange={(e)=>set("season", e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
              <option value="summer">Verão</option>
              <option value="winter">Inverno</option>
              <option value="spring">Primavera</option>
              <option value="autumn">Outono</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Luz diária (h)</label>
            <input value={form.lightHours} onChange={(e)=>set("lightHours", +e.target.value)} type="number" min="0" max="24" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 pt-2">
          <button className="btn-primary w-full py-3 rounded-lg inline-flex items-center justify-center">
            <Cpu className="mr-2" size={18}/> Calcular Recomendações
          </button>
          <button type="button" onClick={save} className="btn-sec w-full py-3 rounded-lg inline-flex items-center justify-center">
            <Save className="mr-2" size={18}/> Salvar Perfil
          </button>
          <button type="button" onClick={load} className="btn-sec w-full py-3 rounded-lg inline-flex items-center justify-center">
            <Folder className="mr-2" size={18}/> Carregar Perfil
          </button>
        </div>
      </form>
    </div>
  );
}
