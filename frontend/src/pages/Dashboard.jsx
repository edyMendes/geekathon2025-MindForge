import { useEffect, useRef, useState } from "react";
import { listProfiles, loadProfile, removeProfile, saveProfile, addHistory, getHistory } from "../hooks/useSettings.js";
import ChickenForm from "../components/ChickenForm.jsx";
import Recommendations from "../components/Recommendations.jsx";
import WeeklyCalendar from "../components/WeeklyCalendar.jsx";
import { preciseFeedAmount } from "../utils/calculate.js";
import { TrendingUp } from "lucide-react";
import Chart from "chart.js/auto";

export default function Dashboard() {
  const [currentGroup, setCurrentGroup] = useState(null);
  const [model, setModel] = useState(null);
  const [rows, setRows] = useState([]);
  const [selectedProfileData, setSelectedProfileData] = useState(null);

  // tracking inputs
  const dateRef = useRef(); const weightRef = useRef(); const eggsRef = useRef(); const feedRef = useRef();

  // charts refs
  const wCanvas = useRef(); const eCanvas = useRef();
  const wChartRef = useRef(null); const eChartRef = useRef(null);

  const refreshGroups = async () => {
    try {
      const profiles = await listProfiles();
      if (!Array.isArray(profiles)) {
        console.warn('Profiles is not an array:', profiles);
        setRows([]);
        return;
      }
      
      const mapped = await Promise.all(profiles.map(async (name) => {
        try {
          const g = await loadProfile(name);
          if (!g) return null;
          const amt = preciseFeedAmount(g.breed, +g.age, +g.weight, g.environment, g.season, g.stressLevel, g.molting, g.purpose || "eggs");
          const totalKg = (amt * (+g.quantity || 0)) / 1000;
          const costDay = totalKg * (+g.feedCost || 0);
          const laying = (+g.age >= 18) ? `≈ ${Math.max(30, 80 - (+g.age - 18) + (g.breed === "leghorn" ? 10 : 0))}%` : "—";
          return { name, g, totalKg, costDay, laying };
        } catch (profileError) {
          console.error(`Error loading profile ${name}:`, profileError);
          return null;
        }
      }));
      setRows(mapped.filter(row => row !== null));
    } catch (error) {
      console.error('Error refreshing groups:', error);
      // If user is not logged in, show empty state
      if (error.message && error.message.includes("User must be logged in")) {
        setRows([]);
      } else {
        // For other errors, show empty state and log the error
        setRows([]);
        console.error('Unexpected error refreshing groups:', error);
      }
    }
  };

  useEffect(() => { refreshGroups(); }, []);

  const onCalculated = (m) => setModel(m);
  const onLoaded = (name) => { setCurrentGroup(name); refreshGroups(); };

  const openGroup = async (name) => {
    try {
      const g = await loadProfile(name);
      if (!g) {
        console.warn('Profile not found:', name);
        return;
      }
      setCurrentGroup(name);
      setSelectedProfileData(g);
      // monta um modelo mínimo p/ Recommendations (sem recomputar tudo do zero, mas poderia)
      setModel(null); // esvazia e espera pelo submit do form (o form carrega dados)
      setTimeout(()=>{},0);
    } catch (error) {
      console.error('Error opening group:', error);
      alert('Error loading profile. Please try again.');
    }
  };

  const duplicateGroup = async (name) => {
    try {
      const g = await loadProfile(name); 
      if (!g) return;
      const newName = prompt(`New group name (copy of ${name}):`, `${name}-copy`);
      if (!newName) return;
      await saveProfile(newName, g);
      refreshGroups();
      alert("Group duplicated.");
    } catch (error) {
      console.error('Error duplicating group:', error);
      alert("Error duplicating group. Please try again.");
    }
  };

  const archiveGroup = async (name) => {
    if (!confirm(`Archive/remove group "${name}"?`)) return;
    try {
      await removeProfile(name);
      refreshGroups();
    } catch (error) {
      console.error('Error removing group:', error);
      alert("Error removing group. Please try again.");
    }
  };

  // charts render
  const renderCharts = () => {
    if (!currentGroup) return;
    const hist = getHistory(currentGroup);
    const labels = hist.map((h) => h.date);
    const weights = hist.map((h) => +h.weight || null);
    const eggs = hist.map((h) => +h.eggs || 0);
    const feed = hist.map((h) => +h.feed || 0);
    const fcrPerEgg = hist.map((h) => (h.eggs > 0 ? (h.feed / h.eggs).toFixed(3) : null));

    if (wChartRef.current) wChartRef.current.destroy();
    if (eChartRef.current) eChartRef.current.destroy();

    wChartRef.current = new Chart(wCanvas.current.getContext("2d"), {
      type: "line",
      data: { labels, datasets: [{ label: "Average weight (kg)", data: weights, tension: 0.3, fill: false }] },
      options: { responsive: true, maintainAspectRatio: false },
    });

    eChartRef.current = new Chart(eCanvas.current.getContext("2d"), {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "Eggs/day", data: eggs, tension: 0.3 },
          { label: "Feed (kg)", data: feed, tension: 0.3 },
          { label: "Ração/ovo (kg)", data: fcrPerEgg, tension: 0.3 },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false },
    });
  };

  useEffect(() => { renderCharts(); }, [currentGroup]);

  const addRecord = () => {
    const date = dateRef.current.value || new Date().toISOString().slice(0, 10);
    const weight = parseFloat(weightRef.current.value);
    const eggs = parseInt(eggsRef.current.value);
    const feed = parseFloat(feedRef.current.value);
    const group = currentGroup || prompt("Register in which group?");

    if (!group) return;
    if (!weight || weight <= 0) return alert("Invalid weight.");
    addHistory(group, { date, weight, eggs: isNaN(eggs) ? 0 : eggs, feed: isNaN(feed) ? 0 : feed });
    setCurrentGroup(group); // garante refresh
    renderCharts();
    alert("Record added.");
  };

  const exportCSV = () => {
    const group = currentGroup || prompt("Export from which group?");
    if (!group) return;
    const hist = getHistory(group);
    if (!hist.length) return alert("No records.");
    const rows = [["date", "weight_kg", "eggs", "feed_kg", "feed_per_egg_kg"]];
    hist.forEach((h) => rows.push([h.date, h.weight, h.eggs, h.feed, h.eggs > 0 ? (h.feed / h.eggs).toFixed(3) : ""]));
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `report_${group}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChickenForm 
          onCalculated={onCalculated} 
          onLoaded={(n)=>{ setCurrentGroup(n); }} 
          loadProfileData={selectedProfileData}
        />
        <Recommendations model={model} />
      </div>

      {/* Weekly Calendar */}
      <div className="mt-12">
        <WeeklyCalendar model={model} />
      </div>

      {/* DASHBOARD GRUPOS */}
      <div className="mt-12 card shadow-sm p-6" data-aos="fade-up">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
          Active Groups
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-500 dark:text-slate-400 border-b dark:border-slate-600">
              <tr>
                <th className="py-2">Group</th>
                <th className="py-2">Birds</th>
                <th className="py-2">Weight</th>
                <th className="py-2">Feed/day</th>
                <th className="py-2">Cost/day</th>
                <th className="py-2">Laying</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan="7" className="py-6 text-center text-slate-400 dark:text-slate-500">
                  No active groups found. Please log in and save a chicken profile to see your groups here.
                </td></tr>
              )}
              {rows.map((r) => (
                <tr key={r.name} className="border-b dark:border-slate-600">
                  <td className="py-2 font-medium text-slate-900 dark:text-slate-100">{r.name}</td>
                  <td className="text-slate-700 dark:text-slate-300">{r.g.quantity || "—"}</td>
                  <td className="text-slate-700 dark:text-slate-300">{(+r.g.weight || 0).toFixed(2)} kg</td>
                  <td className="text-slate-700 dark:text-slate-300">{r.totalKg.toFixed(2)} kg</td>
                  <td className="text-slate-700 dark:text-slate-300">{r.costDay.toFixed(2)} €</td>
                  <td className="text-slate-700 dark:text-slate-300">{r.laying}</td>
                  <td className="text-right space-x-3">
                    <button className="text-emerald-700 dark:text-emerald-400 underline hover:text-emerald-600 dark:hover:text-emerald-300" onClick={() => openGroup(r.name)}>Select</button>
                    <button className="text-rose-700 dark:text-rose-400 underline hover:text-rose-600 dark:hover:text-rose-300" onClick={() => archiveGroup(r.name)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TRACKING + CHARTS */}
      <div className="mt-12 card shadow-sm p-6" data-aos="fade-up">
        <div className="overflow-x-auto">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4 flex items-center">
            <TrendingUp className="mr-2" /> Group Records & Performance
          </h3>

          <div className="grid md:grid-cols-4 gap-3 mb-3">
            <input ref={dateRef} type="date" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" defaultValue={new Date().toISOString().slice(0,10)} />
            <input ref={weightRef} type="number" step="0.01" placeholder="Average weight (kg)" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400" />
            <input ref={eggsRef} type="number" step="1" placeholder="Eggs/day" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400" />
            <input ref={feedRef} type="number" step="0.01" placeholder="Feed consumed (kg)" className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400" />
          </div>
          <div className="flex gap-3 mb-4">
            <button onClick={addRecord} className="btn-sec px-4 py-2 rounded-lg">Add Record</button>
            <button onClick={exportCSV} className="btn-sec px-4 py-2 rounded-lg">Export CSV</button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-4 h-64">
              <h4 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">Growth Curve (kg)</h4>
              <canvas ref={wCanvas} height="180"></canvas>
            </div>
            <div className="card p-4 h-64">
              <h4 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">Production & Consumption</h4>
              <canvas ref={eCanvas} height="180"></canvas>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
