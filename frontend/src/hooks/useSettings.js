import chickenApiService from '../services/chickenApi.js';

// storage + helpers centralizados
const KEY_PREFIX = "chickenProfile_";
const HIST_PREFIX = "chickenHistory_";

// Get current user ID from localStorage
function getCurrentUserId() {
  const userData = localStorage.getItem('user_data');
  if (userData) {
    const parsedUser = JSON.parse(userData);
    return parsedUser.userId;
  }
  return null;
}

export async function listProfiles() {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error("User must be logged in to access profiles");
  }

  try {
    const response = await chickenApiService.getProfiles(userId);
    return response.map(profile => profile.name);
  } catch (error) {
    console.error('Error fetching profiles from API:', error);
    throw error;
  }
}

export async function saveProfile(name, data) {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error("User must be logged in to save profiles");
  }

  try {
    // Convert camelCase to snake_case for API compatibility
    const convertedData = {
      breed: data.breed,
      age: data.age,
      weight: data.weight,
      quantity: data.quantity,
      environment: data.environment,
      season: data.season,
      purpose: data.purpose,
      egg_purpose: data.eggPurpose,
      stress_level: data.stressLevel,
      feed_type: data.feedType,
      feed_brand: data.feedBrand,
      feed_cost: data.feedCost,
      egg_price: data.eggPrice,
      molting: data.molting,
      vaccination: data.vaccination
    };

    const profileData = {
      user_id: userId,
      name: name,
      ...convertedData
    };
    
    await chickenApiService.saveProfile(profileData);
  } catch (error) {
    console.error('Error saving profile to API:', error);
    throw error;
  }
}

export async function loadProfile(name) {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error("User must be logged in to load profiles");
  }

  try {
    const response = await chickenApiService.getProfiles(userId);
    const profile = response.find(p => p.name === name);
    if (!profile) return null;
    
    // Convert snake_case to camelCase for frontend compatibility
    const convertedProfile = {
      breed: profile.breed,
      age: profile.age,
      weight: profile.weight,
      quantity: profile.quantity,
      environment: profile.environment,
      season: profile.season,
      purpose: profile.purpose,
      eggPurpose: profile.egg_purpose,
      stressLevel: profile.stress_level,
      feedType: profile.feed_type,
      feedBrand: profile.feed_brand,
      feedCost: profile.feed_cost,
      eggPrice: profile.egg_price,
      molting: profile.molting,
      vaccination: profile.vaccination
    };
    
    return convertedProfile;
  } catch (error) {
    console.error('Error loading profile from API:', error);
    throw error;
  }
}

export async function removeProfile(name) {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error("User must be logged in to remove profiles");
  }

  try {
    // First, get the profile to find its ID
    const response = await chickenApiService.getProfiles(userId);
    const profile = response.find(p => p.name === name);
    if (!profile) {
      throw new Error("Profile not found");
    }
    
    console.log('Profile found:', profile);
    console.log('Profile ID:', profile.id);
    console.log('Profile name:', profile.name);
    
    // Delete the profile using its ID
    await chickenApiService.deleteProfile(profile.id);
  } catch (error) {
    console.error('Error removing profile from API:', error);
    throw error;
  }
}

export function getHistory(name) {
  const raw = localStorage.getItem(HIST_PREFIX + name);
  return raw ? JSON.parse(raw) : [];
}

export function addHistory(name, rec) {
  const arr = getHistory(name);
  arr.push(rec);
  arr.sort((a, b) => new Date(a.date) - new Date(b.date));
  localStorage.setItem(HIST_PREFIX + name, JSON.stringify(arr));
}
