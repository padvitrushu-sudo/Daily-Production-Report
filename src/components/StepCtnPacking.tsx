/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CtnPackingDetails } from '../types';
import { ChevronLeft, ChevronRight, PackageCheck } from 'lucide-react';

interface StepCtnPackingProps {
  data: CtnPackingDetails;
  onUpdate: (updated: CtnPackingDetails) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const StepCtnPacking: React.FC<StepCtnPackingProps> = ({
  data,
  onUpdate,
  onPrev,
  onNext,
}) => {
  const handleChange = (field: keyof CtnPackingDetails, value: any) => {
    onUpdate({
      ...data,
      [field]: value,
    });
  };

  const isFormValid = true; // No field mandatory in form

  return (
    <div id="step-ctn-packing" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Step 9 of 9</span>
          <h2 className="text-lg font-bold text-gray-900 mt-1 flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-600" />
            <span>CTN Box Packing Stage</span>
          </h2>
          <p className="text-xs text-gray-500 font-medium">Log master carton boxes packed, current inventories, and Final Quality Inspection schedule</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Today */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700 font-medium">Cartons Packed Today *</label>
          <input
            type="number"
            required
            placeholder="Carton count loaded today"
            value={data.today}
            onChange={(e) => handleChange('today', e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold"
          />
        </div>

        {/* Cumulative */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700 font-medium">Cumulative Cartons Packed *</label>
          <input
            type="number"
            required
            placeholder="Accumulated carton units"
            value={data.cumulative}
            onChange={(e) => handleChange('cumulative', e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold"
          />
        </div>

        {/* Balance to Pack */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700 font-medium font-medium">Balance Cartons to Pack</label>
          <input
            type="number"
            placeholder="Remaining boxes load"
            value={data.balanceToPack}
            onChange={(e) => handleChange('balanceToPack', e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold"
          />
        </div>

        {/* Possible FI Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700 font-medium">Possible FI Date (Inspection) *</label>
          <input
            type="date"
            required
            value={data.possibleFiDate}
            onChange={(e) => handleChange('possibleFiDate', e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold"
          />
        </div>

        {/* Remarks */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-xs font-bold text-gray-700 font-medium">Packaging Remarks / Notes</label>
          <input
            type="text"
            placeholder="e.g. Master weight verification ok, carton dimensions 60x40x40"
            value={data.remark}
            onChange={(e) => handleChange('remark', e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
          />
        </div>

      </div>

      {/* Navigation Footer */}
      <div className="border-t border-gray-100 pt-5 flex items-center justify-between">
        <button
          onClick={onPrev}
          id="btn-prev-step9"
          className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm tracking-tight hover:bg-gray-50 flex items-center space-x-1.5 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          onClick={onNext}
          id="btn-save-step9"
          disabled={!isFormValid}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm tracking-tight flex items-center space-x-1.5 transition-all shadow-md ${
            isFormValid
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10'
              : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
          }`}
        >
          <span>Proceed to Review Summary</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
