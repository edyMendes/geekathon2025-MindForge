import { Heart, Clock, Shield, AlertTriangle, CheckCircle, Calendar } from "lucide-react";

export default function DiseaseRecoveryResults({ diseaseData, currentGroup }) {
  if (!diseaseData) {
    return (
      <div className="card shadow-sm p-6" data-aos="fade-left">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center">
          <Heart className="mr-2 text-red-500" size={24} />
          Disease Recovery Recommendations
        </h2>
        <div className="text-center py-8">
          <Heart className="mx-auto text-slate-400 dark:text-slate-500 mb-4" size={48} />
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            {!currentGroup 
              ? 'Please select an active group and enter disease information to get recovery recommendations'
              : 'Enter disease information to get recovery recommendations'
            }
          </p>
          
        </div>
      </div>
    );
  }

  const {
    recovery_feed_composition = {},
    daily_feed_amount_per_bird_kg = 0,
    total_daily_feed_kg = 0,
    disease_treatment = {},
    feeding_schedule = [],
    special_considerations = [],
    request_info = {}
  } = diseaseData;

  const {
    treatment_approach = "General recovery support",
    feed_modifications = [],
    supplements = [],
    environmental_changes = []
  } = disease_treatment;

  const {
    crude_protein_percent = "N/A",
    metabolizable_energy_kcal_per_kg = "N/A",
    calcium_percent = "N/A",
    phosphorus_percent = "N/A",
    crude_fiber_percent = "N/A",
    immune_support_nutrients = {}
  } = recovery_feed_composition;

  return (
    <div className="card shadow-sm p-6" data-aos="fade-left">
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center">
        <Heart className="mr-2 text-red-500" size={24} />
        Disease Recovery Recommendations
      </h2>

      {/* Feed Amount Summary */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
            <Shield className="mr-2" size={18} />
            Daily Feed Amount
          </h3>
          <p className="text-blue-700 dark:text-blue-300">
            <strong>{daily_feed_amount_per_bird_kg.toFixed(3)} kg</strong> per bird
          </p>
          <p className="text-blue-700 dark:text-blue-300">
            <strong>{total_daily_feed_kg.toFixed(2)} kg</strong> total daily
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center">
            <CheckCircle className="mr-2" size={18} />
            Recovery Status
          </h3>
          <p className="text-green-700 dark:text-green-300">
            Specialized recovery feed formulated
          </p>
          <p className="text-green-700 dark:text-green-300">
            Immune support nutrients included
          </p>
        </div>
      </div>

      {/* Treatment Approach */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center">
          <AlertTriangle className="mr-2 text-orange-500" size={20} />
          Treatment Approach
        </h3>
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <p className="text-orange-800 dark:text-orange-200">{treatment_approach}</p>
        </div>
      </div>

      {/* Feed Composition */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
          Recovery Feed Composition
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">Crude Protein</p>
            <p className="font-semibold text-slate-900 dark:text-slate-100">{crude_protein_percent}%</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">Energy</p>
            <p className="font-semibold text-slate-900 dark:text-slate-100">{metabolizable_energy_kcal_per_kg} kcal/kg</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">Calcium</p>
            <p className="font-semibold text-slate-900 dark:text-slate-100">{calcium_percent}%</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">Phosphorus</p>
            <p className="font-semibold text-slate-900 dark:text-slate-100">{phosphorus_percent}%</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">Fiber</p>
            <p className="font-semibold text-slate-900 dark:text-slate-100">{crude_fiber_percent}%</p>
          </div>
        </div>
      </div>

      {/* Feed Modifications */}
      {feed_modifications && feed_modifications.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
            Feed Modifications
          </h3>
          <ul className="space-y-2">
            {feed_modifications.map((modification, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="mr-2 text-green-500 mt-1 flex-shrink-0" size={16} />
                <span className="text-slate-700 dark:text-slate-300">{modification}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Supplements */}
      {supplements && supplements.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
            Recommended Supplements
          </h3>
          <ul className="space-y-2">
            {supplements.map((supplement, index) => (
              <li key={index} className="flex items-start">
                <Shield className="mr-2 text-blue-500 mt-1 flex-shrink-0" size={16} />
                <span className="text-slate-700 dark:text-slate-300">{supplement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Environmental Changes */}
      {environmental_changes && environmental_changes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
            Environmental Changes
          </h3>
          <ul className="space-y-2">
            {environmental_changes.map((change, index) => (
              <li key={index} className="flex items-start">
                <AlertTriangle className="mr-2 text-orange-500 mt-1 flex-shrink-0" size={16} />
                <span className="text-slate-700 dark:text-slate-300">{change}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Feeding Schedule */}
      {feeding_schedule && feeding_schedule.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center">
            <Clock className="mr-2" size={20} />
            Feeding Schedule
          </h3>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <ul className="space-y-1">
              {feeding_schedule.map((schedule, index) => (
                <li key={index} className="text-slate-700 dark:text-slate-300">
                  • {schedule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Special Considerations */}
      {special_considerations && special_considerations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center">
            <AlertTriangle className="mr-2 text-red-500" size={20} />
            Special Considerations
          </h3>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <ul className="space-y-2">
              {special_considerations.map((consideration, index) => (
                <li key={index} className="flex items-start">
                  <AlertTriangle className="mr-2 text-red-500 mt-1 flex-shrink-0" size={16} />
                  <span className="text-red-800 dark:text-red-200">{consideration}</span>
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
  );
}
