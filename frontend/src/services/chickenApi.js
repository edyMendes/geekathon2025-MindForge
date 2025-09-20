import apiService from './apiService.js';
import { getEndpoints } from '../config/api.js';

// Serviço específico para dados de galinhas
class ChickenApiService {
  constructor() {
    this.endpoints = getEndpoints();
  }

  // Métodos para galinhas
  async getChickens(params = {}) {
    return apiService.get(this.endpoints.CHICKENS, params);
  }

  async getChickenById(id) {
    return apiService.get(`${this.endpoints.CHICKENS}/${id}`);
  }

  async createChicken(data) {
    return apiService.post(this.endpoints.CHICKENS, data);
  }

  async updateChicken(id, data) {
    return apiService.put(`${this.endpoints.CHICKENS}/${id}`, data);
  }

  async deleteChicken(id) {
    return apiService.delete(`${this.endpoints.CHICKENS}/${id}`);
  }

  // Métodos para ração
  async getFeeds(params = {}) {
    return apiService.get(this.endpoints.FEEDS, params);
  }

  async getFeedRecommendations(chickenData) {
    return apiService.post(`${this.endpoints.FEEDS}/recommendations`, chickenData);
  }

  async createFeed(data) {
    return apiService.post(this.endpoints.FEEDS, data);
  }

  // Métodos para relatórios
  async getReports(params = {}) {
    return apiService.get(this.endpoints.REPORTS, params);
  }

  async generateReport(data) {
    return apiService.post(this.endpoints.REPORTS, data);
  }

  async exportReport(id, format = 'csv') {
    return apiService.get(`${this.endpoints.REPORTS}/${id}/export?format=${format}`);
  }

  // Métodos para perfis
  async getProfiles(userId = null) {
    const params = userId ? { user_id: userId } : {};
    return apiService.get(this.endpoints.PROFILES, params);
  }

  async saveProfile(data) {
    return apiService.post(this.endpoints.PROFILES, data);
  }

  async updateProfile(id, data) {
    return apiService.put(`${this.endpoints.PROFILES}/${id}`, data);
  }

  async deleteProfile(id) {
    return apiService.delete(`${this.endpoints.PROFILES}/${id}`);
  }

  // Métodos para analytics
  async getAnalytics(params = {}) {
    return apiService.get(this.endpoints.ANALYTICS, params);
  }

  async getDashboardData() {
    return apiService.get(`${this.endpoints.ANALYTICS}/dashboard`);
  }

  // Método para sincronizar dados locais com a API
  async syncLocalData(localData) {
    try {
      // Enviar dados locais para a API
      const response = await apiService.post('/sync', {
        data: localData,
        timestamp: new Date().toISOString(),
      });
      
      return { success: true, data: response };
    } catch (error) {
      console.error('Erro ao sincronizar dados:', error);
      return { success: false, error: error.message };
    }
  }

  // Método para backup de dados
  async backupData() {
    try {
      const response = await apiService.get('/backup');
      return { success: true, data: response };
    } catch (error) {
      console.error('Erro ao fazer backup:', error);
      return { success: false, error: error.message };
    }
  }
}

// Instância singleton
const chickenApiService = new ChickenApiService();

export default chickenApiService;
