import { useState } from "react";
import { Utensils, Leaf, Zap, Heart, Shield, Droplets } from "lucide-react";

export default function CurativeFeeds({ disease, chickenData }) {
  const [selectedFeed, setSelectedFeed] = useState(null);

  // Curative feed database with healing properties
  const curativeFeeds = {
    "respiratory_infection": [
      {
        name: "Garlic & Oregano Mix",
        ingredients: ["Garlic powder", "Oregano oil", "Vitamin C", "Echinacea"],
        benefits: ["Antibacterial", "Immune boost", "Respiratory support"],
        dosage: "2-3g per chicken daily",
        preparation: "Mix with regular feed",
        duration: "7-10 days",
        icon: <Shield className="w-6 h-6 text-green-500" />,
        color: "green"
      },
      {
        name: "Honey & Lemon Feed",
        ingredients: ["Raw honey", "Lemon juice", "Ginger powder", "Thyme"],
        benefits: ["Soothes throat", "Antioxidant", "Natural antibiotic"],
        dosage: "1-2g per chicken daily",
        preparation: "Mix with warm water, add to feed",
        duration: "5-7 days",
        icon: <Droplets className="w-6 h-6 text-yellow-500" />,
        color: "yellow"
      },
      {
        name: "Probiotic Recovery Mix",
        ingredients: ["Probiotics", "Prebiotics", "Digestive enzymes", "B-vitamins"],
        benefits: ["Gut health", "Immune support", "Nutrient absorption"],
        dosage: "5g per chicken daily",
        preparation: "Sprinkle over feed",
        duration: "10-14 days",
        icon: <Heart className="w-6 h-6 text-pink-500" />,
        color: "pink"
      }
    ],
    "coccidiosis": [
      {
        name: "Apple Cider Vinegar Mix",
        ingredients: ["Apple cider vinegar", "Garlic", "Oregano", "Probiotics"],
        benefits: ["Antimicrobial", "Gut pH balance", "Parasite control"],
        dosage: "1ml per liter of water",
        preparation: "Add to drinking water",
        duration: "7-10 days",
        icon: <Droplets className="w-6 h-6 text-amber-500" />,
        color: "amber"
      },
      {
        name: "Pumpkin Seed Power Feed",
        ingredients: ["Pumpkin seeds", "Diatomaceous earth", "Bentonite clay", "Psyllium"],
        benefits: ["Natural dewormer", "Digestive support", "Toxin binding"],
        dosage: "3-4g per chicken daily",
        preparation: "Grind seeds, mix with feed",
        duration: "5-7 days",
        icon: <Leaf className="w-6 h-6 text-orange-500" />,
        color: "orange"
      },
      {
        name: "Electrolyte Recovery Mix",
        ingredients: ["Electrolytes", "Glucose", "Sodium", "Potassium", "Magnesium"],
        benefits: ["Hydration", "Energy restoration", "Mineral balance"],
        dosage: "10g per liter of water",
        preparation: "Dissolve in water",
        duration: "3-5 days",
        icon: <Zap className="w-6 h-6 text-blue-500" />,
        color: "blue"
      }
    ],
    "mites_lice": [
      {
        name: "Diatomaceous Earth Dust",
        ingredients: ["Food-grade diatomaceous earth", "Neem powder", "Essential oils"],
        benefits: ["Parasite control", "Skin healing", "Natural pesticide"],
        dosage: "Dust application",
        preparation: "Apply directly to feathers and skin",
        duration: "2-3 weeks",
        icon: <Shield className="w-6 h-6 text-gray-500" />,
        color: "gray"
      },
      {
        name: "Herbal Repellent Mix",
        ingredients: ["Lavender", "Rosemary", "Eucalyptus", "Tea tree oil"],
        benefits: ["Repellent", "Skin soothing", "Antimicrobial"],
        dosage: "Spray application",
        preparation: "Mix with water, spray on birds",
        duration: "Daily for 1 week",
        icon: <Leaf className="w-6 h-6 text-purple-500" />,
        color: "purple"
      }
    ],
    "egg_binding": [
      {
        name: "Calcium Boost Mix",
        ingredients: ["Calcium carbonate", "Vitamin D3", "Magnesium", "Phosphorus"],
        benefits: ["Muscle contraction", "Bone strength", "Egg shell quality"],
        dosage: "2-3g per chicken daily",
        preparation: "Mix with regular feed",
        duration: "5-7 days",
        icon: <Zap className="w-6 h-6 text-white-500" />,
        color: "white"
      },
      {
        name: "Warm Oil Treatment",
        ingredients: ["Olive oil", "Coconut oil", "Vitamin E", "Lavender oil"],
        benefits: ["Lubrication", "Muscle relaxation", "Pain relief"],
        dosage: "1-2ml per chicken",
        preparation: "Warm oil, gentle massage",
        duration: "As needed",
        icon: <Droplets className="w-6 h-6 text-green-500" />,
        color: "green"
      }
    ],
    "marek_disease": [
      {
        name: "Immune Support Mix",
        ingredients: ["Echinacea", "Astragalus", "Mushroom extracts", "Vitamin C"],
        benefits: ["Immune boost", "Antioxidant", "Supportive care"],
        dosage: "3-4g per chicken daily",
        preparation: "Mix with feed",
        duration: "Long-term",
        icon: <Heart className="w-6 h-6 text-red-500" />,
        color: "red"
      },
      {
        name: "Comfort Care Feed",
        ingredients: ["Soft grains", "Probiotics", "Omega-3", "Anti-inflammatory herbs"],
        benefits: ["Easy digestion", "Comfort", "Nutritional support"],
        dosage: "Ad libitum",
        preparation: "Soft, easily digestible",
        duration: "Ongoing",
        icon: <Utensils className="w-6 h-6 text-blue-500" />,
        color: "blue"
      }
    ],
    "newcastle_disease": [
      {
        name: "Emergency Support Mix",
        ingredients: ["Electrolytes", "Glucose", "Vitamin C", "Echinacea"],
        benefits: ["Hydration", "Energy", "Immune support"],
        dosage: "5g per liter of water",
        preparation: "Add to drinking water",
        duration: "As needed",
        icon: <Zap className="w-6 h-6 text-red-500" />,
        color: "red"
      }
    ]
  };

  const getColorClasses = (color) => {
    const colorMap = {
      green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800",
      yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800",
      pink: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 border-pink-200 dark:border-pink-800",
      amber: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800",
      orange: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-200 dark:border-orange-800",
      blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800",
      gray: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-800",
      purple: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-800",
      white: "bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600",
      red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800"
    };
    return colorMap[color] || "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800";
  };

  const calculateFeedAmount = (feed) => {
    if (!chickenData.quantity) return feed.dosage;
    
    const quantity = parseInt(chickenData.quantity);
    const dosageMatch = feed.dosage.match(/(\d+(?:\.\d+)?)\s*(g|ml|kg)/);
    
    if (dosageMatch) {
      const amount = parseFloat(dosageMatch[1]);
      const unit = dosageMatch[2];
      const totalAmount = amount * quantity;
      
      if (unit === "g" && totalAmount >= 1000) {
        return `${(totalAmount / 1000).toFixed(1)}kg per flock`;
      } else if (unit === "ml" && totalAmount >= 1000) {
        return `${(totalAmount / 1000).toFixed(1)}L per flock`;
      } else {
        return `${totalAmount.toFixed(1)}${unit} per flock`;
      }
    }
    
    return feed.dosage;
  };

  if (!disease) {
    return (
      <div className="card shadow-sm p-6" data-aos="fade-up">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center">
          <Utensils className="mr-2 text-green-500" />
          Curative Feeds
        </h2>
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          Select a disease to see curative feed recommendations.
        </div>
      </div>
    );
  }

  const availableFeeds = curativeFeeds[disease] || [];

  return (
    <div className="card shadow-sm p-6" data-aos="fade-up">
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center">
        <Utensils className="mr-2 text-green-500" />
        Curative Feeds for {disease.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {availableFeeds.map((feed, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105 ${
              selectedFeed === index
                ? "ring-2 ring-emerald-500 shadow-lg"
                : "hover:shadow-md"
            } ${getColorClasses(feed.color)}`}
            onClick={() => setSelectedFeed(selectedFeed === index ? null : index)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {feed.icon}
                <h3 className="font-semibold">{feed.name}</h3>
              </div>
              <div className="text-xs px-2 py-1 bg-white dark:bg-slate-800 rounded">
                {feed.duration}
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <strong>Dosage:</strong> {calculateFeedAmount(feed)}
              </div>
              <div>
                <strong>Preparation:</strong> {feed.preparation}
              </div>
              <div>
                <strong>Benefits:</strong>
                <ul className="list-disc list-inside mt-1">
                  {feed.benefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Feed Information */}
      {selectedFeed !== null && availableFeeds[selectedFeed] && (
        <div className="mt-6 p-6 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
            {availableFeeds[selectedFeed].icon}
            <span className="ml-2">{availableFeeds[selectedFeed].name}</span>
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Ingredients</h4>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
                {availableFeeds[selectedFeed].ingredients.map((ingredient, idx) => (
                  <li key={idx}>{ingredient}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Instructions</h4>
              <div className="space-y-2 text-slate-600 dark:text-slate-400">
                <p><strong>Dosage:</strong> {calculateFeedAmount(availableFeeds[selectedFeed])}</p>
                <p><strong>Preparation:</strong> {availableFeeds[selectedFeed].preparation}</p>
                <p><strong>Duration:</strong> {availableFeeds[selectedFeed].duration}</p>
                <p><strong>Frequency:</strong> {availableFeeds[selectedFeed].dosage.includes("daily") ? "Daily" : "As needed"}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Healing Benefits</h4>
            <div className="flex flex-wrap gap-2">
              {availableFeeds[selectedFeed].benefits.map((benefit, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded-full text-sm"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* General Curative Feed Tips */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
          <Leaf className="w-4 h-4 mr-2" />
          Curative Feed Tips
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Always use food-grade ingredients for safety</li>
          <li>• Introduce new feeds gradually to avoid digestive upset</li>
          <li>• Monitor chicken response and adjust dosage as needed</li>
          <li>• Store curative feeds in cool, dry places</li>
          <li>• Consult a veterinarian for severe cases</li>
          <li>• Combine with proper medication for best results</li>
        </ul>
      </div>
    </div>
  );
}
