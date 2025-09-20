import { useState, useEffect } from "react";
import { AlertTriangle, Heart, Pill, Activity } from "lucide-react";
import { listProfiles, loadProfile } from "../hooks/useSettings.js";
import DiseaseTrackingCalendar from "../components/DiseaseTrackingCalendar.jsx";
import CurativeFeeds from "../components/CurativeFeeds.jsx";
import ProfileNameModal from "../components/ProfileNameModal.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";

export default function Diseases() {
  const [selectedDisease, setSelectedDisease] = useState("");
  const [chickenData, setChickenData] = useState({
    age: "",
    weight: "",
    quantity: "",
    breed: "",
    environment: "free_range"
  });
  const [treatment, setTreatment] = useState(null);
  const [savedDiseaseProfiles, setSavedDiseaseProfiles] = useState([]);
  
  // Modal states
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Disease database with comprehensive information
  const diseaseDatabase = {
    "respiratory_infection": {
      name: "Respiratory Infection",
      symptoms: ["Coughing", "Wheezing", "Nasal discharge", "Difficulty breathing", "Reduced appetite"],
      severity: "High",
      contagious: true,
      treatments: {
        medications: [
          { name: "Amoxicillin", dosage: "10mg/kg", frequency: "Twice daily", duration: "7-10 days" },
          { name: "Doxycycline", dosage: "5mg/kg", frequency: "Once daily", duration: "5-7 days" },
          { name: "Tylosin", dosage: "25mg/kg", frequency: "Once daily", duration: "5 days" }
        ],
        feedAdjustments: {
          protein: "Increase to 18-20%",
          vitamins: "Add Vitamin C and E supplements",
          consistency: "Soft, easily digestible feed",
          frequency: "Small, frequent meals"
        },
        isolation: "Isolate affected birds immediately",
        environment: "Clean, dry, well-ventilated area"
      }
    },
    "coccidiosis": {
      name: "Coccidiosis",
      symptoms: ["Bloody diarrhea", "Lethargy", "Pale comb", "Reduced growth", "Dehydration"],
      severity: "High",
      contagious: true,
      treatments: {
        medications: [
          { name: "Amprolium", dosage: "0.0125% in water", frequency: "Continuous", duration: "5-7 days" },
          { name: "Sulfadimethoxine", dosage: "0.05% in water", frequency: "Continuous", duration: "3-5 days" },
          { name: "Toltrazuril", dosage: "7mg/kg", frequency: "Once daily", duration: "2 days" }
        ],
        feedAdjustments: {
          protein: "Maintain 16-18%",
          fiber: "Reduce fiber content",
          electrolytes: "Add electrolyte supplements",
          consistency: "Dry feed only, no wet mash"
        },
        isolation: "Isolate and disinfect area",
        environment: "Keep bedding dry and clean"
      }
    },
    "mites_lice": {
      name: "External Parasites (Mites/Lice)",
      symptoms: ["Excessive scratching", "Feather loss", "Red, irritated skin", "Restlessness", "Reduced egg production"],
      severity: "Medium",
      contagious: true,
      treatments: {
        medications: [
          { name: "Ivermectin", dosage: "0.2mg/kg", frequency: "Once", duration: "Single dose" },
          { name: "Permethrin", dosage: "0.1% spray", frequency: "Weekly", duration: "3-4 weeks" },
          { name: "Diatomaceous Earth", dosage: "Dust application", frequency: "Daily", duration: "2 weeks" }
        ],
        feedAdjustments: {
          protein: "Increase to 18% for feather regrowth",
          vitamins: "Add B-complex vitamins",
          consistency: "Normal",
          frequency: "Normal"
        },
        isolation: "Treat entire flock",
        environment: "Deep clean and disinfect coop"
      }
    },
    "egg_binding": {
      name: "Egg Binding",
      symptoms: ["Straining to lay", "Lethargy", "Loss of appetite", "Distended abdomen", "Difficulty walking"],
      severity: "High",
      contagious: false,
      treatments: {
        medications: [
          { name: "Calcium Gluconate", dosage: "1ml IM", frequency: "Once", duration: "Single dose" },
          { name: "Oxytocin", dosage: "0.5-1 IU", frequency: "Once", duration: "Single dose" },
          { name: "Warm water bath", dosage: "N/A", frequency: "As needed", duration: "15-20 min" }
        ],
        feedAdjustments: {
          calcium: "Increase calcium to 3.5-4%",
          protein: "Maintain 16-18%",
          vitamins: "Add Vitamin D3",
          consistency: "Normal",
          frequency: "Normal"
        },
        isolation: "Isolate for monitoring",
        environment: "Quiet, warm, stress-free area"
      }
    },
    "marek_disease": {
      name: "Marek's Disease",
      symptoms: ["Paralysis", "Weight loss", "Irregular pupils", "Skin tumors", "Death"],
      severity: "Critical",
      contagious: true,
      treatments: {
        medications: [
          { name: "No specific treatment", dosage: "N/A", frequency: "N/A", duration: "N/A" },
          { name: "Supportive care", dosage: "N/A", frequency: "N/A", duration: "Lifelong" }
        ],
        feedAdjustments: {
          protein: "High protein (20-22%)",
          vitamins: "Antioxidant supplements",
          consistency: "Soft, easily digestible",
          frequency: "Frequent small meals"
        },
        isolation: "Immediate isolation",
        environment: "Preventive vaccination only"
      }
    },
    "newcastle_disease": {
      name: "Newcastle Disease",
      symptoms: ["Respiratory distress", "Nervous signs", "Green diarrhea", "Twisted neck", "Death"],
      severity: "Critical",
      contagious: true,
      treatments: {
        medications: [
          { name: "No specific treatment", dosage: "N/A", frequency: "N/A", duration: "N/A" },
          { name: "Supportive care", dosage: "N/A", frequency: "N/A", duration: "As needed" }
        ],
        feedAdjustments: {
          protein: "Maintain normal levels",
          vitamins: "Vitamin C and E",
          consistency: "Soft, easily digestible",
          frequency: "As tolerated"
        },
        isolation: "Immediate quarantine",
        environment: "Report to authorities"
      }
    }
  };

  useEffect(() => {
    // Load saved disease profiles for quick selection
    const diseaseProfiles = JSON.parse(localStorage.getItem('diseaseProfiles') || '[]');
    setSavedDiseaseProfiles(diseaseProfiles);
  }, []);

  const calculateTreatment = () => {
    if (!selectedDisease || !chickenData.age || !chickenData.weight || !chickenData.quantity) {
      alert("Please fill in all required fields");
      return;
    }

    const disease = diseaseDatabase[selectedDisease];
    if (!disease) return;

    // Calculate medication dosages based on chicken data
    const weight = parseFloat(chickenData.weight);
    const quantity = parseInt(chickenData.quantity);
    const age = parseInt(chickenData.age);

    const calculatedMedications = disease.treatments.medications.map(med => {
      let calculatedDosage = med.dosage;
      
      // Calculate specific dosages for weight-based medications
      if (med.dosage.includes("mg/kg")) {
        const dosagePerKg = parseFloat(med.dosage.split("mg/kg")[0]);
        const totalDosage = dosagePerKg * weight;
        calculatedDosage = `${totalDosage.toFixed(1)}mg per chicken (${med.dosage})`;
      }

      return {
        ...med,
        calculatedDosage,
        totalForFlock: quantity > 1 ? `Total for ${quantity} chickens: ${(parseFloat(calculatedDosage.split("mg")[0]) * quantity).toFixed(1)}mg` : null
      };
    });


    // Calculate recovery timeline
    const recoveryDays = disease.severity === "Critical" ? 14-21 : 
                        disease.severity === "High" ? 7-14 : 
                        disease.severity === "Medium" ? 3-7 : 1-3;

    setTreatment({
      disease: disease.name,
      severity: disease.severity,
      contagious: disease.contagious,
      medications: calculatedMedications,
      isolation: disease.treatments.isolation,
      environment: disease.treatments.environment,
      recoveryTimeline: recoveryDays,
      totalCost: calculateTreatmentCost(calculatedMedications, quantity)
    });
  };

  const calculateTreatmentCost = (medications, quantity) => {
    // Rough cost estimation (in USD)
    const medicationCosts = {
      "Amoxicillin": 0.05,
      "Doxycycline": 0.08,
      "Tylosin": 0.12,
      "Amprolium": 0.03,
      "Sulfadimethoxine": 0.04,
      "Toltrazuril": 0.15,
      "Ivermectin": 0.10,
      "Permethrin": 0.02,
      "Diatomaceous Earth": 0.01,
      "Calcium Gluconate": 0.20,
      "Oxytocin": 0.50
    };

    let totalCost = 0;
    medications.forEach(med => {
      const baseCost = medicationCosts[med.name] || 0.05;
      totalCost += baseCost * quantity;
    });

    return totalCost.toFixed(2);
  };

  const handleSaveDiseaseProfile = (profileName) => {
    if (!selectedDisease || !treatment) {
      alert("Please calculate treatment first");
      return;
    }

    const diseaseProfile = {
      id: Date.now().toString(),
      name: profileName,
      disease: selectedDisease,
      diseaseName: diseaseDatabase[selectedDisease].name,
      chickenData: { ...chickenData },
      treatment: { ...treatment },
      createdAt: new Date().toISOString()
    };

    const existingProfiles = JSON.parse(localStorage.getItem('diseaseProfiles') || '[]');
    existingProfiles.push(diseaseProfile);
    localStorage.setItem('diseaseProfiles', JSON.stringify(existingProfiles));
    setSavedDiseaseProfiles(existingProfiles);
    setShowSaveModal(false);
  };

  const handleLoadDiseaseProfile = (profileName) => {
    const profile = savedDiseaseProfiles.find(p => p.name === profileName);
    if (!profile) return;

    setSelectedDisease(profile.disease);
    setChickenData(profile.chickenData);
    setTreatment(profile.treatment);
    setShowLoadModal(false);
  };

  const handleDeleteDiseaseProfile = (profileId) => {
    const updatedProfiles = savedDiseaseProfiles.filter(p => p.id !== profileId);
    localStorage.setItem('diseaseProfiles', JSON.stringify(updatedProfiles));
    setSavedDiseaseProfiles(updatedProfiles);
    setShowDeleteModal(false);
  };

  const openSaveModal = () => {
    if (!selectedDisease || !treatment) {
      alert("Please calculate treatment first");
      return;
    }
    setShowSaveModal(true);
  };

  const openLoadModal = () => {
    if (savedDiseaseProfiles.length === 0) {
      alert("No disease profiles available.");
      return;
    }
    setShowLoadModal(true);
  };

  const openDeleteModal = (profileId) => {
    const profile = savedDiseaseProfiles.find(p => p.id === profileId);
    if (profile) {
      setSelectedProfile(profile);
      setShowDeleteModal(true);
    }
  };


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card shadow-sm p-6" data-aos="fade-up">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center">
          <AlertTriangle className="mr-3 text-red-500" />
          Disease Management System
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Comprehensive disease diagnosis, treatment planning, and recovery tracking for your flock.
        </p>
      </div>

      {/* Disease Selection */}
      <div className="card shadow-sm p-6" data-aos="fade-up">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
          <Heart className="mr-2 text-red-500" />
          Disease Selection
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Disease
            </label>
            <select 
              value={selectedDisease} 
              onChange={(e) => setSelectedDisease(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="">Choose a disease...</option>
              {Object.entries(diseaseDatabase).map(([key, disease]) => (
                <option key={key} value={key}>
                  {disease.name} ({disease.severity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Load Disease Profile
            </label>
            <select 
              onChange={(e) => loadDiseaseProfile(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="">Load saved disease profile...</option>
              {savedDiseaseProfiles.map(profile => (
                <option key={profile.id} value={profile.id}>
                  {profile.name} - {profile.diseaseName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Disease Information */}
        {selectedDisease && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
              {diseaseDatabase[selectedDisease].name} Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Severity:</strong> <span className={`px-2 py-1 rounded text-xs ${
                  diseaseDatabase[selectedDisease].severity === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  diseaseDatabase[selectedDisease].severity === 'High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {diseaseDatabase[selectedDisease].severity}
                </span></p>
                <p><strong>Contagious:</strong> {diseaseDatabase[selectedDisease].contagious ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p><strong>Symptoms:</strong></p>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400">
                  {diseaseDatabase[selectedDisease].symptoms.map((symptom, index) => (
                    <li key={index}>{symptom}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chicken Data Input */}
      <div className="card shadow-sm p-6" data-aos="fade-up">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
          <Activity className="mr-2 text-blue-500" />
          Chicken Data
        </h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Age (weeks)</label>
            <input 
              type="number" 
              value={chickenData.age} 
              onChange={(e) => setChickenData({...chickenData, age: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              placeholder="e.g., 20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Weight (kg)</label>
            <input 
              type="number" 
              step="0.1"
              value={chickenData.weight} 
              onChange={(e) => setChickenData({...chickenData, weight: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              placeholder="e.g., 2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
            <input 
              type="number" 
              value={chickenData.quantity} 
              onChange={(e) => setChickenData({...chickenData, quantity: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              placeholder="e.g., 10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Breed</label>
            <select 
              value={chickenData.breed} 
              onChange={(e) => setChickenData({...chickenData, breed: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="">Select breed...</option>
              <option value="rhode_island">Rhode Island Red</option>
              <option value="leghorn">Leghorn</option>
              <option value="orpington">Orpington</option>
              <option value="sussex">Sussex</option>
              <option value="plymouth">Plymouth Rock</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Environment</label>
            <select 
              value={chickenData.environment} 
              onChange={(e) => setChickenData({...chickenData, environment: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="free_range">Free Range</option>
              <option value="barn">Barn</option>
              <option value="battery">Battery Cage</option>
              <option value="organic">Organic</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={calculateTreatment}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <Pill className="mr-2" />
              Calculate Treatment
            </button>
          </div>
        </div>
      </div>

      {/* Treatment Plan */}
      {treatment && (
        <div className="space-y-6">
          {/* Save Profile Button */}
          <div className="card shadow-sm p-6" data-aos="fade-up">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  Save Disease Profile
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Save this disease treatment plan for future reference
                </p>
              </div>
              <button
                onClick={openSaveModal}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200 flex items-center"
              >
                <Heart className="mr-2" />
                Save Profile
              </button>
            </div>
          </div>

          {/* Weekly Tracking Calendar */}
          <DiseaseTrackingCalendar 
            disease={diseaseDatabase[selectedDisease]} 
            treatment={treatment} 
            chickenData={chickenData} 
          />

          {/* Curative Feeds */}
          <CurativeFeeds 
            disease={selectedDisease} 
            chickenData={chickenData} 
          />

          {/* Medications */}
          <div className="card shadow-sm p-6" data-aos="fade-up">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
              <Pill className="mr-2 text-blue-500" />
              Medication Plan
            </h2>
            
            <div className="space-y-4">
              {treatment.medications.map((med, index) => (
                <div key={index} className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">{med.name}</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Dosage:</strong> {med.calculatedDosage}</p>
                      <p><strong>Frequency:</strong> {med.frequency}</p>
                      <p><strong>Duration:</strong> {med.duration}</p>
                    </div>
                    <div>
                      {med.totalForFlock && (
                        <p className="text-blue-700 dark:text-blue-300"><strong>Flock Total:</strong> {med.totalForFlock}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Saved Disease Profiles Management */}
      {savedDiseaseProfiles.length > 0 && (
        <div className="card shadow-sm p-6" data-aos="fade-up">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
            <Activity className="mr-2 text-purple-500" />
            Saved Disease Profiles
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedDiseaseProfiles.map((profile) => (
              <div
                key={profile.id}
                className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                    {profile.name}
                  </h3>
                  <button
                    onClick={() => openDeleteModal(profile.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
                
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  <p><strong>Disease:</strong> {profile.diseaseName}</p>
                  <p><strong>Chickens:</strong> {profile.chickenData.quantity} ({profile.chickenData.breed})</p>
                  <p><strong>Age:</strong> {profile.chickenData.age} weeks</p>
                  <p><strong>Saved:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
                </div>
                
                <button
                  onClick={() => handleLoadDiseaseProfile(profile.name)}
                  className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors duration-200"
                >
                  Load Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <ProfileNameModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveDiseaseProfile}
        title="Save Disease Profile"
        placeholder="Enter disease profile name..."
        existingProfiles={savedDiseaseProfiles.map(p => p.name)}
        type="disease"
      />

      <ProfileNameModal
        isOpen={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        onSave={handleLoadDiseaseProfile}
        title="Load Disease Profile"
        placeholder="Select or enter profile name..."
        existingProfiles={savedDiseaseProfiles.map(p => p.name)}
        type="disease"
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => handleDeleteDiseaseProfile(selectedProfile?.id)}
        title="Delete Disease Profile"
        message="Are you sure you want to delete this disease profile?"
        confirmText="Delete"
        type="danger"
        destructive={true}
        itemName={selectedProfile?.name}
      />
    </div>
  );
}
