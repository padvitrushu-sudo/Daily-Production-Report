/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { authenticateBranchUser } from '../lib/supabase';
import { Branch } from '../types';
import { Lock, User, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: { username: string; branch: Branch | 'Admin'; label: string }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await authenticateBranchUser(username, password);
      if (res.success) {
        onLoginSuccess({
          username: username.trim().toLowerCase(),
          branch: res.branch,
          label: res.label,
        });
      } else {
        setError(res.error || 'Invalid credentials. Please verify your login info.');
      }
    } catch (err: any) {
      setError('An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 select-none font-sans antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo */}
        <div className="mx-auto mb-4 flex justify-center">
          <img
            src="https://www.ginzalimited.com/cdn/shop/files/Ginza_logo.jpg?v=1668509673&width=500"
            alt="GINZA Logo"
            referrerPolicy="no-referrer"
            className="h-16 w-auto object-contain rounded-xl shadow-md border border-gray-200"
          />
        </div>
        
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Daily Production Suite
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 font-medium">
          Secure Branch Portal & Real-time Cloud Archiver
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-gray-150/80 shadow-xs space-y-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-800 text-xs flex items-start gap-2.5 animate-pulse font-semibold">
                <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 text-red-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Selection input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-xs font-bold text-gray-750">
                User Access ID (Username)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="e.g. hojiwala, admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/50 hover:bg-gray-50 focus:bg-white text-gray-950 border border-gray-200 focus:border-emerald-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold"
                />
              </div>
            </div>

            {/* Password input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-bold text-gray-750">
                Security Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/50 hover:bg-gray-50 focus:bg-white text-gray-950 border border-gray-200 focus:border-emerald-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm tracking-tight flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/10 transition-colors disabled:opacity-75 disabled:cursor-wait"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <Sparkles className="w-4 h-4 text-emerald-200 fill-emerald-100" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
