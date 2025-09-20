import { getBedrockApiUrl, getBedrockEndpoints, isBedrockConfigured } from '../config/api.js';
import { getAdditionalFeedRecommendations } from '../utils/calculate.js';

class BedrockApiService {
  constructor() {
    this.endpoints = getBedrockEndpoints();
    this.isConfigured = isBedrockConfigured();
  }

  // Method to get authentication headers for Bedrock API
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Get Bedrock token from localStorage or environment
    const token = localStorage.getItem('bedrock_token') || import.meta.env.VITE_BEDROCK_TOKEN;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Method to make requests to Bedrock API
  async makeRequest(endpoint, options = {}) {
    if (!this.isConfigured) {
      throw new Error('Bedrock API is not configured. Please set VITE_BEDROCK_API_BASE_URL environment variable.');
    }

    const url = getBedrockApiUrl(endpoint);
    const config = {
      method: 'GET',
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Bedrock API Error: ${response.status} ${response.statusText} - ${errorData.detail || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Bedrock API request failed:', error);
      throw error;
    }
  }

  // Calculate feed recommendations using Bedrock API
  async calculateFeed(chickenInfo) {
    const payload = this.transformChickenData(chickenInfo);
    
    return this.makeRequest(this.endpoints.CALCULATE_FEED, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Get feed recommendations using Bedrock API
  async recommendFeed(chickenInfo) {
    const payload = this.transformChickenData(chickenInfo);
    
    return this.makeRequest(this.endpoints.RECOMMEND_FEED, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Get weekly recipes using Bedrock API
  async getWeeklyRecipes(chickenInfo) {
    const payload = this.transformChickenData(chickenInfo);
    
    return this.makeRequest(this.endpoints.WEEKLY_RECIPES, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Health check for Bedrock API
  async healthCheck() {
    return this.makeRequest(this.endpoints.HEALTH_CHECK);
  }

  // Get current season from Bedrock API
  async getCurrentSeason() {
    return this.makeRequest(this.endpoints.SEASONS);
  }

  // Transform frontend form data to Bedrock API format
  transformChickenData(formData) {
    const breedMapping = {
      'rhode_island': 'Rhode Island Red',
      'leghorn': 'White Leghorn',
      'sussex': 'Sussex',
      'orpington': 'Orpington',
      'plymouth': 'Plymouth Rock',
      'outra': 'Other'
    };

    const environmentMapping = {
      'free_range': 'free range',
      'barn': 'barn',
      'battery': 'battery cage',
      'organic': 'organic'
    };

    const purposeMapping = {
      'eggs': 'eggs',
      'breeding': 'breeding',
      'meat': 'meat production'
    };

    return {
      count: parseInt(formData.quantity) || 1,
      breed: breedMapping[formData.breed] || 'Other',
      average_weight_kg: parseFloat(formData.weight) || 0,
      age_weeks: parseInt(formData.age) || 0,
      environment: environmentMapping[formData.environment] || 'free range',
      purpose: purposeMapping[formData.purpose] || 'eggs',
      season: formData.season || 'summer'
    };
  }

  // Transform Bedrock API response to frontend format
  async transformBedrockResponse(bedrockData, originalFormData) {
    try {
      // Extract data from Bedrock response structure
      const feedCalculation = bedrockData?.feed_calculation || {};
      const nutritionalContext = bedrockData?.nutritional_context || {};
      const feedComposition = nutritionalContext?.feed_composition || {};
      const seasonalAdjustments = bedrockData?.seasonal_adjustments || {};
      const additionalRecommendations = bedrockData?.additional_recommendations || [];
    
    // Extract feed calculation data
    const {
      total_quantity_per_day_kg = 0,
      quantity_per_chicken_g = 0,
      quantity_per_meal_g = 0,
      meals_per_day = 2,
      feeding_schedule = [],
      storage_recommendations = []
    } = feedCalculation;

    // Frontend expects perChicken in grams, totalKg in kg
    let perChicken = quantity_per_chicken_g; // Keep in grams
    let totalKg = total_quantity_per_day_kg;
    
    // Fallback to local calculations if Bedrock data is missing or zero
    if (perChicken === 0 || totalKg === 0) {
      console.warn('Bedrock API returned zero values, falling back to local calculations');
      const { calculateSeasonalFeedAmount } = await import('../utils/calculate.js');
      const seasonalFeedData = calculateSeasonalFeedAmount(
        originalFormData.breed, 
        originalFormData.age, 
        originalFormData.weight, 
        originalFormData.environment, 
        originalFormData.season, 
        originalFormData.stressLevel, 
        originalFormData.molting, 
        originalFormData.purpose
      );
      perChicken = seasonalFeedData.adjustedAmount;
      totalKg = (seasonalFeedData.adjustedAmount * originalFormData.quantity) / 1000;
    }
    
    // Transform feeding schedule
    let times = feeding_schedule.map(schedule => schedule.time || schedule);
    
    // Fallback to local feeding times if API doesn't provide schedule
    if (!times || times.length === 0 || times.every(t => !t)) {
      console.warn('Bedrock API did not provide feeding schedule, using local calculations');
      const { optimalFeedingTimes } = await import('../utils/calculate.js');
      times = optimalFeedingTimes(
        originalFormData.age, 
        originalFormData.season, 
        originalFormData.environment, 
        originalFormData.stressLevel, 
        originalFormData.purpose
      );
    }
    
    // Get local recommendations as fallback
    const localRecommendations = getAdditionalFeedRecommendations(
      originalFormData.breed, 
      originalFormData.age, 
      originalFormData.environment, 
      originalFormData.season, 
      originalFormData.purpose
    );

    // Transform recommendations from Bedrock API structure
    // Merge Bedrock API recommendations with local recommendations
    const recommendations = {
      seasonal: localRecommendations.seasonal,
      breed: localRecommendations.breed,
      age: localRecommendations.age,
      environment: localRecommendations.environment,
      purpose: localRecommendations.purpose,
      general: [
        ...localRecommendations.general,
        ...(Array.isArray(additionalRecommendations) ? additionalRecommendations : [])
      ]
    };

    // Extract nutritional analysis from feed composition
    const energyIncrease = feedComposition.energy_increase || 0;
    const proteinIncrease = feedComposition.protein_increase || 0;
    const calciumIncrease = feedComposition.calcium_increase || 0;

    return {
      form: originalFormData,
      perChicken: perChicken,
      basePerChicken: perChicken, // Bedrock provides the final amount
      totalKg: totalKg,
      times: times,
      seasonalAdjustments: (() => {
        try {
          if (typeof seasonalAdjustments === 'string') {
            return JSON.parse(seasonalAdjustments);
          }
          return seasonalAdjustments || {};
        } catch (error) {
          console.warn('Failed to parse seasonal adjustments:', error);
          return {};
        }
      })(),
      recommendations: recommendations,
      energyIncrease: energyIncrease,
      proteinIncrease: proteinIncrease,
      calciumIncrease: calciumIncrease,
      // Additional Bedrock-specific data
      mealsPerDay: meals_per_day,
      quantityPerMeal: quantity_per_meal_g,
      storageRecommendations: (storage_recommendations || []).map(rec => typeof rec === 'string' ? rec : JSON.stringify(rec)),
      nutritionalAnalysis: feedComposition,
      // Feed composition details
      feedComposition: {
        crudeProteinPercent: feedComposition.crude_protein_percent || 'N/A',
        metabolizableEnergy: feedComposition.metabolizable_energy_kcal_per_kg || 'N/A',
        calciumPercent: feedComposition.calcium_percent || 'N/A',
        phosphorusPercent: feedComposition.phosphorus_percent || 'N/A',
        fiberPercent: feedComposition.crude_fiber_percent || 'N/A'
      },
      // Additional context from Bedrock
      requestInfo: bedrockData?.request_info || {},
      nutritionalContext: nutritionalContext
    };
    } catch (error) {
      console.error('Error transforming Bedrock response:', error);
      // Return a fallback structure if transformation fails
      return {
        form: originalFormData,
        perChicken: 0,
        basePerChicken: 0,
        totalKg: 0,
        times: [],
        seasonalAdjustments: {},
        recommendations: {
          seasonal: [],
          breed: [],
          age: [],
          environment: [],
          purpose: [],
          general: []
        },
        energyIncrease: 0,
        proteinIncrease: 0,
        calciumIncrease: 0,
        mealsPerDay: 2,
        quantityPerMeal: 0,
        storageRecommendations: [],
        nutritionalAnalysis: {},
        feedComposition: {
          crudeProteinPercent: 'N/A',
          metabolizableEnergy: 'N/A',
          calciumPercent: 'N/A',
          phosphorusPercent: 'N/A',
          fiberPercent: 'N/A'
        },
        requestInfo: {},
        nutritionalContext: {}
      };
    }
  }

  // Helper method to extract recommendations by type
  extractRecommendationsByType(recommendations, type) {
    if (!Array.isArray(recommendations)) return [];
    
    return recommendations
      .filter(rec => {
        if (typeof rec === 'string') return true;
        if (typeof rec === 'object' && rec.type === type) return true;
        return false;
      })
      .map(rec => {
        if (typeof rec === 'string') return rec;
        if (typeof rec === 'object' && rec.recommendation) return rec.recommendation;
        return JSON.stringify(rec);
      });
  }
}

export default new BedrockApiService();
