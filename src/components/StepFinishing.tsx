/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FinishingDetails } from '../types';
import { calculateCostPerPiece, calculateAqlPct } from '../utils';
import { ChevronLeft, ChevronRight, Activity, ClipboardCheck, Sparkles } from 'lucide-react';

interface StepFinishingProps {
  data: FinishingDetails;
  onUpdate: (updated: FinishingDetails) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const StepFinishing: React.FC<StepFinishingProps> = ({
  data,
  onUpdate,
  onPrev,
  onNext,
}) => {
  const [activeTab, setActiveTab] = useState<'Trimming' | 'Checking' | 'AQL Audit'>(data.subType || 'Trimming');

  const handleTabChange = (tab: 'Trimming' | 'Checking' | 'AQL Audit') => {
    setActiveTab(tab);
    onUpdate({
      ...data,
      subType: tab,
    });
  };

  const handleTrimmingChange = (field: keyof FinishingDetails['trimming'], value: any) => {
    onUpdate({
      ...data,
      trimming: {
        ...data.trimming,
        [field]: value,
      },
    });
  };

  const handleCheckingChange = (field: keyof FinishingDetails['checking'], value: any) => {
    onUpdate({
      ...data,
      checking: {
        ...data.checking,
        [field]: value,
      },
    });
  };

  const handleAqlChange = (field: keyof FinishingDetails['aqlAudit'], value: any) => {
    onUpdate({
      ...data,
      aqlAudit: {
        ...data.aqlAudit,
        [field]: value,
      },
    });
  };

  // Real-time calculations
  const calculatedTrimmingCost = calculateCostPerPiece(data.trimming.totalUsedManpower, data.trimming.today);
  const calculatedCheckingCost = calculateCostPerPiece(data.checking.totalUsedManpower, data.checking.today);
  const calculatedAqlPct = calculateAqlPct(Number(data.aqlAudit.cumulativeResubmission), Number(data.aqlAudit.cumulative));

  // A form is valid if the currently active subType inputs are populated
  const isTrimmingValid = data.trimming.today !== '' && data.trimming.cumulative !== '' && data.trimming.totalUsedManpower !== '';
  const isCheckingValid = data.checking.today !== '' && data.checking.cumulative !== '' && data.checking.totalUsedManpower !== '';
  const isAqlValid = data.aqlAudit.today !== '' && data.aqlAudit.cumulative !== '';

  const isFormValid = true; // No field mandatory in form

  return (
    <div id="step-finishing" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Step 7 of 9</span>
          <h2 className="text-lg font-bold text-gray-900 mt-1">Finishing Department</h2>
          <p className="text-xs text-gray-500">Includes clipping/Trimming, measurements checking, and final AQL Audits</p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex bg-slate-50 p-1.5 rounded-xl border border-gray-100 max-w-xl mx-auto">
        {(['Trimming', 'Checking', 'AQL Audit'] as const).map((tabName) => {
          const isActive = activeTab === tabName;
          return (
            <button
              key={tabName}
              type="button"
              id={`finishing-tab-${tabName.replace(' ', '')}`}
              onClick={() => handleTabChange(tabName)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-tight text-center flex items-center justify-center gap-1.5 transition-all duration-200 ${
                isActive
                  ? 'bg-white text-emerald-600 shadow-sm border border-black/5 font-extrabold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tabName === 'Trimming' && <Sparkles className="w-3.5 h-3.5" />}
              {tabName === 'Checking' && <ClipboardCheck className="w-3.5 h-3.5" />}
              {tabName === 'AQL Audit' && <Activity className="w-3.5 h-3.5" />}
              <span>{tabName}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Body */}
      <div className="block">
        
        {/* TAB 1: Trimming Finishing */}
        {activeTab === 'Trimming' && (
          <div className="space-y-5 animate-fade-in">
            <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100/50 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800">Trimming (Finishing Assembly Stage)</span>
              <span className="text-[10px] text-emerald-600 bg-white border px-2 py-0.5 rounded uppercase font-bold">Manual + Cost Calc</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Today Finished (pcs) *</label>
                <input
                  type="number"
                  placeholder="Processed today"
                  value={data.trimming.today}
                  onChange={(e) => handleTrimmingChange('today', e.target.value === '' ? '' : Number(e.target.value))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Cumulative (pcs) *</label>
                <input
                  type="number"
                  placeholder="Accrued total"
                  value={data.trimming.cumulative}
                  onChange={(e) => handleTrimmingChange('cumulative', e.target.value === '' ? '' : Number(e.target.value))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Balance remaining (pcs)</label>
                <input
                  type="number"
                  placeholder="Pending count"
                  value={data.trimming.balance}
                  onChange={(e) => handleTrimmingChange('balance', e.target.value === '' ? '' : Number(e.target.value))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Total Used Manpower *</label>
                <input
                  type="number"
                  placeholder="Headcount / labor cost"
                  value={data.trimming.totalUsedManpower}
                  onChange={(e) => handleTrimmingChange('totalUsedManpower', e.target.value === '' ? '' : Number(e.target.value))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Cost Per Piece</label>
                <input
                  type="number"
                  readOnly
                  value={calculatedTrimmingCost}
                  placeholder="Autocalculated"
                  className="px-3 py-2 bg-slate-100 text-emerald-700 border border-gray-200 rounded-lg text-sm font-bold font-mono cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Checking */}
        {activeTab === 'Checking' && (
          <div className="space-y-5 animate-fade-in">
            <div className="p-4 bg-sky-50/40 rounded-xl border border-sky-100/50 flex items-center justify-between">
              <span className="text-xs font-bold text-sky-850">Checking (Measurements & Quality Gates)</span>
              <span className="text-[10px] text-sky-600 bg-white border px-2 py-0.5 rounded uppercase font-bold">Checking Active</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Today Checked (pcs) *</label>
                <input
                  type="number"
                  placeholder="Checked today"
                  value={data.checking.today}
                  onChange={(e) => handleCheckingChange('today', e.target.value === '' ? '' : Number(e.target.value))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Cumulative Checked (pcs) *</label>
                <input
                  type="number"
                  placeholder="Total audited"
                  value={data.checking.cumulative}
                  onChange={(e) => handleCheckingChange('cumulative', e.target.value === '' ? '' : Number(e.target.value))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Balance remaining (pcs)</label>
                <input
                  type="number"
                  placeholder="Pending checking"
                  value={data.checking.balance}
                  onChange={(e) => handleCheckingChange('balance', e.target.value === '' ? '' : Number(e.target.value))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Total Used Manpower *</label>
                <input
                  type="number"
                  placeholder="Inspector headcount"
                  value={data.checking.totalUsedManpower}
                  onChange={(e) => handleCheckingChange('totalUsedManpower', e.target.value === '' ? '' : Number(e.target.value))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Cost Per Piece</label>
                <input
                  type="number"
                  readOnly
                  value={calculatedCheckingCost}
                  placeholder="Autocalculated checked"
                  className="px-3 py-2 bg-slate-100 text-sky-700 border border-gray-200 rounded-lg text-sm font-bold font-mono cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AQL Audit */}
        {activeTab === 'AQL Audit' && (
          <div className="space-y-5 animate-fade-in">
            <div className="p-4 bg-teal-50/40 rounded-xl border border-teal-100/50 flex items-center justify-between">
              <span className="text-xs font-bold text-teal-850">AQL Audit (Acceptable Quality Level sampling check)</span>
              <span className="text-[10px] text-teal-700 bg-white border px-2 py-0.5 rounded uppercase font-bold">Standard calculations</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Today Audited (pcs) *</label>
                <input
                  type="number"
                  placeholder="Lots sampled today"
                  value={data.aqlAudit.today}
                  onChange={(e) => handleAqlChange('today', e.target.value === '' ? '' : Number(e.target.value))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Cumulative Audit (pcs) *</label>
                <input
                  type="number"
                  placeholder="Cumulative pieces checked"
                  value={data.aqlAudit.cumulative}
                  onChange={(e) => handleAqlChange('cumulative', e.target.value === '' ? '' : Number(e.target.value))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Balance remaining (pcs)</label>
                <input
                  type="number"
                  placeholder="Remaining list stack"
                  value={data.aqlAudit.balance}
                  onChange={(e) => handleAqlChange('balance', e.target.value === '' ? '' : Number(e.target.value))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Today Re-submission (pcs)</label>
                <input
                  type="number"
                  placeholder="Defected lines returned today"
                  value={data.aqlAudit.todayResubmission}
                  onChange={(e) => handleAqlChange('todayResubmission', e.target.value === '' ? '' : Number(e.target.value))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Cumulative Resubmission (pcs)</label>
                <input
                  type="number"
                  placeholder="Accumulated defective rechecks"
                  value={data.aqlAudit.cumulativeResubmission}
                  onChange={(e) => handleAqlChange('cumulativeResubmission', e.target.value === '' ? '' : Number(e.target.value))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-teal-800 flex items-center justify-between">
                  <span>% Re-submission</span>
                  <span className="text-[9px] bg-teal-55 text-emerald-800 font-bold">Resub / Cumul %</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${calculatedAqlPct}%`}
                  className="px-3 py-2 bg-slate-100 text-teal-700 border border-gray-200 rounded-lg text-sm font-bold font-mono cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Navigation footer */}
      <div className="border-t border-gray-100 pt-5 flex items-center justify-between">
        <button
          onClick={onPrev}
          id="btn-prev-step7"
          className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm tracking-tight hover:bg-gray-50 flex items-center space-x-1.5 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          onClick={onNext}
          id="btn-save-step7"
          disabled={!isFormValid}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm tracking-tight flex items-center space-x-1.5 transition-all shadow-md ${
            isFormValid
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10'
              : 'bg-gray-150 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
          }`}
        >
          <span>Save & Next Step</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
