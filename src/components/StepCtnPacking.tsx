/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CtnPackingDetails } from '../types';
import { ChevronLeft, ChevronRight, PackageCheck } from 'lucide-react';

interface StepCtnPackingProps {
  data: CtnPackingDetails;
  ironingCumulative?: number | '';
  onUpdate: (updated: CtnPackingDetails) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const StepCtnPacking: React.FC<StepCtnPackingProps> = ({
  data,
  ironingCumulative = '',
  onUpdate,
  onPrev,
  onNext,
}) => {
  const targetIroningCum = ironingCumulative !== '' && !isNaN(Number(ironingCumulative)) ? Number(ironingCumulative) : 0;

  // Reactively calculate values based on User rules
  React.useEffect(() => {
    // 1) Today BQ (Manual) and Cumulative BR same value as BQ (Today)
    const expectedCum = data.today !== '' ? Number(data.today) : '';
    
    // 2) Balance BS = Ironing Cumulative BL - CTN Cumulative BR
    const actualBR = expectedCum !== '' ? Number(expectedCum) : 0;
    const expectedBal = data.today !== '' || ironingCumulative !== '' ? targetIroningCum - actualBR : '';

    if (
      data.cumulative !== expectedCum ||
      data.balanceToPack !== expectedBal
    ) {
      onUpdate({
        ...data,
        cumulative: expectedCum,
        balanceToPack: expectedBal,
      });
    }
  }, [data.today, targetIroningCum]);

  const handleChange = (field: keyof CtnPackingDetails, value: any) => {
    onUpdate({
      ...data,
      [field]: value,
    });
  };

  const isFormValid = true;

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
        
        {/* Today BQ */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700 font-medium">Cartons Packed Today (BQ) *</label>
          <input
            type="number"
            required
            placeholder="Carton count loaded today"
            value={data.today}
            onChange={(e) => handleChange('today', e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold"
          />
        </div>

        {/* Cumulative BR */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-gray-700 font-medium font-semibold">Cumulative Cartons Packed (BR)</label>
            <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded font-bold font-mono uppercase">Same as BQ</span>
          </div>
          <input
            type="number"
            readOnly
            placeholder="Accumulated carton units"
            value={data.cumulative}
            className="w-full px-3.5 py-2.5 bg-slate-50 text-gray-750 border border-gray-200 rounded-xl text-sm font-bold font-mono cursor-not-allowed outline-none"
          />
        </div>

        {/* Balance to Pack BS */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-gray-700 font-medium font-semibold">Balance to Pack (BS)</label>
            <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded font-bold font-mono uppercase font-semibold">Ironing BL - BR</span>
          </div>
          <input
            type="number"
            readOnly
            placeholder="Remaining boxes load"
            value={data.balanceToPack}
            className="w-full px-3.5 py-2.5 bg-slate-50 text-gray-750 border border-gray-200 rounded-xl text-sm font-bold font-mono cursor-not-allowed outline-none"
          />
        </div>

        {/* Possible FI Date BT */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700 font-medium">Possible FI Date (BT) *</label>
          <input
            type="date"
            required
            value={data.possibleFiDate}
            onChange={(e) => handleChange('possibleFiDate', e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold"
          />
        </div>

        {/* Remarks BU */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-xs font-bold text-gray-700 font-medium">Packaging Remarks / Status (BU)</label>
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
