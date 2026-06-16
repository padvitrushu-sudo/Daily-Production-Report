/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SewingDetails } from '../types';
import { ChevronLeft, ChevronRight, LayoutGrid, CheckSquare } from 'lucide-react';

interface StepSewingProps {
  data: SewingDetails;
  cuttingCumulative?: number | '';
  onUpdate: (updated: SewingDetails) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const StepSewing: React.FC<StepSewingProps> = ({
  data,
  cuttingCumulative = '',
  onUpdate,
  onPrev,
  onNext,
}) => {
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');

  const targetCuttingCum = cuttingCumulative !== '' && !isNaN(Number(cuttingCumulative)) ? Number(cuttingCumulative) : 0;

  // Reactively calculate values based on User rules
  React.useEffect(() => {
    const todayIn = data.input.today === '' ? 0 : Number(data.input.today);
    // Cumulative (AM) - Same as Today (AL)
    const expectedCumIn = data.input.today !== '' ? Number(data.input.today) : '';
    // Balance to load: Cutting Steps AJ - Today (AL)
    const expectedBalIn = data.input.today !== '' ? targetCuttingCum - todayIn : '';

    const todayOut = data.output.today === '' ? 0 : Number(data.output.today);
    // Cumulative (AQ) - Same as Today (AP)
    const expectedCumOut = data.output.today !== '' ? Number(data.output.today) : '';
    
    // Balance to Sew: AM - AQ
    const actualAM = expectedCumIn !== '' ? Number(expectedCumIn) : 0;
    const actualAQ = expectedCumOut !== '' ? Number(expectedCumOut) : 0;
    const expectedBalOut = data.input.today !== '' || data.output.today !== '' ? actualAM - actualAQ : '';

    if (
      data.input.cumulative !== expectedCumIn ||
      data.input.balanceToLoad !== expectedBalIn ||
      data.output.cumulative !== expectedCumOut ||
      data.output.balanceToSew !== expectedBalOut
    ) {
      onUpdate({
        ...data,
        input: {
          ...data.input,
          cumulative: expectedCumIn,
          balanceToLoad: expectedBalIn,
        },
        output: {
          ...data.output,
          cumulative: expectedCumOut,
          balanceToSew: expectedBalOut,
        }
      });
    }
  }, [data.input.today, data.output.today, targetCuttingCum]);

  const handleInputChange = (field: keyof SewingDetails['input'], value: any) => {
    onUpdate({
      ...data,
      input: {
        ...data.input,
        [field]: value,
      },
    });
  };

  const handleOutputChange = (field: keyof SewingDetails['output'], value: any) => {
    onUpdate({
      ...data,
      output: {
        ...data.output,
        [field]: value,
      },
    });
  };

  const isFormValid = true; // No field mandatory in form

  return (
    <div id="step-sewing" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Step 5 of 9</span>
          <h2 className="text-lg font-bold text-gray-900 mt-1">Sewing & Bonding Line</h2>
          <p className="text-xs text-gray-500">Track assembly lines Load Input (On MC) and Finished Output (Off MC)</p>
        </div>
      </div>

      {/* Sub tabs selector for responsive mobile screens */}
      <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 md:hidden">
        <button
          type="button"
          onClick={() => setActiveTab('input')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'input' ? 'bg-white text-emerald-600 shadow-xs' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Input (On MC)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('output')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'output' ? 'bg-white text-emerald-600 shadow-xs' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Output (Off MC)
        </button>
      </div>

      {/* Desktop side-by-side or mobile tabbed view */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Input (On MC) Form */}
        <div className={`space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100/65 ${activeTab === 'input' ? 'block' : 'hidden md:block'}`}>
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
            <LayoutGrid className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-gray-800">Sewing Input (On Machine)</h3>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">Today's Load (pcs) *</label>
              <input
                type="number"
                required
                placeholder="Ready lines input loaded"
                value={data.input.today}
                onChange={(e) => handleInputChange('today', e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-600">Cumulative Load (pcs) *</label>
                <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold font-mono">Same as Today</span>
              </div>
              <input
                type="number"
                readOnly
                placeholder="Total loaded upto today"
                value={data.input.cumulative}
                className="w-full px-3 py-2 bg-slate-100/80 text-gray-700 font-bold border border-gray-200 rounded-lg text-sm font-mono cursor-not-allowed outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-600">Balance to Load (pcs)</label>
                <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold font-mono">Cutting AJ - Today AL</span>
              </div>
              <input
                type="number"
                readOnly
                placeholder="Calculated remaining balance"
                value={data.input.balanceToLoad}
                className="w-full px-3 py-2 bg-slate-100/80 text-gray-750 font-bold border border-gray-200 rounded-lg text-sm font-mono cursor-not-allowed outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">Row Remarks / Notes</label>
              <textarea
                placeholder="Line status, machinery issue, delay info"
                rows={2}
                value={data.input.remark}
                onChange={(e) => handleInputChange('remark', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-text-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Output (Off MC) Form */}
        <div className={`space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100/65 ${activeTab === 'output' ? 'block' : 'hidden md:block'}`}>
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
            <CheckSquare className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-bold text-gray-800">Sewing Output (Off Machine)</h3>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">Today's Sewn Output (pcs) *</label>
              <input
                type="number"
                required
                placeholder="Line discharges completed today"
                value={data.output.today}
                onChange={(e) => handleOutputChange('today', e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-600">Cumulative Output (pcs) *</label>
                <span className="text-[9px] text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded font-semibold font-mono">Same as Today</span>
              </div>
              <input
                type="number"
                readOnly
                placeholder="Total completed output"
                value={data.output.cumulative}
                className="w-full px-3 py-2 bg-slate-100/80 text-gray-750 font-bold border border-gray-200 rounded-lg text-sm font-mono cursor-not-allowed outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-600">Balance to Sew (pcs)</label>
                <span className="text-[9px] text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded font-semibold font-mono">Input AM - Output AQ</span>
              </div>
              <input
                type="number"
                readOnly
                placeholder="Target pieces remaining"
                value={data.output.balanceToSew}
                className="w-full px-3 py-2 bg-slate-100/80 text-gray-750 font-bold border border-gray-200 rounded-lg text-sm font-mono cursor-not-allowed outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">Row Remarks / Notes</label>
              <textarea
                placeholder="Discharge updates, audit feedback, lines done"
                rows={2}
                value={data.output.remark}
                onChange={(e) => handleOutputChange('remark', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Navigation Footer */}
      <div className="border-t border-gray-100 pt-5 flex items-center justify-between">
        <button
          onClick={onPrev}
          id="btn-prev-step5"
          className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm tracking-tight hover:bg-gray-50 flex items-center space-x-1.5 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          onClick={onNext}
          id="btn-save-step5"
          disabled={!isFormValid}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm tracking-tight flex items-center space-x-1.5 transition-all shadow-md ${
            isFormValid
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10'
              : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
          }`}
        >
          <span>Save & Next Step</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
