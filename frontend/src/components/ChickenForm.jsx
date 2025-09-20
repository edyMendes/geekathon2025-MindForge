
import { Cpu, Save, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { preciseFeedAmount, optimalFeedingTimes, calculateSeasonalFeedAmount, getAdditionalFeedRecommendations } from "../utils/calculate.js";
import { saveProfile } from "../hooks/useSettings.js";
import ProfileNameModal from "./ProfileNameModal.jsx";
import bedrockApiService from "../services/bedrockApiService.js";


export default function ChickenForm({ onCalculated, onLoaded, loadProfileData }) {
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

  // Modal states
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  // Loading state for API calls
  const [isCalculating, setIsCalculating] = useState(false);
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
    const { breed, age, weight, quantity, environment, season, purpose, eggPurpose, stressLevel, feedType, feedBrand, feedCost, molting, vaccination, eggPrice } = form;

    const iAge = parseInt(age), iQty = parseInt(quantity), fW = parseFloat(weight);
    if (!iAge || !iQty || !fW) return alert("Please fill in age, weight and quantity with valid values.");

    setIsCalculating(true);
    setCalculationError(null);

    try {
      // Try Bedrock API first
      const bedrockResponse = await bedrockApiService.calculateFeed(form);
      const transformedData = await bedrockApiService.transformBedrockResponse(bedrockResponse, form);
      onCalculated(transformedData);
    } catch (bedrockError) {
      console.warn('Bedrock API failed, falling back to local calculations:', bedrockError);
      setCalculationError(`Bedrock API unavailable: ${bedrockError.message}. Using local calculations.`);
      
      // Fallback to local calculations
      const seasonalFeedData = calculateSeasonalFeedAmount(breed, iAge, fW, environment, season, stressLevel, molting, purpose);
      const recommendations = getAdditionalFeedRecommendations(breed, iAge, environment, season, purpose);

      const totalKg = (seasonalFeedData.adjustedAmount * iQty) / 1000;
      const times = optimalFeedingTimes(iAge, season, environment, stressLevel, purpose);

      onCalculated({
        form,
        perChicken: seasonalFeedData.adjustedAmount,
        basePerChicken: seasonalFeedData.baseAmount,
        totalKg,
        times,
        seasonalAdjustments: seasonalFeedData.seasonalAdjustments,
        recommendations: recommendations,
        energyIncrease: seasonalFeedData.energyIncrease,
        proteinIncrease: seasonalFeedData.proteinIncrease,
        calciumIncrease: seasonalFeedData.calciumIncrease
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSave = async (profileName) => {
    const { age, weight, quantity } = form;
    if (!parseInt(age) || !parseInt(quantity) || !parseFloat(weight)) {
      alert("Please fill in age, weight and quantity with valid values.");
      return;
    }
    
    try {
      await saveProfile(profileName, { ...form, age: +form.age, weight: +form.weight, quantity: +form.quantity });
      onLoaded?.(profileName);
      setShowSaveModal(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert("Error saving profile. Please try again.");
    }
  };


  const openSaveModal = () => {
    const { age, weight, quantity } = form;
    if (!parseInt(age) || !parseInt(quantity) || !parseFloat(weight)) {
      alert("Please fill in age, weight and quantity with valid values.");
      return;
    }
    setShowSaveModal(true);
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

        {/* Error message */}
        {calculationError && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">{calculationError}</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3 pt-2">
          <button 
            type="submit"
            disabled={isCalculating}
            className="btn-primary w-full py-3 rounded-lg inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCalculating ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={18}/> Calculating...
              </>
            ) : (
              <>
                <Cpu className="mr-2" size={18}/> Calculate Recommendations
              </>
            )}
          </button>
          <button type="button" onClick={openSaveModal} className="btn-sec w-full py-3 rounded-lg inline-flex items-center justify-center">
            <Save className="mr-2" size={18}/> Save Profile
          </button>
        </div>
      </form>

      {/* Modals */}
      <ProfileNameModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSave}
        title="Save Chicken Profile"
        placeholder="Enter profile name..."
        existingProfiles={[]}
        type="chicken"
      />
    </div>
  );
}
