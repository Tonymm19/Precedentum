import React, { useState } from 'react';
import { LogIn } from '../lucide-stub';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const LoginScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to sign in');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`w-full max-w-md rounded-2xl shadow-xl p-8 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
            <LogIn className={`h-6 w-6 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
          </div>
          <div>
            <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Sign in to District Court Bot
            </h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Enter your email and password to continue
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className={`p-3 rounded-lg text-sm ${isDarkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-50 text-red-700'}`}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <LogIn className="h-5 w-5" />
            <span>{isSubmitting ? 'Signing in...' : 'Sign in'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
