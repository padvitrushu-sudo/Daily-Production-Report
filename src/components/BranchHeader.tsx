/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Branch, BranchConfig } from '../types';
import { Settings, CheckCircle, HelpCircle, MapPin, ExternalLink, Copy, Check, LogOut, User } from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_CODE } from '../utils';

interface BranchHeaderProps {
  currentBranch: Branch;
  onBranchChange: (branch: Branch) => void;
  configs: BranchConfig[];
  onConfigChange: (configs: BranchConfig[]) => void;
  user: { username: string; branch: Branch | 'Admin'; label: string } | null;
  onLogout: () => void;
}

export const BranchHeader: React.FC<BranchHeaderProps> = ({
  currentBranch,
  onBranchChange,
  configs,
  onConfigChange,
  user,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingUrls, setEditingUrls] = useState<Record<Branch, string>>({
    Dondaycha: configs.find(c => c.id === 'Dondaycha')?.webAppUrl || '',
    Hojiwala: configs.find(c => c.id === 'Hojiwala')?.webAppUrl || '',
    Sachin: configs.find(c => c.id === 'Sachin')?.webAppUrl || '',
    Ambernath: configs.find(c => c.id === 'Ambernath')?.webAppUrl || '',
  });


  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveConfigs = () => {
    const updatedConfigs = configs.map(cfg => ({
      ...cfg,
      webAppUrl: editingUrls[cfg.id] || '',
    }));
    onConfigChange(updatedConfigs);
    setIsOpen(false);
  };

  const getStatusText = (branch: Branch) => {
    const cfg = configs.find(c => c.id === branch);
    return cfg?.webAppUrl ? 'Connected' : 'Offline Draft Only';
  };

  return (
    <div id="branch-header" className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Left Side: Title and Logo */}
        <div className="flex items-center space-x-3">
          <img
            src="https://www.ginzalimited.com/cdn/shop/files/Ginza_logo.jpg?v=1668509673&width=500"
            alt="GINZA Logo"
            referrerPolicy="no-referrer"
            className="h-11 w-auto object-contain rounded-xl border border-gray-200 shadow-sm"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Daily Production Report</h1>
            <p className="text-xs text-gray-500 font-medium">Garments Production & Craft Tracking Suite</p>
          </div>
        </div>

        {/* Middle/Right: Branch Selection and Actions */}
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="flex items-center bg-gray-50 p-1.5 rounded-xl border border-gray-100">
            {(['Dondaycha', 'Hojiwala', 'Sachin', 'Ambernath'] as Branch[]).map((branchName) => {
              const isActive = currentBranch === branchName;
              const isConfigured = !!configs.find(c => c.id === branchName)?.webAppUrl;
              const isBlocked = user && user.branch !== 'Admin' && user.branch !== branchName;

              return (
                <button
                  key={branchName}
                  id={`branch-btn-${branchName}`}
                  onClick={() => !isBlocked && onBranchChange(branchName)}
                  type="button"
                  disabled={!!isBlocked}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-white text-emerald-600 shadow-md ring-1 ring-black/5'
                      : isBlocked
                      ? 'text-gray-300 cursor-not-allowed opacity-40 hover:bg-transparent'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                  }`}
                  title={isBlocked ? `Access locked to ${user?.branch} Branch only` : `Connect to ${branchName}`}
                >
                  <MapPin className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-500 fill-emerald-100' : 'text-gray-400'}`} />
                  <span className="font-mono lowercase font-bold text-xs">{branchName.toLowerCase()}</span>
                  {!isBlocked && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isConfigured ? 'bg-emerald-500' : 'bg-amber-400'}`} title={getStatusText(branchName)}></span>
                  )}
                </button>
              );
            })}
          </div>

          {(!user || user.branch === 'Admin') && (
            <button
              id="settings-btn"
              onClick={() => setIsOpen(true)}
              type="button"
              className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-xl border border-gray-200 transition-colors flex items-center justify-center"
              title="Google Sheet Integration Settings"
            >
              <Settings className="w-5 h-5 animate-hover-spin" />
            </button>
          )}

          {user && (
            <div className="flex flex-col items-end gap-1 pl-2.5 border-l border-gray-100">
              <button
                onClick={onLogout}
                type="button"
                id="btn-logout"
                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/40 rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-xs transition-all active:scale-95"
                title={`Sign out from ${user.label}`}
              >
                <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{user.branch === 'Admin' ? 'Supervisor Logout' : 'Operator Logout'}</span>
              </button>
              <div className="text-[10px] text-gray-400 font-medium font-mono flex items-center gap-1 leading-none mt-0.5">
                <span>branch:</span>
                <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-extrabold uppercase text-[9px] tracking-wide">{currentBranch}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Integration Setup Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900/60 transition-opacity backdrop-blur-xs" onClick={() => setIsOpen(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-100">
              <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="bg-emerald-50 p-2 rounded-lg">
                    <Settings className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900" id="modal-title">
                    Google Sheets Setup (CORS Web Apps)
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-500 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-5">
                <div className="text-sm text-gray-600 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50 leading-relaxed">
                  <p className="font-semibold text-emerald-800 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Secure, Code-Free Spreadsheet Setup
                  </p>
                  <p className="mt-1">
                    This form writes directly to your target Google Spreadsheet (ID: <code className="bg-white px-1 py-0.5 rounded border text-emerald-700 font-mono text-xs">{configs.find(c => c.id === currentBranch)?.spreadsheetId || '107lQoWsOCPpSNFm4L36Ym2EFElxsdgeEPMfGYvBCj5M'}</code>) via a secure Google Apps Script Web App. Simply deploy the script below in your Spreadsheet.
                  </p>
                </div>

                {/* Web App URLs Input */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-sm border-b pb-1">Branch Web App URLs</h4>
                  {(['Dondaycha', 'Hojiwala', 'Sachin', 'Ambernath'] as Branch[]).map((branch) => (
                    <div key={branch} className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                        <span>{branch} Branch API Endpoint</span>
                        <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono ${editingUrls[branch] ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {editingUrls[branch] ? 'ACTIVE SYNC' : 'OFFLINE IN-APP STORAGE'}
                        </span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://script.google.com/macros/s/.../exec"
                        value={editingUrls[branch]}
                        onChange={(e) => setEditingUrls({ ...editingUrls, [branch]: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100/50 focus:bg-white text-gray-900 border border-gray-200 rounded-lg text-sm font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  ))}
                </div>

                {/* Apps Script Copy Instructions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 text-sm">Deployment Script Template</h4>
                    <button
                      onClick={handleCopyCode}
                      className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>
                  
                  <ol className="text-xs text-gray-600 list-decimal pl-4 space-y-1.5">
                    <li>Open target spreadsheet <a href={`https://docs.google.com/spreadsheets/d/${configs.find(c => c.id === currentBranch)?.spreadsheetId}/edit`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline inline-flex items-center gap-0.5 font-semibold">Open Sheet <ExternalLink className="w-2.5 h-2.5" /></a></li>
                    <li>Click <strong className="text-gray-800">Extensions &gt; Apps Script</strong> block.</li>
                    <li>Paste the copied script template into the code editor.</li>
                    <li>Click <strong className="text-gray-800">Deploy &gt; New Deployment</strong> (Web App format accessible to "Anyone").</li>
                    <li>Copy generated Web App URL and paste into the inputs above!</li>
                  </ol>

                  <div className="relative">
                    <pre className="text-[10px] font-mono select-all bg-gray-900 text-gray-100 p-3.5 rounded-xl max-h-40 overflow-y-auto leading-relaxed border border-gray-800">
                      {GOOGLE_APPS_SCRIPT_CODE}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveConfigs}
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
