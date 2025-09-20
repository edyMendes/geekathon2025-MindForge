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
};

export function optimalFeedingTimes(age, season, environment, lightHours, health, stress) {
  let baseTimes;
  if (age < 4) baseTimes = [...schedule.base.chick];
  else if (age < 12) baseTimes = [...schedule.base.young];
  else baseTimes = [...schedule.base.adult];

  const saz = schedule.seasonal[season] || { morning: 0, evening: 0 };
  const env = schedule.env[environment] || { morning: 0, evening: 0 };

  let adjusted = baseTimes.map((t) => {
    let minutes = toMinutes(t);
    minutes += saz.morning + env.morning;
    if (lightHours < 12) minutes += 30;
    if (lightHours > 16) minutes -= 30;
    if (health === "respiratory") minutes += 15;
    if (stress === "high") minutes += 20;
    minutes = Math.max(300, Math.min(1200, minutes)); // 05:00–20:00
    return minutes;
  });

  if (adjusted.length > 1) {
    adjusted[adjusted.length - 1] += saz.evening + env.evening;
  }
  adjusted.sort((a, b) => a - b);
  for (let i = 1; i < adjusted.length; i++) {
    if (adjusted[i] - adjusted[i - 1] < 240) adjusted[i] = adjusted[i - 1] + 240;
    adjusted[i] = Math.min(1200, adjusted[i]);
  }
  return adjusted.map(fromMinutes);
}

// ---------- precise feed amount ----------
export function preciseFeedAmount(breed, age, weight, health, environment, season, stress, light, molting) {
  let base;
  if (age < 8) base = 30 + age * 5 + weight * 2;
  else if (age < 20) base = 70 + (age - 8) * 2 + weight * 3;
  else base = 110 + weight * 5;

  const breedK = { rhode_island: 1.1, orpington: 1.1, plymouth: 1.05, sussex: 1.0, leghorn: 0.9, outra: 1.0 };
  base *= breedK[breed] || 1;

  const healthK = { healthy: 1.0, respiratory: 1.1, digestive: 0.9, parasites: 1.05, other: 1.0 };
  base *= healthK[health] || 1;

  const envK = { free_range: 0.9, barn: 1.0, battery: 1.0, organic: 0.95 };
  base *= envK[environment] || 1;

  const seasonK = { summer: 0.95, winter: 1.1, spring: 1.0, autumn: 1.05 };
  base *= seasonK[season] || 1;

  const stressK = { low: 1.0, medium: 1.05, high: 1.1 };
  base *= stressK[stress] || 1;

  if (light < 12) base *= 1.05;
  if (light > 16) base *= 0.95;

  const moltK = { no: 1.0, partial: 1.1, yes: 1.2 };
  base *= moltK[molting] || 1;

  return Math.round(base); // g/gal/dia
}
