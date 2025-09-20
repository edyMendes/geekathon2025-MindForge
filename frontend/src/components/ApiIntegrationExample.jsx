import { useState, useEffect } from 'react';
import { useAuth, useApiData, useApiCrud } from '../hooks/useApi.js';
import chickenApiService from '../services/chickenApi.js';

// Exemplo de como integrar a API no seu projeto existente
export default function ApiIntegrationExample() {
  const { isAuthenticated, login, logout, loading: authLoading } = useAuth();
  const { data: chickens, loading: chickensLoading, refetch } = useApiData('/chickens');
  const { create, update, remove, loading: crudLoading } = useApiCrud('/chickens');
  
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(credentials);
    if (result.success) {
      console.log('Login successful!');
    } else {
      console.error('Error in login:', result.error);
    }
  };

  const handleLogout = async () => {
    await logout();
    console.log('Logout successful!');
  };

  const handleSyncData = async () => {
    // Exemplo de como sincronizar dados locais com a API
    const localData = {
      profiles: JSON.parse(localStorage.getItem('chicken_profiles') || '[]'),
      history: JSON.parse(localStorage.getItem('chicken_history') || '[]')
    };

    const result = await chickenApiService.syncLocalData(localData);
    if (result.success) {
      console.log('Data synced successfully!');
    } else {
        console.error('Error syncing data:', result.error);
    }
  };

  const handleBackup = async () => {
    const result = await chickenApiService.backupData();
    if (result.success) {
      console.log('Backup successful!');
    } else {
      console.error('Error in backup:', result.error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Connect with External API</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">User</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Your API user"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Your API password"
            />
          </div>
          <button
            type="submit"
            disabled={authLoading}
            className="btn-primary px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {authLoading ? 'Connecting...' : 'Connect'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">API Connected</h2>
        <button
          onClick={handleLogout}
          className="btn-sec px-4 py-2 rounded-lg"
        >
          Disconnect
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={handleSyncData}
            className="btn-sec px-4 py-2 rounded-lg"
          >
            Sync Data
          </button>
          <button
            onClick={handleBackup}
            className="btn-sec px-4 py-2 rounded-lg"
          >
            Make Backup
          </button>
          <button
            onClick={refetch}
            disabled={chickensLoading}
            className="btn-sec px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {chickensLoading ? 'Loading...' : 'Updating Data'}
          </button>
        </div>

        {chickens && (
          <div>
            <h3 className="font-semibold mb-2">API Data:</h3>
            <pre className="bg-slate-100 dark:bg-slate-700 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(chickens, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
