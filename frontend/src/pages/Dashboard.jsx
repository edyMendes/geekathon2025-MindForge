import { useEffect, useState } from "react";
import { listProfiles, loadProfile, removeProfile, saveProfile } from "../hooks/useSettings.js";
import ChickenForm from "../components/ChickenForm.jsx";
import Recommendations from "../components/Recommendations.jsx";
import WeeklyRecipes from "../components/WeeklyRecipes.jsx";
import { preciseFeedAmount } from "../utils/calculate.js";
import { TrendingUp } from "lucide-react";
import bedrockApiService from "../services/bedrockApiService.js";

export default function Dashboard() {
  const [currentGroup, setCurrentGroup] = useState(null);
  const [model, setModel] = useState(null);
  const [rows, setRows] = useState([]);
  const [selectedProfileData, setSelectedProfileData] = useState(null);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);


  const refreshGroups = async () => {
    setIsLoadingGroups(true);
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
          return { name, g, totalKg, costDay };
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
    } finally {
      setIsLoadingGroups(false);
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


  return (
    <>
      {/* Feed Calculator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChickenForm 
          onCalculated={onCalculated} 
          onLoaded={(n)=>{ setCurrentGroup(n); }} 
          loadProfileData={selectedProfileData}
        />
        <Recommendations model={model} />
      </div>

      {/* Weekly Recipes */}
      <div className="mt-12">
        <WeeklyRecipes model={model} />
      </div>

      {/* DASHBOARD GRUPOS */}
      <div className="mt-12 card shadow-sm p-6" data-aos="fade-up">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
          <TrendingUp className="mr-2" /> Active Groups
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
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingGroups ? (
                <tr><td colSpan="6" className="py-6 text-center text-slate-400 dark:text-slate-500">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mr-2"></div>
                    Loading groups...
                  </div>
                </td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan="6" className="py-6 text-center text-slate-400 dark:text-slate-500">
                  No active groups found. Please log in and save a chicken profile to see your groups here.
                </td></tr>
              ) : (
                rows.map((r) => (
                <tr key={r.name} className={`border-b dark:border-slate-600 ${currentGroup === r.name ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}>
                  <td className="py-2 font-medium text-slate-900 dark:text-slate-100">
                    {r.name}
                    {currentGroup === r.name && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="text-slate-700 dark:text-slate-300">{r.g.quantity || "—"}</td>
                  <td className="text-slate-700 dark:text-slate-300">{(+r.g.weight || 0).toFixed(2)} kg</td>
                  <td className="text-slate-700 dark:text-slate-300">{r.totalKg.toFixed(2)} kg</td>
                  <td className="text-slate-700 dark:text-slate-300">{r.costDay.toFixed(2)} €</td>
                  <td className="text-right space-x-2">
                    <button 
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        currentGroup === r.name 
                          ? 'bg-slate-400 text-white cursor-not-allowed' 
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`} 
                      onClick={() => openGroup(r.name)}
                      disabled={currentGroup === r.name}
                    >
                      {currentGroup === r.name ? 'Selected' : 'Select'}
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors" onClick={() => archiveGroup(r.name)}>Delete</button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </>
  );
}
