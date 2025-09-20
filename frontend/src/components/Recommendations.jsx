import { useEffect } from "react";
import anime from "animejs";
import { Thermometer, Droplets, Calendar, Lightbulb, AlertCircle, CheckCircle } from "lucide-react";

export default function Recommendations({ model }) {
  // model: { form, perChicken, totalKg, times }
  useEffect(() => {
    if (!model) return;
    anime({ targets: "[data-surge]", opacity: [0, 1], translateY: [8, 0], delay: anime.stagger(40) });
  }, [model]);

  if (!model) {
    return (
      <div className="card shadow-sm p-6 card-hover" data-aos="fade-left">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6">Recommendations</h2>
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          Fill the form to get recommendations.
        </div>
      </div>
    );
  }

  const { 
    form, 
    perChicken, 
    basePerChicken, 
    totalKg, 
    times, 
    seasonalAdjustments, 
    recommendations, 
    energyIncrease, 
    proteinIncrease, 
    calciumIncrease,
    // Bedrock-specific fields
    mealsPerDay,
    quantityPerMeal,
    storageRecommendations,
    nutritionalAnalysis,
    feedComposition
  } = model;
  
  const perMeal = quantityPerMeal ? Math.round(quantityPerMeal) : Math.round(perChicken / times.length);
  const actualMealsPerDay = mealsPerDay || times.length;

  return (
    <div className="card shadow-sm p-6 card-hover" data-aos="fade-left">
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6">Recommendations</h2>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 bg-white/80 dark:bg-slate-800/80" data-surge>
          <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-200 flex items-center">
            <Calendar className="mr-2 text-blue-500" />
            Feeding Schedule
            {mealsPerDay && (
              <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                AI Optimized
              </span>
            )}
          </h3>
          <ul className="space-y-2">
            {times.map((t, index) => (
              <li key={t} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded">
                <div className="flex items-center">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{t}</span>
                  {mealsPerDay && index === 0 && (
                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                      Morning
                    </span>
                  )}
                  {mealsPerDay && index === 1 && (
                    <span className="ml-2 text-xs text-orange-600 dark:text-orange-400">
                      Evening
                    </span>
                  )}
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">{perMeal} g/chicken</span>
              </li>
            ))}
          </ul>
          {mealsPerDay && (
            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
              <strong>AI Recommendation:</strong> {mealsPerDay} meals per day for optimal nutrition absorption
            </div>
          )}
        </div>

        <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 bg-white/80 dark:bg-slate-800/80" data-surge>
          <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">Quantities</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Total per day:</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{totalKg.toFixed(1)} kg</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Per chicken:</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{Math.round(perChicken)} g</p>
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
              <p className="text-slate-600 dark:text-slate-400">Per meal</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{perMeal} g</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
              <p className="text-slate-600 dark:text-slate-400">Meals/day</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{actualMealsPerDay}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seasonal Adjustments */}
      {seasonalAdjustments && (
        <div className="mt-6 border border-slate-200 dark:border-slate-600 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20" data-surge>
          <h3 className="font-semibold mb-3 text-slate-800 dark:text-slate-200 flex items-center">
            <Thermometer className="mr-2 text-blue-500" />
            Seasonal Adjustments for {form.season}
          </h3>
          
          <div className="space-y-4">
            {/* Energy Adjustments */}
            {seasonalAdjustments.energy_adjustment && (
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mr-3">
                    <Thermometer className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Energy Requirements</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {seasonalAdjustments.energy_adjustment}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Protein Adjustments */}
            {seasonalAdjustments.protein_adjustment && (
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Protein Requirements</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {seasonalAdjustments.protein_adjustment}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Water Considerations */}
            {seasonalAdjustments.water_considerations && (
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
                    <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Water Considerations</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {seasonalAdjustments.water_considerations}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Fallback to old format if new format not available */}
            {!seasonalAdjustments.energy_adjustment && !seasonalAdjustments.protein_adjustment && !seasonalAdjustments.water_considerations && (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Energy</span>
                    <span className={`text-sm font-semibold ${energyIncrease > 0 ? 'text-green-600' : energyIncrease < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                      {energyIncrease > 0 ? '+' : ''}{energyIncrease}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {seasonalAdjustments.special_notes || 'Standard seasonal adjustments'}
                  </div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Protein</span>
                    <span className={`text-sm font-semibold ${proteinIncrease > 0 ? 'text-green-600' : proteinIncrease < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                      {proteinIncrease > 0 ? '+' : ''}{proteinIncrease}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {proteinIncrease > 0 ? 'Increased for growth' : 'Standard levels'}
                  </div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Calcium</span>
                    <span className={`text-sm font-semibold ${calciumIncrease > 0 ? 'text-green-600' : calciumIncrease < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                      {calciumIncrease > 0 ? '+' : ''}{calciumIncrease}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {calciumIncrease > 0 ? 'Boosted for eggshells' : 'Standard levels'}
                  </div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Frequency</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {seasonalAdjustments.feeding_frequency || 'Standard'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Water: {seasonalAdjustments.water_temperature || 'Room temperature'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feed Composition from Bedrock API */}
      {feedComposition && (
        <div className="mt-6 border border-slate-200 dark:border-slate-600 rounded-lg p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20" data-surge>
          <h3 className="font-semibold mb-3 text-slate-800 dark:text-slate-200 flex items-center">
            <Thermometer className="mr-2 text-green-500" />
            Feed Composition Analysis
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600 dark:text-slate-400">Crude Protein</span>
                <span className="text-sm font-semibold text-green-600">
                  {feedComposition.crudeProteinPercent}%
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {form.purpose === 'meat' ? 'Essential for muscle growth and development' : 'Essential for growth and egg production'}
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600 dark:text-slate-400">Energy</span>
                <span className="text-sm font-semibold text-green-600">
                  {feedComposition.metabolizableEnergy} kcal/kg
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Metabolizable energy content
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600 dark:text-slate-400">Calcium</span>
                <span className="text-sm font-semibold text-green-600">
                  {feedComposition.calciumPercent}%
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {form.purpose === 'meat' ? 'Important for bone strength and development' : 'Critical for eggshell formation'}
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600 dark:text-slate-400">Phosphorus</span>
                <span className="text-sm font-semibold text-green-600">
                  {feedComposition.phosphorusPercent}%
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {form.purpose === 'meat' ? 'Bone and muscle development' : 'Bone and egg development'}
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600 dark:text-slate-400">Fiber</span>
                <span className="text-sm font-semibold text-green-600">
                  {feedComposition.fiberPercent}%
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Digestive health
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600 dark:text-slate-400">Source</span>
                <span className="text-sm font-semibold text-blue-600">
                  AI Analysis
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Powered by Bedrock AI
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Storage Recommendations from Bedrock API */}
      {storageRecommendations && storageRecommendations.length > 0 && (
        <div className="mt-6 border border-slate-200 dark:border-slate-600 rounded-lg p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20" data-surge>
          <h3 className="font-semibold mb-3 text-slate-800 dark:text-slate-200 flex items-center">
            <Droplets className="mr-2 text-amber-500" />
            Storage Recommendations
          </h3>
          <ul className="space-y-2">
            {storageRecommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start text-sm text-amber-800 dark:text-amber-200">
                <span className="mr-2 mt-1">•</span>
                <span>{typeof rec === 'string' ? rec : JSON.stringify(rec)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Additional Recommendations */}
      {recommendations && (
        <div className="mt-6 space-y-4" data-surge>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
            <CheckCircle className="mr-2 text-green-500" />
            Additional Recommendations
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Seasonal Recommendations */}
            {recommendations.seasonal.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Seasonal ({form.season})
                </h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  {recommendations.seasonal.map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{typeof rec === 'string' ? rec : JSON.stringify(rec)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Breed-specific Recommendations */}
            {recommendations.breed.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Breed ({form.breed})
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  {recommendations.breed.map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{typeof rec === 'string' ? rec : JSON.stringify(rec)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Age-specific Recommendations */}
            {recommendations.age.length > 0 && (
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-1" />
                  Age ({form.age} weeks)
                </h4>
                <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                  {recommendations.age.map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{typeof rec === 'string' ? rec : JSON.stringify(rec)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Environment-specific Recommendations */}
            {recommendations.environment.length > 0 && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2 flex items-center">
                  <Droplets className="w-4 h-4 mr-1" />
                  Environment ({form.environment})
                </h4>
                <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                  {recommendations.environment.map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{typeof rec === 'string' ? rec : JSON.stringify(rec)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Purpose-specific Recommendations */}
            {recommendations.purpose.length > 0 && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Purpose ({form.purpose})
                </h4>
                <ul className="text-sm text-indigo-700 dark:text-indigo-300 space-y-1">
                  {recommendations.purpose.map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{typeof rec === 'string' ? rec : JSON.stringify(rec)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* General Recommendations */}
            {recommendations.general.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  General
                </h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  {recommendations.general.map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{typeof rec === 'string' ? rec : JSON.stringify(rec)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}


    </div>
  );
}
