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

  const { form, perChicken, basePerChicken, totalKg, times, seasonalAdjustments, recommendations, energyIncrease, proteinIncrease, calciumIncrease } = model;
  const perMeal = Math.round(perChicken / times.length);

  return (
    <div className="card shadow-sm p-6 card-hover" data-aos="fade-left">
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6">Recommendations</h2>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 bg-white/80 dark:bg-slate-800/80" data-surge>
          <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">Feeding Schedule</h3>
          <ul className="space-y-2">
            {times.map((t) => (
              <li key={t} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded">
                <span className="font-semibold text-slate-900 dark:text-slate-100">{t}</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">{perMeal} g/chicken</span>
              </li>
            ))}
          </ul>
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
              <p className="font-semibold text-slate-900 dark:text-slate-100">{times.length}</p>
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
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600 dark:text-slate-400">Energy</span>
                <span className={`text-sm font-semibold ${energyIncrease > 0 ? 'text-green-600' : energyIncrease < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                  {energyIncrease > 0 ? '+' : ''}{energyIncrease}%
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {seasonalAdjustments.special_notes}
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
                  {seasonalAdjustments.feeding_frequency}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Water: {seasonalAdjustments.water_temperature}
              </div>
            </div>
          </div>
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
                      <span>{rec}</span>
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
                      <span>{rec}</span>
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
                      <span>{rec}</span>
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
                      <span>{rec}</span>
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
                      <span>{rec}</span>
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
                      <span>{rec}</span>
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
