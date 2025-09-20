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
    environment: "free_range",
    season: "summer",
    purpose: "eggs",
    eggPurpose: "consumption",
    stressLevel: "low",
    feedType: "commercial",
    feedBrand: "",
    feedCost: 0.8,
    eggPrice: 0,
    molting: "no",
    vaccination: "none",
  });

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const calc = (e) => {
    e.preventDefault();
    const { breed, age, weight, quantity, environment, season, purpose, eggPurpose, stressLevel, feedType, feedBrand, feedCost, molting, vaccination, eggPrice } = form;

    const iAge = parseInt(age), iQty = parseInt(quantity), fW = parseFloat(weight);
    if (!iAge || !iQty || !fW) return alert("Please fill in age, weight and quantity with valid values.");

    const gPerChicken = preciseFeedAmount(breed, iAge, fW, environment, season, stressLevel, molting, purpose);
    const totalKg = (gPerChicken * iQty) / 1000;

    const times = optimalFeedingTimes(iAge, season, environment, stressLevel, purpose);

    onCalculated({
      form,
      perChicken: gPerChicken,
      totalKg,
      times,
    });
  };

  const save = () => {
    const { age, weight, quantity } = form;
    if (!parseInt(age) || !parseInt(quantity) || !parseFloat(weight)) return alert("Please fill in age, weight and quantity with valid values.");
    const name = prompt("Group name:");
    if (!name) return;
    saveProfile(name, { ...form, age: +form.age, weight: +form.weight, quantity: +form.quantity });
    onLoaded?.(name);
    alert("Profile saved!");
  };

  const load = () => {
    const profiles = listProfiles();
    if (!profiles.length) return alert("No profiles.");
    const name = prompt("Profiles:\n" + profiles.join("\n") + "\n\nEnter the name to load:");
    if (!name || !profiles.includes(name)) return;
    const data = loadProfile(name);
    setForm(data);
    onLoaded?.(name);
    alert("Profile loaded.");
  };

  return (
    <div className="card shadow-sm p-6 card-hover" data-aos="fade-right">
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center">
        Chicken Data
      </h2>

      <form onSubmit={calc} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Breed</label>
            <select value={form.breed} onChange={(e) => set("breed", e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
              <option value="">Select</option>
              <option value="rhode_island">Rhode Island Red</option>
              <option value="leghorn">White Leghorn</option>
              <option value="sussex">Sussex</option>
              <option value="orpington">Orpington</option>
              <option value="plymouth">Plymouth Rock</option>
              <option value="outra">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Age (weeks)</label>
            <input value={form.age} onChange={(e)=>set("age", e.target.value)} type="number" min="0" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400" placeholder="Ex: 20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Average weight (kg)</label>
            <input value={form.weight} onChange={(e)=>set("weight", e.target.value)} type="number" step="0.01" min="0" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400" placeholder="Ex: 2.50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
            <input value={form.quantity} onChange={(e)=>set("quantity", e.target.value)} type="number" min="1" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400" placeholder="Ex: 50" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Environment</label>
            <select value={form.environment} onChange={(e)=>set("environment", e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
              <option value="free_range">Free range</option>
              <option value="barn">Barn</option>
              <option value="battery">Battery cage</option>
              <option value="organic">Organic</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Season</label>
            <select value={form.season} onChange={(e)=>set("season", e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
              <option value="summer">Summer</option>
              <option value="winter">Winter</option>
              <option value="spring">Spring</option>
              <option value="autumn">Autumn</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Purpose</label>
            <select value={form.purpose} onChange={(e)=>set("purpose", e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
              <option value="eggs">Eggs Production</option>
              <option value="breeding">Breeding</option>
              <option value="meat">Meat Production</option>
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 pt-2">
          <button className="btn-primary w-full py-3 rounded-lg inline-flex items-center justify-center">
            <Cpu className="mr-2" size={18}/> Calculate Recommendations
          </button>
          <button type="button" onClick={save} className="btn-sec w-full py-3 rounded-lg inline-flex items-center justify-center">
            <Save className="mr-2" size={18}/> Save Profile
          </button>
          <button type="button" onClick={load} className="btn-sec w-full py-3 rounded-lg inline-flex items-center justify-center">
            <Folder className="mr-2" size={18}/> Load Profile
          </button>
        </div>
      </form>
    </div>
  );
}
