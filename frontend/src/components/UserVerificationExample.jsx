import { useState } from 'react';
import { useUserVerification, useAvailabilityCheck, useFormValidation } from '../hooks/useUserVerification.js';
import { CheckCircle, XCircle, AlertCircle, User, Mail } from 'lucide-react';

// Example of how to use user verification
export default function UserVerificationExample() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { 
    checkUser, 
    loading: userLoading, 
    error: userError, 
    userExists, 
    userData 
  } = useUserVerification();

  const { 
    checkEmail, 
    checkUsername, 
    loading: availabilityLoading, 
    emailAvailable, 
    usernameAvailable 
  } = useAvailabilityCheck();

  const { 
    validateField, 
    errors, 
    clearError 
  } = useFormValidation();

  const handleEmailChange = async (e) => {
    const value = e.target.value;
    setEmail(value);
    clearError('email');

    if (value && value.includes('@')) {
      await checkEmail(value);
    }
  };

  const handleUsernameChange = async (e) => {
    const value = e.target.value;
    setUsername(value);
    clearError('username');

    if (value && value.length >= 3) {
      await checkUsername(value);
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validateField('password', value);
  };

  const handleCheckUser = async () => {
    if (email) {
      await checkUser(email);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case true:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case false:
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status, type) => {
    switch (status) {
      case true:
        return type === 'email' ? 'Email disponível' : 'Username disponível';
      case false:
        return type === 'email' ? 'Email já em uso' : 'Username já em uso';
      default:
        return 'Verificando...';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">
        User Verification
      </h2>

      {/* Email Verification */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Mail className="w-5 h-5 mr-2" />
          Email Verification
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              placeholder="Enter an email"
            />
            {email && (
              <div className="mt-2 flex items-center text-sm">
                {getStatusIcon(emailAvailable)}
                <span className={`ml-2 ${
                  emailAvailable === true ? 'text-green-600' :
                  emailAvailable === false ? 'text-red-600' :
                  'text-gray-500'
                }`}>
                  {getStatusText(emailAvailable, 'email')}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleCheckUser}
            disabled={!email || userLoading}
            className="btn-primary px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {userLoading ? 'Verifying...' : 'Verify User'}
          </button>

          {userData && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-200">User Found:</h4>
              <pre className="text-sm text-green-700 dark:text-green-300 mt-2">
                {JSON.stringify(userData, null, 2)}
              </pre>
            </div>
          )}

          {userError && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-red-700 dark:text-red-300">{userError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Username Verification */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Username Verification
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              placeholder="Enter a username"
            />
            {username && (
              <div className="mt-2 flex items-center text-sm">
                {getStatusIcon(usernameAvailable)}
                <span className={`ml-2 ${
                  usernameAvailable === true ? 'text-green-600' :
                  usernameAvailable === false ? 'text-red-600' :
                  'text-gray-500'
                }`}>
                  {getStatusText(usernameAvailable, 'username')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Validation */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Password Validation</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 ${
                errors.password ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
              }`}
              placeholder="Enter a password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
            )}
          </div>
        </div>
      </div>

      {/* General Status */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Verification Status</h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Email:</span>
            <div className="flex items-center">
              {getStatusIcon(emailAvailable)}
              <span className="ml-2 text-sm">
                {emailAvailable === null ? 'Not verified' : 
                 emailAvailable ? 'Available' : 'In use'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Username:</span>
            <div className="flex items-center">
              {getStatusIcon(usernameAvailable)}
              <span className="ml-2 text-sm">
                  {usernameAvailable === null ? 'Not verified' : 
                 usernameAvailable ? 'Available' : 'In use'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span>User Exists:</span>
            <div className="flex items-center">
              {getStatusIcon(userExists)}
              <span className="ml-2 text-sm">
                {userExists === null ? 'Not verified' : 
                 userExists ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
