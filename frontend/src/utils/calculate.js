// All logic migrated from the original script into a pure function
export function calculateRecommendations({
  breed, age, weight, quantity, health, environment, season, eggPurpose, stressLevel, feedType
} , overrides = {}) {
  const parsedAge = Number(age);
  const parsedWeightKg = Number(weight);
  const parsedQty = Number(quantity);

  // Hide egg production if chicks
  const showEggProduction = parsedAge >= 18;

  // Nutrition composition
  let protein, carbs, fats, fiber;
  if (parsedAge < 8) { // Chicks
    protein = 20; carbs = 50; fats = 5; fiber = 3;
  } else if (parsedAge < 20) { // Growers
    protein = 18; carbs = 55; fats = 4; fiber = 4;
  } else { // Layers
    protein = 16; carbs = 60; fats = 3; fiber = 5;
  }

  // Adjust for breed
  if (breed === 'rhode_island' || breed === 'orpington') {
    protein += 1; fats += 0.5;
  } else if (breed === 'leghorn') {
    protein -= 1;
  }

  // Adjust for health
  if (health === 'respiratory') {
    protein += 1;
  } else if (health === 'digestive') {
    fiber += 2;
  } else if (health === 'parasites') {
    protein += 0.5;
  }

  // Feeding amount per chicken (grams/day)
  let amountPerChicken;
  if (parsedAge < 8) {
    amountPerChicken = 30 + (parsedAge * 5);
  } else if (parsedAge < 20) {
    amountPerChicken = 70 + ((parsedAge - 8) * 2);
  } else {
    amountPerChicken = 110 + (parsedWeightKg * 5);
  }

  // Adjust for breed
  if (breed === 'rhode_island' || breed === 'orpington') {
    amountPerChicken *= 1.1;
  } else if (breed === 'leghorn') {
    amountPerChicken *= 0.9;
  }

  // Total amount in kg
  const totalAmountKg = (amountPerChicken * parsedQty) / 1000;

  // Feeding times
  const feedingTimes = [];
  if (parsedAge < 4) {
    feedingTimes.push('07:00', '12:00', '17:00');
  } else if (parsedAge < 12) {
    feedingTimes.push('07:30', '16:00');
  } else {
    feedingTimes.push('08:00');
    if (parsedWeightKg > 2) feedingTimes.push('15:00');
  }

  // Health notes
  let healthNotes = 'Nenhuma observação especial.';
  if (health === 'respiratory') {
    healthNotes = 'Considere adicionar suplementos vitamínicos à água para fortalecer o sistema respiratório.';
  } else if (health === 'digestive') {
    healthNotes = 'Aumente a quantidade de fibras na dieta e forneça probióticos se possível.';
  } else if (health === 'parasites') {
    healthNotes = 'Além da alimentação recomendada, considere tratamento antiparasitário conforme orientação veterinária.';
  }

  // Water needs (ratio configurable via settings; defaults to 2:1)
  const ratio = Number(overrides.waterRatio || 2);
  const waterPerChickenG = amountPerChicken * ratio;
  const totalWaterL = (waterPerChickenG * parsedQty) / 1000;

  // Supplements
  const supplements = [];
  if (parsedAge < 8) supplements.push('Vitamina D3', 'Probióticos');
  if (parsedAge >= 18) supplements.push('Cálcio (3-4%)', 'Óleo de peixe (1%)');
  if (health === 'respiratory') supplements.push('Vitamina C', 'Alho em pó (0.5%)');
  if (health === 'digestive') supplements.push('Probióticos', 'Argila bentonítica');

  // Egg production
  let eggProduction = 0;
  let layingRate = 0;
  if (parsedAge >= 18) {
    layingRate = 80 - (parsedAge - 18);
    if (layingRate < 30) layingRate = 30;
    if (breed === 'leghorn') layingRate += 10;
    if (health !== 'healthy') layingRate -= 10;
    if (environment === 'free_range') layingRate += 5;
    if (season === 'winter') layingRate -= 5;
    if (stressLevel === 'high') layingRate -= 15;
    eggProduction = Math.round((parsedQty * (layingRate / 100)) * 10) / 10;
  }

  // Feed costs
  const prices = overrides.feedPrices || { commercial: 0.80, homemade: 0.50, mixed: 0.65 };
  const feedPricePerKg = feedType === 'commercial' ? prices.commercial : (feedType === 'homemade' ? prices.homemade : prices.mixed);
  const dailyCost = Number((totalAmountKg * feedPricePerKg).toFixed(2));
  const monthlyCost = Number((dailyCost * 30).toFixed(2));

  // Growth projection
  let projectedWeight = parsedWeightKg;
  let dailyGain = 0;
  if (parsedAge < 20) {
    dailyGain = (breed === 'leghorn' ? 8 : 10);
    if (environment === 'free_range') dailyGain -= 1;
    if (stressLevel === 'high') dailyGain -= 2;
    projectedWeight = parsedWeightKg + (dailyGain * 28 / 1000);
  }

  // Feed conversion and efficiency
  const feedPerEgg = parsedAge >= 18 ? Number((amountPerChicken / (layingRate / 100) / 1000).toFixed(2)) : null;
  const feedEfficiency = parsedAge >= 18 ? Number((100 - ((amountPerChicken / (layingRate / 100)) / 1.5 * 100)).toFixed(1)) : null;

  // Egg quality
  let eggSize = null;
  let yolkColor = null;
  if (parsedAge >= 18) {
    eggSize = (breed === 'leghorn') ? 60 : 65;
    yolkColor = 'Média';
    if (environment === 'free_range') yolkColor = 'Forte';
    if (feedType === 'homemade') yolkColor = 'Média a forte';
    if (season === 'summer' && environment === 'free_range') yolkColor = 'Muito forte';
  }

  return {
    showEggProduction,
    nutrition: { protein, carbs, fats, fiber },
    feedingTimes,
    healthNotes,
    water: { totalWaterL, ratio: `${overrides?.waterRatio || 2} : 1` },
    supplements,
    eggs: showEggProduction ? { eggProduction, layingRate } : null,
    costs: { dailyCost, monthlyCost },
    growth: parsedAge < 20 ? { projectedWeight: Number(projectedWeight.toFixed(2)), dailyGain } : null,
    conversion: showEggProduction ? { feedPerEgg, feedEfficiency } : null,
    eggQuality: showEggProduction ? { eggSize, yolkColor } : null,
    amounts: { totalAmountKg: Number(totalAmountKg.toFixed(1)), amountPerChicken: Math.round(amountPerChicken) }
  }
}
