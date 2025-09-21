import { Heart, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import bedrockApiService from "../services/bedrockApiService.js";

export default function DiseaseForm({ onDiseaseCalculated, onDiseaseFormData, onWeeklyRecipesGenerated, onRecipeGenerationState, onLoaded, loadProfileData, currentGroup }) {
  const [form, setForm] = useState({
    breed: "",
    age: "",
    weight: "",
    quantity: "",
    disease: "",
  });

  // Loading state for API calls
  const [isCalculating, setIsCalculating] = useState(false);
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);
  const [calculationError, setCalculationError] = useState(null);

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  // Load profile data when provided
  useEffect(() => {
    if (loadProfileData && typeof loadProfileData === 'object') {
      setForm(loadProfileData);
    }
  }, [loadProfileData]);

  const calc = async (e) => {
    e.preventDefault();
    const { breed, age, weight, quantity, disease } = form;

    const iAge = parseInt(age), iQty = parseInt(quantity), fW = parseFloat(weight);
    if (!iAge || !iQty || !fW || !disease) return alert("Please fill in all fields with valid values.");

    setIsCalculating(true);
    setCalculationError(null);

    try {
      // Pass form data to parent for weekly recipes
      onDiseaseFormData(form);
      
      // Call Bedrock API for disease recovery
      const diseaseResponse = await bedrockApiService.getDiseaseRecovery(form);
      onDiseaseCalculated(diseaseResponse);
      
      // Also generate weekly recipes automatically
      setIsGeneratingRecipes(true);
      onRecipeGenerationState(true);
      try {
        const weeklyRecipes = await bedrockApiService.getDiseaseWeeklyRecipes(form);
        onWeeklyRecipesGenerated(weeklyRecipes);
      } catch (recipesError) {
        console.warn('Weekly recipes generation failed:', recipesError);
        // Don't show error to user, just log it
      } finally {
        setIsGeneratingRecipes(false);
        onRecipeGenerationState(false);
      }
    } catch (bedrockError) {
      console.error('Disease recovery API failed:', bedrockError);
      setCalculationError(`Disease recovery API unavailable: ${bedrockError.message}. Please try again later.`);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="card shadow-sm p-6 card-hover" data-aos="fade-right">
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center">
        <Heart className="mr-2 text-red-500" size={24} />
        Disease Recovery
      </h2>

      {/* Group Context Display */}
      {currentGroup && loadProfileData && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-1 flex items-center">
                <Heart className="mr-2" size={16} />
                Using Group: {currentGroup}
              </h3>
              <div className="text-sm text-green-700 dark:text-green-300 grid grid-cols-2 gap-2">
                <span><strong>Breed:</strong> {loadProfileData.breed || 'Unknown'}</span>
                <span><strong>Quantity:</strong> {loadProfileData.quantity || 'Unknown'} birds</span>
                <span><strong>Age:</strong> {loadProfileData.age || 'Unknown'} weeks</span>
                <span><strong>Weight:</strong> {loadProfileData.weight || 'Unknown'} kg</span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <Heart className="mr-1" size={12} />
                Pre-filled
              </span>
            </div>
          </div>
        </div>
      )}

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
          
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Disease</label>
            <select value={form.disease} onChange={(e)=>set("disease", e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
              <option value="">Select Disease</option>
              <option value="respiratory_infection">Respiratory Infection</option>
              <option value="coccidiosis">Coccidiosis</option>
              <option value="mites_lice">Mites & Lice</option>
              <option value="egg_binding">Egg Binding</option>
              <option value="marek_disease">Marek's Disease</option>
              <option value="newcastle_disease">Newcastle Disease</option>
            </select>
          </div>
        </div>

        {/* Error message */}
        {calculationError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <p className="text-red-800 dark:text-red-200 text-sm">{calculationError}</p>
          </div>
        )}

        <div className="pt-2">
          <button 
            type="submit"
            disabled={isCalculating}
            className="btn-primary w-full py-3 rounded-lg inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCalculating ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={18}/> 
                {isGeneratingRecipes ? 'Generating Recipes...' : 'Analyzing Disease...'}
              </>
            ) : (
              <>
                <Heart className="mr-2" size={18}/> Get Recovery Recommendations
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
