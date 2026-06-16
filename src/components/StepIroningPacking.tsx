/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { IroningPackingDetails } from '../types';
import { ChevronLeft, ChevronRight, Plus, RotateCcw } from 'lucide-react';

interface StepIroningPackingProps {
  data: IroningPackingDetails;
  aqlAuditCumulative?: number | '';
  onUpdate: (updated: IroningPackingDetails) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const StepIroningPacking: React.FC<StepIroningPackingProps> = ({
  data,
  aqlAuditCumulative = '',
  onUpdate,
  onPrev,
  onNext,
}) => {
  // Local input states that clear or adjust on the fly
  const [todayManpowerInput, setTodayManpowerInput] = useState<number | ''>('');
  const [multiplierRate, setMultiplierRate] = useState<number>(10); // user-adjustable multiplier (value option)

  const targetAqlCum = aqlAuditCumulative !== '' && !isNaN(Number(aqlAuditCumulative)) ? Number(aqlAuditCumulative) : 0;

  // Reactively calculate values based on User rules
  React.useEffect(() => {
    // 1) Today BK (Manual) and Cumulative BL same value of BK (Today)
    const expectedCum = data.today !== '' ? Number(data.today) : '';
    
    // 2) Balance to Pack BM = AQL Audit Cumulative BE - Ironing Cumulative BL
    const actualBL = expectedCum !== '' ? Number(expectedCum) : 0;
    const expectedBal = data.today !== '' || aqlAuditCumulative !== '' ? targetAqlCum - actualBL : '';

    // 3) Cost Per Piece BP = BO (Total Cumulative Manpower) * multiplierRate
    const actualBO = data.totalUsedManpower !== '' ? Number(data.totalUsedManpower) : 0;
    const expectedCost = actualBO * multiplierRate;

    if (
      data.cumulative !== expectedCum ||
      data.balanceToPack !== expectedBal ||
      data.costPerPiece !== expectedCost
    ) {
      onUpdate({
        ...data,
        cumulative: expectedCum,
        balanceToPack: expectedBal,
        costPerPiece: expectedCost,
      });
    }
  }, [data.today, data.totalUsedManpower, targetAqlCum, multiplierRate]);

  const handleChange = (field: keyof IroningPackingDetails, value: any) => {
    onUpdate({
      ...data,
      [field]: value,
    });
  };

  // Add Manpower Today BN which accumulates into BO and clears BN
  const handleAddManpower = () => {
    if (todayManpowerInput === '' || isNaN(Number(todayManpowerInput))) return;
    const currentBO = data.totalUsedManpower !== '' ? Number(data.totalUsedManpower) : 0;
    handleChange('totalUsedManpower', currentBO + Number(todayManpowerInput));
    setTodayManpowerInput('');
  };

  const isFormValid = true;

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
        
        {/* Today BK */}
        <div className="flex flex-col gap-1.5 font-semibold">
          <label className="text-xs font-bold text-gray-700">Today Ironed & Folded (BK) *</label>
          <input
            type="number"
            required
            placeholder="Today's processed volume"
            value={data.today}
            onChange={(e) => handleChange('today', e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500 font-semibold"
          />
        </div>

        {/* Cumulative BL */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-gray-700 font-medium">Cumulative Packed (BL)</label>
            <span className="text-[9px] text-emerald-650 bg-emerald-50 px-1 py-0.5 rounded font-mono font-bold uppercase">Same as BK</span>
          </div>
          <input
            type="number"
            readOnly
            placeholder="Accumulated total packed"
            value={data.cumulative}
            className="w-full px-3.5 py-2.5 bg-slate-50 text-gray-750 border border-gray-200 rounded-xl text-sm font-bold font-mono cursor-not-allowed outline-none"
          />
        </div>

        {/* Balance to Pack BM */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-gray-700 font-medium">Balance to Pack (BM)</label>
            <span className="text-[9px] text-emerald-650 bg-emerald-50 px-1 py-0.5 rounded font-mono font-bold uppercase">AQL BE - BL</span>
          </div>
          <input
            type="number"
            readOnly
            placeholder="Remaining target pieces"
            value={data.balanceToPack}
            className="w-full px-3.5 py-2.5 bg-slate-50 text-gray-750 border border-gray-200 rounded-xl text-sm font-bold font-mono cursor-not-allowed outline-none"
          />
        </div>

        {/* Total Used Manpower Today BN Input */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-xs font-bold text-gray-700">Add Today's Manpower (BN) - Clears Field</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Enter daily workers/wages headcount"
              value={todayManpowerInput}
              onChange={(e) => setTodayManpowerInput(e.target.value === '' ? '' : Number(e.target.value))}
              className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500 font-semibold"
            />
            <button
              type="button"
              onClick={handleAddManpower}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1 shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
            <button
              type="button"
              onClick={() => handleChange('totalUsedManpower', '')}
              className="p-2.5 border border-gray-250 hover:bg-red-50 text-red-500 rounded-xl"
              title="Reset Manpower Accumulator"
            >
              <RotateCcw className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Total Cumulative Manpower BO */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700">Total Manpower Cumulative (BO)</label>
          <input
            type="number"
            readOnly
            placeholder="Accumulated headcount sum"
            value={data.totalUsedManpower}
            className="w-full px-3.5 py-2.5 bg-slate-50 text-gray-800 font-bold border border-gray-200 rounded-xl text-sm font-bold font-mono cursor-not-allowed outline-none"
          />
        </div>

        {/* Multiplier / Rate Option */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700">Enter Manual Rate Multiplier ($)</label>
          <input
            type="number"
            placeholder="e.g. 700 or 150"
            value={multiplierRate}
            onChange={(e) => setMultiplierRate(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500 font-semibold"
          />
        </div>

        {/* Cost Per Piece BP */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-700 font-medium">Cost Per Piece (BP)</label>
            <span className="text-[9px] text-teal-600 bg-teal-50 px-1 rounded font-bold font-mono">BO * Rate</span>
          </div>
          <div className="relative">
            <input
              type="number"
              readOnly
              value={data.costPerPiece}
              placeholder="Auto output cost"
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
