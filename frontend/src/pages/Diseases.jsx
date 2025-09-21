import { useState, useEffect } from "react";
import { AlertTriangle, Heart, Users, TrendingUp } from "lucide-react";
import DiseaseForm from "../components/DiseaseForm.jsx";
import DiseaseRecoveryResults from "../components/DiseaseRecoveryResults.jsx";
import DiseaseWeeklyRecipes from "../components/DiseaseWeeklyRecipes.jsx";
import bedrockApiService from "../services/bedrockApiService.js";
import { listProfiles, loadProfile, removeProfile } from "../hooks/useSettings.js";

export default function Diseases() {
  // API-based disease functionality states
  const [diseaseData, setDiseaseData] = useState(null);
  const [diseaseFormData, setDiseaseFormData] = useState(null);
  const [weeklyRecipesData, setWeeklyRecipesData] = useState(null);
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);

  // Active group management states
  const [currentGroup, setCurrentGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroupData, setSelectedGroupData] = useState(null);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);



  // Load groups on component mount
  useEffect(() => {
    loadGroups();
  }, []);

  // Group management functions
  const loadGroups = async () => {
    setIsLoadingGroups(true);
    try {
      const profiles = await listProfiles();
      if (!Array.isArray(profiles)) {
        console.warn('Profiles is not an array:', profiles);
        setGroups([]);
        return;
      }
      
      const mapped = await Promise.all(profiles.map(async (name) => {
        try {
          const g = await loadProfile(name);
          if (!g) return null;
          return { name, data: g };
        } catch (profileError) {
          console.error(`Error loading profile ${name}:`, profileError);
          return null;
        }
      }));
      setGroups(mapped.filter(group => group !== null));
    } catch (error) {
      console.error('Error loading groups:', error);
      setGroups([]);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const selectGroup = async (groupName) => {
    try {
      const groupData = await loadProfile(groupName);
      if (!groupData) {
        console.warn('Group not found:', groupName);
        return;
      }
      setCurrentGroup(groupName);
      setSelectedGroupData(groupData);
    } catch (error) {
      console.error('Error selecting group:', error);
      alert('Error loading group. Please try again.');
    }
  };

  const archiveGroup = async (groupName) => {
    if (!confirm(`Archive/remove group "${groupName}"?`)) return;
    try {
      await removeProfile(groupName);
      if (currentGroup === groupName) {
        setCurrentGroup(null);
        setSelectedGroupData(null);
      }
      loadGroups();
    } catch (error) {
      console.error('Error removing group:', error);
      alert('Error removing group. Please try again.');
    }
  };

  // API-based disease functionality callbacks
  const onDiseaseCalculated = (d) => setDiseaseData(d);
  const onDiseaseFormData = (formData) => setDiseaseFormData(formData);
  const onWeeklyRecipesGenerated = (recipes) => setWeeklyRecipesData(recipes);
  const onRecipeGenerationState = (isGenerating) => setIsGeneratingRecipes(isGenerating);

  const getDiseaseWeeklyRecipes = async () => {
    if (!diseaseFormData) throw new Error('No disease form data available');
    
    return await bedrockApiService.getDiseaseWeeklyRecipes(diseaseFormData);
  };


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card shadow-sm p-6" data-aos="fade-up">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center">
          <AlertTriangle className="mr-3 text-red-500" />
          AI-Powered Disease Recovery
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Get personalized disease recovery recommendations and weekly feeding plans powered by AI.
        </p>
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
                <th className="py-2">Age</th>
                <th className="py-2">Breed</th>
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
              ) : groups.length === 0 ? (
                <tr><td colSpan="6" className="py-6 text-center text-slate-400 dark:text-slate-500">
                  No active groups found. Please log in and save a chicken profile to see your groups here.
                </td></tr>
              ) : (
                groups.map((group) => (
                  <tr key={group.name} className={`border-b dark:border-slate-600 ${currentGroup === group.name ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}>
                    <td className="py-2 font-medium text-slate-900 dark:text-slate-100">
                      {group.name}
                      {currentGroup === group.name && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="text-slate-700 dark:text-slate-300">{group.data.quantity || "—"}</td>
                    <td className="text-slate-700 dark:text-slate-300">{(+group.data.weight || 0).toFixed(2)} kg</td>
                    <td className="text-slate-700 dark:text-slate-300">{group.data.age || "—"} weeks</td>
                    <td className="text-slate-700 dark:text-slate-300">{group.data.breed || "—"}</td>
                    <td className="text-right space-x-2">
                      <button 
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          currentGroup === group.name 
                            ? 'bg-slate-400 text-white cursor-not-allowed' 
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`} 
                        onClick={() => selectGroup(group.name)}
                        disabled={currentGroup === group.name}
                      >
                        {currentGroup === group.name ? 'Selected' : 'Select'}
                      </button>
                      <button 
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors" 
                        onClick={() => archiveGroup(group.name)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* API-based Disease Recovery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DiseaseForm 
          onDiseaseCalculated={onDiseaseCalculated} 
          onDiseaseFormData={onDiseaseFormData}
          onWeeklyRecipesGenerated={onWeeklyRecipesGenerated}
          onRecipeGenerationState={onRecipeGenerationState}
          onLoaded={() => {}} 
          loadProfileData={selectedGroupData}
          currentGroup={currentGroup}
        />
        <DiseaseRecoveryResults diseaseData={diseaseData} currentGroup={currentGroup} />
      </div>

      {/* Disease Weekly Recipes */}
      <div className="mt-12">
        <DiseaseWeeklyRecipes 
          diseaseData={diseaseData} 
          weeklyRecipesData={weeklyRecipesData}
          isGenerating={isGeneratingRecipes}
          onGetRecipes={getDiseaseWeeklyRecipes}
          currentGroup={currentGroup}
          selectedGroupData={selectedGroupData}
        />
      </div>
    </div>
  );
}
