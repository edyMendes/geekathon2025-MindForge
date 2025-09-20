import { useState, useEffect } from "react";
import { Calendar, Clock, Utensils, Info, ChevronDown, ChevronUp, Scale, Leaf, Zap, CalendarDays } from "lucide-react";
import bedrockApiService from "../services/bedrockApiService.js";

export default function WeeklyRecipes({ model, onRecipesLoaded }) {
  const [weeklyRecipes, setWeeklyRecipes] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);
  const [expandedFeeding, setExpandedFeeding] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Helper functions for date management
  const getWeekStartingFromToday = (startDate) => {
    const week = [];
    const today = new Date(startDate);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      week.push({
        date: date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
        dayShort: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dateString: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isToday: i === 0,
        dayIndex: i
      });
    }
    return week;
  };

  const getDayNameFromIndex = (index) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[index];
  };

  const mapRecipesToWeek = (dailyRecipes, weekDays) => {
    if (!dailyRecipes || !Array.isArray(dailyRecipes)) return [];
    
    return weekDays.map((weekDay, index) => {
      // Find matching recipe by day name
      const recipe = dailyRecipes.find(recipe => 
        recipe.day && recipe.day.toLowerCase() === weekDay.dayName.toLowerCase()
      );
      
      return {
        ...weekDay,
        recipe: recipe || null,
        hasRecipe: !!recipe
      };
    });
  };

  // Load weekly recipes when model changes
  useEffect(() => {
    if (model && model.form) {
      loadWeeklyRecipes();
    }
  }, [model]);

  const loadWeeklyRecipes = async () => {
    if (!model || !model.form) return;

    setIsLoading(true);
    setError(null);

    try {
      const recipes = await bedrockApiService.getWeeklyRecipes(model.form);
      setWeeklyRecipes(recipes);
      if (onRecipesLoaded) {
        onRecipesLoaded(recipes);
      }
    } catch (err) {
      console.error('Error loading weekly recipes:', err);
      setError(`Failed to load weekly recipes: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDayExpansion = (dayIndex) => {
    setExpandedDay(expandedDay === dayIndex ? null : dayIndex);
    setExpandedFeeding(null); // Close any expanded feeding when switching days
  };

  const toggleFeedingExpansion = (dayIndex, feedingIndex) => {
    const key = `${dayIndex}-${feedingIndex}`;
    setExpandedFeeding(expandedFeeding === key ? null : key);
  };

  const formatQuantity = (kg, grams) => {
    if (kg >= 1) {
      return `${kg.toFixed(2)} kg`;
    } else {
      return `${grams.toFixed(0)} g`;
    }
  };

  const getNutritionalIcon = (focus) => {
    if (focus.toLowerCase().includes('energy') || focus.toLowerCase().includes('morning')) {
      return <Zap className="w-4 h-4 text-yellow-500" />;
    } else if (focus.toLowerCase().includes('calcium') || focus.toLowerCase().includes('evening')) {
      return <Scale className="w-4 h-4 text-blue-500" />;
    } else if (focus.toLowerCase().includes('protein') || focus.toLowerCase().includes('growth')) {
      return <Leaf className="w-4 h-4 text-green-500" />;
    }
    return <Utensils className="w-4 h-4 text-emerald-500" />;
  };

  if (!model) {
    return (
      <div className="card shadow-sm p-6" data-aos="fade-up">
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p>Fill the form to see weekly recipes</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card shadow-sm p-6" data-aos="fade-up">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="ml-3 text-slate-600 dark:text-slate-400">Loading weekly recipes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card shadow-sm p-6" data-aos="fade-up">
        <div className="text-center py-12 text-red-500">
          <Info className="w-12 h-12 mx-auto mb-4" />
          <p className="mb-4">{error}</p>
          <button 
            onClick={loadWeeklyRecipes}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!weeklyRecipes) {
    return (
      <div className="card shadow-sm p-6" data-aos="fade-up">
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p>No weekly recipes available</p>
        </div>
      </div>
    );
  }

  const { weekly_calendar, feed_calculation, nutritional_context } = weeklyRecipes;
  const { daily_recipes = [], weekly_nutritional_goals = [], preparation_notes = [], seasonal_adjustments = [] } = weekly_calendar || {};
  const { additional_recommendations = [] } = nutritional_context || {};
  
  // Generate week starting from today
  const weekDays = getWeekStartingFromToday(selectedDate);
  const weekWithRecipes = mapRecipesToWeek(daily_recipes, weekDays);

  return (
    <div className="card shadow-sm p-6" data-aos="fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-emerald-600" />
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
            Weekly Feed Recipes
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-medium">Total Weekly: {weekly_calendar?.total_weekly_kg?.toFixed(2)} kg</span>
          </div>
        </div>
      </div>

      {/* Week Overview */}
      <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Week Overview</h3>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {weekDays[0].dateString} - {weekDays[6].dateString}
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`text-center p-2 rounded-lg border-2 transition-all ${
                day.isToday
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="text-xs font-medium">{day.dayShort}</div>
              <div className="text-sm font-semibold">{day.date.getDate()}</div>
              {day.isToday && (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Today</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Weekly Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Nutritional Goals</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              {weekly_nutritional_goals.map((goal, index) => (
                <li key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  {goal}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Seasonal Adjustments</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              {seasonal_adjustments.map((adjustment, index) => (
                <li key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  {adjustment}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Preparation Notes</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              {preparation_notes.map((note, index) => (
                <li key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  {note}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Additional Recommendations</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              {additional_recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Daily Recipes */}
      <div className="space-y-4">
        {weekWithRecipes.map((weekDay, dayIndex) => (
          <div key={dayIndex} className={`border rounded-lg overflow-hidden transition-all ${
            weekDay.isToday 
              ? 'border-emerald-300 dark:border-emerald-600 shadow-lg' 
              : 'border-slate-200 dark:border-slate-700'
          }`}>
            <button
              onClick={() => toggleDayExpansion(dayIndex)}
              className={`w-full p-4 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-between ${
                weekDay.isToday 
                  ? 'bg-emerald-50 dark:bg-emerald-900/20' 
                  : 'bg-slate-50 dark:bg-slate-800'
              }`}
            >
              <div className="flex items-center">
                <Calendar className={`w-5 h-5 mr-3 ${weekDay.isToday ? 'text-emerald-600' : 'text-slate-500'}`} />
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">{weekDay.dayName}</h3>
                    <span className="text-sm text-slate-500 dark:text-slate-400">({weekDay.dateString})</span>
                    {weekDay.isToday && (
                      <span className="px-2 py-1 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 rounded-full">
                        Today
                      </span>
                    )}
                  </div>
                  {weekDay.hasRecipe ? (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Total: {formatQuantity(weekDay.recipe.total_daily_kg, weekDay.recipe.total_daily_kg * 1000)} • 
                      {weekDay.recipe.feeding_recipes?.length || 0} feeding{weekDay.recipe.feeding_recipes?.length !== 1 ? 's' : ''}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                      No recipe available for this day
                    </p>
                  )}
                </div>
              </div>
              {weekDay.hasRecipe ? (
                expandedDay === dayIndex ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )
              ) : (
                <div className="w-5 h-5"></div>
              )}
            </button>

            {expandedDay === dayIndex && weekDay.hasRecipe && (
              <div className="p-4 bg-white dark:bg-slate-900">
                {/* Daily Notes */}
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-1">Daily Notes</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{weekDay.recipe.nutritional_notes}</p>
                  
                  {weekDay.recipe.special_considerations && weekDay.recipe.special_considerations.length > 0 && (
                    <div className="mt-2">
                      <h5 className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Special Considerations:</h5>
                      <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                        {weekDay.recipe.special_considerations.map((consideration, index) => (
                          <li key={index} className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                            {consideration}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Feeding Recipes */}
                <div className="space-y-3">
                  {weekDay.recipe.feeding_recipes?.map((feeding, feedingIndex) => (
                    <div key={feedingIndex} className="border border-slate-200 dark:border-slate-700 rounded-lg">
                      <button
                        onClick={() => toggleFeedingExpansion(dayIndex, feedingIndex)}
                        className="w-full p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          {getNutritionalIcon(feeding.nutritional_focus)}
                          <div className="ml-3 text-left">
                            <h4 className="font-medium text-slate-800 dark:text-slate-200 flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-slate-400" />
                              {feeding.feeding_time}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {formatQuantity(feeding.quantity_kg, feeding.quantity_grams)} • {feeding.nutritional_focus}
                            </p>
                          </div>
                        </div>
                        {expandedFeeding === `${dayIndex}-${feedingIndex}` ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      {expandedFeeding === `${dayIndex}-${feedingIndex}` && (
                        <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                          <div className="mb-3">
                            <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Recipe</h5>
                            <p className="text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded border">
                              {feeding.recipe}
                            </p>
                          </div>

                          {feeding.ingredient_breakdown && feeding.ingredient_breakdown.length > 0 && (
                            <div>
                              <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Ingredient Breakdown</h5>
                              <div className="space-y-2">
                                {feeding.ingredient_breakdown.map((ingredient, ingredientIndex) => (
                                  <div key={ingredientIndex} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded border">
                                    <div className="flex-1">
                                      <span className="font-medium text-slate-800 dark:text-slate-200">
                                        {ingredient.ingredient_name}
                                      </span>
                                      <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">
                                        ({ingredient.percentage}%)
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                        {ingredient.grams.toFixed(0)}g
                                      </div>
                                      <div className="text-xs text-slate-500 dark:text-slate-400">
                                        {ingredient.nutritional_contribution}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button
          onClick={loadWeeklyRecipes}
          disabled={isLoading}
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Loading...' : 'Refresh Recipes'}
        </button>
      </div>
    </div>
  );
}
