import { useEffect, useRef } from "react";
import { Clock, UtensilsCrossed, Thermometer, Zap, DollarSign, Info, Wheat } from "lucide-react";
import Modal from "./Modal.jsx";

export default function MealDetailsModal({ 
  isOpen, 
  onClose, 
  mealData,
  model
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Animate meal details in
      const elements = modalRef.current.querySelectorAll('[data-animate]');
      elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        setTimeout(() => {
          el.style.transition = 'all 0.3s ease';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, index * 100);
      });
    }
  }, [isOpen, mealData]);

  if (!isOpen || !mealData || !model) return null;

  const { time, amountPerChicken, totalAmount, dayOfWeek } = mealData;
  const { form, seasonalAdjustments } = model;

  // Calculate key nutritional info only
  const getKeyNutrition = () => {
    const seasonalMultiplier = seasonalAdjustments?.energy_multiplier || 1;
    return {
      energy: Math.round(amountPerChicken * seasonalMultiplier * 3.2),
      protein: Math.round(amountPerChicken * 0.16 * 1000),
      calcium: Math.round(amountPerChicken * 0.035 * 1000),
    };
  };

  const nutrition = getKeyNutrition();

  // Get only essential seasonal info
  const getEssentialInfo = () => {
    if (!seasonalAdjustments) return null;
    
    const energyIncrease = Math.round((seasonalAdjustments.energy_multiplier - 1) * 100);
    const calciumIncrease = Math.round((seasonalAdjustments.calcium_boost - 1) * 100);
    
    return {
      energyIncrease: energyIncrease > 0 ? `+${energyIncrease}%` : null,
      calciumIncrease: calciumIncrease > 0 ? `+${calciumIncrease}%` : null,
      waterTemp: seasonalAdjustments.water_temperature
    };
  };

  const essentialInfo = getEssentialInfo();

  // Get feed composition based on purpose
  const getFeedComposition = () => {
    const baseComposition = {
      corn: 45,
      soybean_meal: 25,
      wheat: 15,
      calcium_carbonate: 8,
      vitamins_minerals: 4,
      salt: 0.5,
      other: 2.5
    };

    if (form.purpose === 'eggs') {
      return {
        ...baseComposition,
        calcium_carbonate: 12, // More calcium for egg shells
        soybean_meal: 28, // More protein
        corn: 40 // Less corn
      };
    } else if (form.purpose === 'meat') {
      return {
        ...baseComposition,
        soybean_meal: 32, // More protein for growth
        corn: 50, // More energy
        calcium_carbonate: 6 // Less calcium
      };
    } else if (form.purpose === 'breeding') {
      return {
        ...baseComposition,
        soybean_meal: 30, // Balanced protein
        vitamins_minerals: 6, // More vitamins
        corn: 42
      };
    }

    return baseComposition;
  };

  const feedComposition = getFeedComposition();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${time} - ${dayOfWeek}`}
      type="info"
      size="md"
    >
      <div ref={modalRef} className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Header Info */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg p-4" data-animate>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  {form.breed} • {form.quantity} chickens
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {form.season} • {form.environment}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {amountPerChicken}g
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">per chicken</div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3" data-animate>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <UtensilsCrossed className="w-4 h-4 text-blue-500 mx-auto mb-1" />
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {totalAmount.toFixed(0)}g
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Total</div>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <Zap className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {nutrition.energy}kcal
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Energy</div>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <DollarSign className="w-4 h-4 text-green-500 mx-auto mb-1" />
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              ${(totalAmount * form.feedCost / 1000).toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Cost</div>
          </div>
        </div>

        {/* Nutrition */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4" data-animate>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center">
            <Zap className="w-4 h-4 text-yellow-500 mr-2" />
            Nutrition (per chicken)
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{nutrition.protein}mg</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Protein</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{nutrition.calcium}mg</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Calcium</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {form.purpose === 'eggs' ? 'High' : form.purpose === 'meat' ? 'Max' : 'Balanced'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Level</div>
            </div>
          </div>
        </div>

        {/* Feed Composition */}
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4" data-animate>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center">
            <Wheat className="w-4 h-4 text-orange-500 mr-2" />
            Feed Composition
          </h4>
          <div className="space-y-2">
            {Object.entries(feedComposition).map(([ingredient, percentage]) => (
              <div key={ingredient} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">
                    {ingredient.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 w-8 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
            {form.purpose === 'eggs' && 'Higher calcium and protein for egg production'}
            {form.purpose === 'meat' && 'High protein and energy for rapid growth'}
            {form.purpose === 'breeding' && 'Balanced nutrition with enhanced vitamins'}
          </div>
        </div>

        {/* Seasonal Adjustments - Only if significant */}
        {essentialInfo && (essentialInfo.energyIncrease || essentialInfo.calciumIncrease) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4" data-animate>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center">
              <Thermometer className="w-4 h-4 text-blue-500 mr-2" />
              {form.season} Adjustments
            </h4>
            <div className="space-y-1">
              {essentialInfo.energyIncrease && (
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  Energy: {essentialInfo.energyIncrease}
                </div>
              )}
              {essentialInfo.calciumIncrease && (
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  Calcium: {essentialInfo.calciumIncrease}
                </div>
              )}
              {essentialInfo.waterTemp && (
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  Water: {essentialInfo.waterTemp}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Purpose-specific note */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4" data-animate>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center">
            <Info className="w-4 h-4 text-purple-500 mr-2" />
            {form.purpose === 'eggs' ? 'Egg Production' : form.purpose === 'meat' ? 'Meat Production' : 'Breeding'}
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {form.purpose === 'eggs' && 'Optimized for consistent egg production with enhanced calcium.'}
            {form.purpose === 'meat' && 'High-energy feed for rapid growth and weight gain.'}
            {form.purpose === 'breeding' && 'Balanced nutrition for optimal reproductive health.'}
          </p>
        </div>
      </div>
    </Modal>
  );
}
