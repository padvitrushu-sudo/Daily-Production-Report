/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { IroningPackingDetails } from '../types';
import { calculateCostPerPiece } from '../utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StepIroningPackingProps {
  data: IroningPackingDetails;
  onUpdate: (updated: IroningPackingDetails) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const StepIroningPacking: React.FC<StepIroningPackingProps> = ({
  data,
  onUpdate,
  onPrev,
  onNext,
}) => {
  const calculatedCost = calculateCostPerPiece(data.totalUsedManpower, data.today);

  const handleChange = (field: keyof IroningPackingDetails, value: any) => {
    onUpdate({
      ...data,
      [field]: value,
    });
  };

  const isFormValid = true; // No field mandatory in form

  return (
    <div id="step-ironing-packing" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Step 8 of 9</span>
          <h2 className="text-lg font-bold text-gray-900 mt-1">Ironing & Packing Stage</h2>
          <p className="text-xs text-gray-500 font-medium">Log press outputs, folding, retail packaging pieces finished, and labor costs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Today */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700 font-medium">Today Ironed & Folded (pcs) *</label>
          <input
            type="number"
            required
            placeholder="Today's processed volume"
            value={data.today}
            onChange={(e) => handleChange('today', e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold"
          />
        </div>

        {/* Cumulative */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700 font-medium">Cumulative Packed (pcs) *</label>
          <input
            type="number"
            required
            placeholder="Accumulated total packed"
            value={data.cumulative}
            onChange={(e) => handleChange('cumulative', e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold"
          />
        </div>

        {/* Balance to Pack */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700 font-medium">Balance to Pack (pcs)</label>
          <input
            type="number"
            placeholder="Remaining to iron"
            value={data.balanceToPack}
            onChange={(e) => handleChange('balanceToPack', e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold"
          />
        </div>

        {/* Total Used Manpower */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700 font-medium">Total Used Manpower Cost (Today) *</label>
          <input
            type="number"
            required
            placeholder="Direct line wages"
            value={data.totalUsedManpower}
            onChange={(e) => handleChange('totalUsedManpower', e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold"
          />
        </div>

        {/* Cost Per Piece */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-750 font-medium">Cost Per Piece</label>
            <span className="text-[10px] text-teal-600 bg-teal-50 px-1 rounded font-bold font-mono">Cost / Today Qty</span>
          </div>
          <div className="relative">
            <input
              type="number"
              readOnly
              value={calculatedCost}
              placeholder="Auto-calculated piece rate"
              className="w-full px-3.5 py-2.5 bg-slate-50 text-emerald-750 border border-gray-200 rounded-xl text-sm font-bold font-mono cursor-not-allowed outline-none"
            />
          </div>
        </div>

      </div>

      {/* Navigation Footer */}
      <div className="border-t border-gray-100 pt-5 flex items-center justify-between">
        <button
          onClick={onPrev}
          id="btn-prev-step8"
          className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm tracking-tight hover:bg-gray-50 flex items-center space-x-1.5 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          onClick={onNext}
          id="btn-save-step8"
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
