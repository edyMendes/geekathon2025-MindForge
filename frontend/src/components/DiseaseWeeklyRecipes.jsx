import { Calendar, Clock, Utensils, Target, AlertCircle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function DiseaseWeeklyRecipes({ diseaseData, weeklyRecipesData, onGetRecipes, isGenerating, currentGroup, selectedGroupData }) {
  const [weeklyRecipes, setWeeklyRecipes] = useState(weeklyRecipesData);
  const [isLoading, setIsLoading] = useState(false);

  // Update local state when prop changes
  useEffect(() => {
    setWeeklyRecipes(weeklyRecipesData);
  }, [weeklyRecipesData]);

  const handleGetRecipes = async () => {
    if (!diseaseData) return;
    
    setIsLoading(true);
    try {
      const recipes = await onGetRecipes();
      setWeeklyRecipes(recipes);
    } catch (error) {
      console.error('Error getting weekly recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!diseaseData) {
    return (
      <div className="card shadow-sm p-6" data-aos="fade-up">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center">
          <Calendar className="mr-2 text-red-500" size={24} />
          Disease Recovery Weekly Recipes
        </h2>
        <div className="text-center py-8">
          <Calendar className="mx-auto text-slate-400 dark:text-slate-500 mb-4" size={48} />
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            {!currentGroup 
              ? 'Please select an active group and get disease recovery recommendations first to generate weekly recipes'
              : 'Get disease recovery recommendations first to generate weekly recipes'
            }
          </p>
        
        </div>
      </div>
    );
  }

  const {
    weekly_calendar = {},
    disease_recovery = {},
    request_info = {}
  } = weeklyRecipes || {};

  const {
    week_start_date = "",
    total_weekly_kg = 0,
    daily_recipes = [],
    weekly_nutritional_goals = [],
    preparation_notes = [],
    seasonal_adjustments = []
  } = weekly_calendar;

  return (
    <div className="card shadow-sm p-6" data-aos="fade-up">
      {/* Group Context Display */}
      {currentGroup && selectedGroupData && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-1 flex items-center">
                <Target className="mr-2" size={18} />
                Active Group: {currentGroup}
              </h3>
              <div className="text-sm text-blue-700 dark:text-blue-300 grid grid-cols-2 md:grid-cols-4 gap-2">
                <span><strong>Breed:</strong> {selectedGroupData.breed || 'Unknown'}</span>
                <span><strong>Quantity:</strong> {selectedGroupData.quantity || 'Unknown'} birds</span>
                <span><strong>Age:</strong> {selectedGroupData.age || 'Unknown'} weeks</span>
                <span><strong>Weight:</strong> {selectedGroupData.weight || 'Unknown'} kg</span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <CheckCircle className="mr-1" size={12} />
                Selected
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 flex items-center">
          <Calendar className="mr-2 text-red-500" size={24} />
          Disease Recovery Weekly Recipes
        </h2>
        {!weeklyRecipes && diseaseData && (
          <button
            onClick={handleGetRecipes}
            disabled={isLoading || isGenerating}
            className="btn-primary px-4 py-2 rounded-lg inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading || isGenerating ? (
              <>
                <Clock className="mr-2 animate-spin" size={16} />
                Generating...
              </>
            ) : (
              <>
                <Calendar className="mr-2" size={16} />
                Generate Weekly Recipes
              </>
            )}
          </button>
        )}
      </div>

      {!weeklyRecipes ? (
        <div className="text-center py-8">
          {isGenerating ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              </div>
              <div className="space-y-2">
                <p className="text-red-600 dark:text-red-400 font-medium">Generating Weekly Recipes...</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Creating a complete 7-day recovery recipe calendar
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-center justify-center space-x-2 text-red-700 dark:text-red-300">
                  <Clock className="animate-pulse" size={16} />
                  <span className="text-sm">This may take a few moments...</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <Utensils className="mx-auto text-slate-400 dark:text-slate-500 mb-4" size={48} />
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                {diseaseData ? 'Weekly recipes are being generated...' : 'Get disease recovery recommendations first to generate weekly recipes'}
              </p>
              {diseaseData && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">What you'll get:</h3>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Daily feeding recipes for 7 days</li>
                    <li>• Disease-specific nutritional focus</li>
                    <li>• Detailed ingredient breakdowns</li>
                    <li>• Preparation and storage notes</li>
                    <li>• Recovery progress tracking</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Success Indicator */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
              <CheckCircle className="text-green-500" size={20} />
              <span className="font-medium">Weekly recipes generated successfully!</span>
            </div>
            <p className="text-green-600 dark:text-green-400 text-sm mt-1">
              Your complete 7-day recovery recipe calendar is ready below.
            </p>
          </div>

          {/* Weekly Summary */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center">
                <Target className="mr-2" size={18} />
                Weekly Recovery Plan
              </h3>
              <p className="text-red-700 dark:text-red-300">
                <strong>{total_weekly_kg.toFixed(2)} kg ({(total_weekly_kg * 1000).toFixed(0)}g)</strong> total feed for the week
              </p>
              <p className="text-red-700 dark:text-red-300">
                Starting: {week_start_date || 'This week'}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center">
                <CheckCircle className="mr-2" size={18} />
                Recovery Goals
              </h3>
              <p className="text-green-700 dark:text-green-300">
                {weekly_nutritional_goals.length} nutritional goals
              </p>
              <p className="text-green-700 dark:text-green-300">
                Disease-specific recovery focus
              </p>
            </div>
          </div>

          {/* Weekly Nutritional Goals */}
          {weekly_nutritional_goals.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center">
                <Target className="mr-2 text-blue-500" size={20} />
                Weekly Nutritional Goals
              </h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <ul className="space-y-2">
                  {weekly_nutritional_goals.map((goal, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="mr-2 text-blue-500 mt-1 flex-shrink-0" size={16} />
                      <span className="text-blue-800 dark:text-blue-200">{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Daily Recipes */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
              <Calendar className="mr-2 text-purple-500" size={20} />
              7-Day Recovery Recipe Calendar
            </h3>
            <div className="space-y-4">
              {daily_recipes.map((dayRecipe, dayIndex) => (
                <div key={dayIndex} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                      {dayRecipe.day}
                    </h4>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {dayRecipe.total_daily_kg.toFixed(2)} kg ({(dayRecipe.total_daily_kg * 1000).toFixed(0)}g) total
                    </span>
                  </div>

                  {/* Nutritional Notes */}
                  {dayRecipe.nutritional_notes && (
                    <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                        <strong>Nutritional Focus:</strong> {dayRecipe.nutritional_notes}
                      </p>
                    </div>
                  )}

                  {/* Feeding Recipes */}
                  <div className="space-y-3">
                    {dayRecipe.feeding_recipes.map((feeding, feedingIndex) => (
                      <div key={feedingIndex} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-slate-800 dark:text-slate-200 flex items-center">
                            <Clock className="mr-2 text-slate-500" size={16} />
                            {feeding.feeding_time}
                          </h5>
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {feeding.quantity_kg.toFixed(3)} kg ({(feeding.quantity_kg * 1000).toFixed(0)}g)
                          </span>
                        </div>
                        
                        <div className="mb-2">
                          <p className="text-slate-700 dark:text-slate-300 text-sm">
                            <strong>Recipe:</strong> {feeding.recipe}
                          </p>
                        </div>

                        {feeding.nutritional_focus && (
                          <div className="mb-2">
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                              <strong>Focus:</strong> {feeding.nutritional_focus}
                            </p>
                          </div>
                        )}

                        {/* Ingredient Breakdown */}
                        {feeding.ingredient_breakdown && feeding.ingredient_breakdown.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ingredients:</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {feeding.ingredient_breakdown.map((ingredient, ingIndex) => {
                                // Debug log to see the actual structure
                                console.log('Ingredient data:', ingredient);
                                return (
                                  <div key={ingIndex} className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">
                                      {ingredient.ingredient_name || ingredient.ingredient || 'Unknown ingredient'}:
                                    </span>
                                    <span className="text-slate-800 dark:text-slate-200">
                                      {ingredient.grams || ingredient.grams}g ({ingredient.percentage || ingredient.percentage}%)
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Special Considerations */}
                  {dayRecipe.special_considerations && dayRecipe.special_considerations.length > 0 && (
                    <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                      <h5 className="font-medium text-orange-800 dark:text-orange-200 mb-2 flex items-center">
                        <AlertCircle className="mr-2" size={16} />
                        Special Considerations
                      </h5>
                      <ul className="space-y-1">
                        {dayRecipe.special_considerations.map((consideration, consIndex) => (
                          <li key={consIndex} className="text-orange-700 dark:text-orange-300 text-sm">
                            • {consideration}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Preparation Notes */}
          {preparation_notes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center">
                <Utensils className="mr-2 text-green-500" size={20} />
                Preparation & Storage Notes
              </h3>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <ul className="space-y-2">
                  {preparation_notes.map((note, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="mr-2 text-green-500 mt-1 flex-shrink-0" size={16} />
                      <span className="text-green-800 dark:text-green-200">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Seasonal Adjustments */}
          {seasonal_adjustments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center">
                <Calendar className="mr-2 text-orange-500" size={20} />
                Seasonal Adjustments
              </h3>
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <ul className="space-y-2">
                  {seasonal_adjustments.map((adjustment, index) => (
                    <li key={index} className="flex items-start">
                      <AlertCircle className="mr-2 text-orange-500 mt-1 flex-shrink-0" size={16} />
                      <span className="text-orange-800 dark:text-orange-200">{adjustment}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Request Info */}
          {request_info && Object.keys(request_info).length > 0 && (
            <div className="text-xs text-slate-500 dark:text-slate-400 border-t dark:border-slate-600 pt-4">
              <p>Generated for {request_info.breed || 'Unknown breed'} chickens</p>
              <p>Disease: {request_info.disease || 'Unknown disease'}</p>
              <p>Count: {request_info.count || 'Unknown'} birds</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
