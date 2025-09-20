// ---------- util time ----------
const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const fromMinutes = (min) => {
  const h = Math.floor(min / 60),
    m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// ---------- feeding schedule rules ----------
const schedule = {
  base: {
    chick: ["07:00", "12:00", "17:00"],
    young: ["07:30", "16:00"],
    adult: ["08:00", "15:00"],
  },
  seasonal: {
    summer: { morning: -30, evening: 30 },
    winter: { morning: 30, evening: -30 },
    spring: { morning: 0, evening: 0 },
    autumn: { morning: 15, evening: -15 },
  },
  env: {
    free_range: { morning: -15, evening: 15 },
    barn: { morning: 0, evening: 0 },
    battery: { morning: 0, evening: 0 },
    organic: { morning: -15, evening: 15 },
  },
  purpose: {
    eggs: { morning: -15, evening: 15, frequency: 0 }, // Consistent morning/evening
    breeding: { morning: 0, evening: 0, frequency: 0 }, // Balanced schedule
    meat: { morning: -30, evening: 30, frequency: 1 }, // More frequent feeding
  },
};

export function optimalFeedingTimes(age, season, environment, stress, purpose = "eggs") {
  let baseTimes;
  if (age < 4) baseTimes = [...schedule.base.chick];
  else if (age < 12) baseTimes = [...schedule.base.young];
  else baseTimes = [...schedule.base.adult];

  // Adjust base times based on purpose
  if (purpose === "meat" && age >= 4) {
    // Meat production: more frequent feeding
    baseTimes = ["06:30", "10:30", "14:30", "18:30"];
  } else if (purpose === "eggs" && age >= 12) {
    // Egg production: consistent morning/evening
    baseTimes = ["07:00", "17:00"];
  } else if (purpose === "breeding" && age >= 12) {
    // Breeding: balanced schedule
    baseTimes = ["08:00", "14:00", "18:00"];
  }

  const saz = schedule.seasonal[season] || { morning: 0, evening: 0 };
  const env = schedule.env[environment] || { morning: 0, evening: 0 };
  const purp = schedule.purpose[purpose] || { morning: 0, evening: 0, frequency: 0 };

  let adjusted = baseTimes.map((t) => {
    let minutes = toMinutes(t);
    minutes += saz.morning + env.morning + purp.morning;
    if (stress === "high") minutes += 20;
    minutes = Math.max(300, Math.min(1200, minutes)); // 05:00–20:00
    return minutes;
  });

  if (adjusted.length > 1) {
    adjusted[adjusted.length - 1] += saz.evening + env.evening + purp.evening;
  }
  adjusted.sort((a, b) => a - b);
  for (let i = 1; i < adjusted.length; i++) {
    if (adjusted[i] - adjusted[i - 1] < 240) adjusted[i] = adjusted[i - 1] + 240;
    adjusted[i] = Math.min(1200, adjusted[i]);
  }
  return adjusted.map(fromMinutes);
}

// ---------- precise feed amount ----------
export function preciseFeedAmount(breed, age, weight, environment, season, stress, molting, purpose = "eggs") {
  let base;
  if (age < 8) base = 30 + age * 5 + weight * 2;
  else if (age < 20) base = 70 + (age - 8) * 2 + weight * 3;
  else base = 110 + weight * 5;

  const breedK = { rhode_island: 1.1, orpington: 1.1, plymouth: 1.05, sussex: 1.0, leghorn: 0.9, outra: 1.0 };
  base *= breedK[breed] || 1;

  const envK = { free_range: 0.9, barn: 1.0, battery: 1.0, organic: 0.95 };
  base *= envK[environment] || 1;

  const seasonK = { summer: 0.95, winter: 1.1, spring: 1.0, autumn: 1.05 };
  base *= seasonK[season] || 1;

  const stressK = { low: 1.0, medium: 1.05, high: 1.1 };
  base *= stressK[stress] || 1;

  // Purpose-specific adjustments
  const purposeK = { 
    eggs: 1.0,        // Standard for egg production
    breeding: 1.1,    // 10% more for reproductive health
    meat: 1.2         // 20% more for rapid growth
  };
  base *= purposeK[purpose] || 1.0;

  const moltK = { no: 1.0, partial: 1.1, yes: 1.2 };
  base *= moltK[molting] || 1;

  return Math.round(base); // g/gal/dia
}

// ---------- seasonal adjustments ----------
export function getSeasonalFeedAdjustments(season, age, purpose) {
  const seasonalAdjustments = {
    winter: {
      energy_multiplier: 1.15, // +15% energy
      protein_adjustment: 0, // No change
      calcium_boost: 1.2, // +20% calcium
      feeding_frequency: "3-4 times daily",
      water_temperature: "lukewarm",
      special_notes: "Increase energy for body heat maintenance",
      priority: "high"
    },
    summer: {
      energy_multiplier: 0.9, // -10% energy
      protein_adjustment: 0, // No change
      calcium_boost: 1.0, // Normal calcium
      feeding_frequency: "2-3 times daily",
      water_temperature: "cool",
      special_notes: "Reduce energy to prevent overheating",
      priority: "high"
    },
    spring: {
      energy_multiplier: 1.05, // +5% energy
      protein_adjustment: 0.1, // +10% protein for growth
      calcium_boost: 1.1, // +10% calcium
      feeding_frequency: "3 times daily",
      water_temperature: "room temperature",
      special_notes: "Support growth and egg production",
      priority: "medium"
    },
    autumn: {
      energy_multiplier: 1.1, // +10% energy
      protein_adjustment: 0, // Normal protein
      calcium_boost: 1.15, // +15% calcium
      feeding_frequency: "3 times daily",
      water_temperature: "room temperature",
      special_notes: "Prepare for winter conditions",
      priority: "medium"
    }
  };

  return seasonalAdjustments[season] || seasonalAdjustments.summer;
}

// ---------- additional recommendations ----------
export function getAdditionalFeedRecommendations(breed, age, environment, season, purpose) {
  const recommendations = {
    general: [
      "Always provide fresh, clean water",
      "Feed at consistent times daily",
      "Monitor feed consumption patterns",
      "Store feed in cool, dry place"
    ],
    seasonal: {
      winter: [
        "Increase feeding frequency to maintain body heat",
        "Provide lukewarm water to prevent freezing",
        "Add extra fat for insulation",
        "Monitor for frostbite on combs and wattles"
      ],
      summer: [
        "Feed during cooler hours (6-8 AM, 6-8 PM)",
        "Ensure constant access to cool water",
        "Add electrolytes to drinking water",
        "Provide shade and ventilation"
      ],
      spring: [
        "Support growth with higher protein",
        "Prepare for increased egg production",
        "Monitor for spring allergies",
        "Gradually increase feeding amounts"
      ],
      autumn: [
        "Prepare for winter with energy-rich feed",
        "Support molting with extra protein",
        "Reduce feeding as daylight decreases",
        "Prepare for reduced egg production"
      ]
    },
    breed_specific: {
      leghorn: [
        "Monitor calcium levels closely for egg production",
        "Provide extra protein during peak laying",
        "Watch for calcium deficiency signs"
      ],
      rhode_island: [
        "Standard feeding recommendations apply",
        "Monitor for obesity in older birds",
        "Adjust feed based on activity level"
      ],
      orpington: [
        "May need slightly more feed due to size",
        "Monitor for rapid weight gain",
        "Adjust portions based on body condition"
      ],
      sussex: [
        "Good foragers - adjust free-range feeding",
        "Monitor for overeating in confined spaces",
        "Excellent egg producers - ensure adequate calcium"
      ],
      plymouth: [
        "Dual-purpose breed - balance growth and production",
        "Monitor body condition regularly",
        "Adjust feed based on primary purpose"
      ],
      outra: [
        "Monitor individual bird needs",
        "Adjust based on observed behavior",
        "Consult breed-specific guidelines"
      ]
    },
    age_specific: {
      chick: [
        "Use starter feed (20-24% protein)",
        "Feed 4-6 times daily",
        "Provide chick grit for digestion",
        "Monitor growth rate weekly"
      ],
      pullet: [
        "Transition to grower feed (16-18% protein)",
        "Feed 3 times daily",
        "Prepare for first egg",
        "Monitor body condition"
      ],
      laying: [
        "Use layer feed (16-18% protein, 3.5% calcium)",
        "Feed 2-3 times daily",
        "Monitor egg production and quality",
        "Adjust feed based on production"
      ],
      senior: [
        "May need softer feed for older birds",
        "Monitor for age-related issues",
        "Adjust portions based on activity",
        "Consider supplements for joint health"
      ]
    },
    environment_specific: {
      free_range: [
        "Reduce commercial feed by 20-30%",
        "Provide grit for natural foraging",
        "Monitor for overeating when confined",
        "Ensure access to natural vegetation"
      ],
      barn: [
        "Standard feeding recommendations apply",
        "Monitor for boredom-related overeating",
        "Provide environmental enrichment",
        "Ensure adequate space per bird"
      ],
      battery: [
        "Precise portion control essential",
        "Monitor for stress-related eating",
        "Ensure adequate calcium for egg production",
        "Regular health checks due to confinement"
      ],
      organic: [
        "Use certified organic feed only",
        "Monitor for natural pest resistance",
        "Ensure adequate protein from organic sources",
        "Consider seasonal availability of organic ingredients"
      ]
    },
    purpose_specific: {
      eggs: [
        "Maintain consistent protein levels (16-18%)",
        "Ensure adequate calcium (3.5-4%)",
        "Monitor egg quality and shell strength",
        "Adjust feed based on production rates"
      ],
      breeding: [
        "Higher protein during breeding season (18-20%)",
        "Ensure adequate vitamins and minerals",
        "Monitor body condition of breeding stock",
        "Provide extra nutrition for egg production"
      ],
      meat: [
        "High protein for rapid growth (20-24%)",
        "Monitor growth rates and feed conversion",
        "Adjust portions based on target weight",
        "Consider finishing feed for final weeks"
      ]
    }
  };

  // Determine age category
  let ageCategory = 'laying';
  if (age < 8) ageCategory = 'chick';
  else if (age < 20) ageCategory = 'pullet';

  return {
    general: recommendations.general,
    seasonal: recommendations.seasonal[season] || [],
    breed: recommendations.breed_specific[breed] || [],
    age: recommendations.age_specific[ageCategory] || [],
    environment: recommendations.environment_specific[environment] || [],
    purpose: recommendations.purpose_specific[purpose] || []
  };
}

// ---------- calculate adjusted feed amount with seasonal adjustments ----------
export function calculateSeasonalFeedAmount(breed, age, weight, environment, season, stress, molting, purpose = "eggs") {
  // Get base amount
  const baseAmount = preciseFeedAmount(breed, age, weight, environment, season, stress, molting, purpose);
  
  // Get seasonal adjustments
  const seasonalAdjustments = getSeasonalFeedAdjustments(season, age, purpose);
  
  // Apply seasonal energy multiplier
  const adjustedAmount = Math.round(baseAmount * seasonalAdjustments.energy_multiplier);
  
  return {
    baseAmount,
    adjustedAmount,
    seasonalAdjustments,
    energyIncrease: Math.round((seasonalAdjustments.energy_multiplier - 1) * 100),
    proteinIncrease: Math.round(seasonalAdjustments.protein_adjustment * 100),
    calciumIncrease: Math.round((seasonalAdjustments.calcium_boost - 1) * 100)
  };
}
