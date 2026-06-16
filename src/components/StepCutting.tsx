/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CuttingDetails } from '../types';
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar, ClipboardList } from 'lucide-react';

interface StepCuttingProps {
  data: CuttingDetails;
  plannedMfrgQty?: number | '';
  onUpdate: (updated: CuttingDetails) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const StepCutting: React.FC<StepCuttingProps> = ({
  data,
  plannedMfrgQty = '',
  onUpdate,
  onPrev,
  onNext,
}) => {
  const getTodayDateString = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  const [logQty, setLogQty] = useState<number | ''>('');
  const [logDate, setLogDate] = useState(getTodayDateString());

  const history = data.history || [];
  const todayStr = getTodayDateString();

  // Sync planCutQtyPct with plannedMfrgQty if empty
  useEffect(() => {
    if (plannedMfrgQty !== '' && (!data.planCutQtyPct || data.planCutQtyPct === '')) {
      onUpdate({
        ...data,
        planCutQtyPct: plannedMfrgQty,
      });
    }
  }, [plannedMfrgQty, data.planCutQtyPct]);

  // Derive qtyToday as sum of today's logged entries
  const derivedQtyToday = history
    .filter((h) => h.date === todayStr)
    .reduce((sum, h) => sum + h.qty, 0);

  // Derive qtyUptoYesterday as sum of entries < today
  const derivedQtyUptoYesterday = history
    .filter((h) => h.date < todayStr)
    .reduce((sum, h) => sum + h.qty, 0);

  // Derive Grand Total Cumulative (AJ)
  const derivedCumulative = derivedQtyToday + derivedQtyUptoYesterday;

  // Derive Balance to Cut (AK) = (Pland Mfrng Qty - Grand Total Cumulative AJ)
  const targetPlanQty = data.planCutQtyPct !== '' ? Number(data.planCutQtyPct) : (plannedMfrgQty !== '' ? Number(plannedMfrgQty) : 0);
  const derivedBalance = targetPlanQty - derivedCumulative;

  // Sync calculated values back to parent state when history changes
  useEffect(() => {
    if (
      data.qtyToday !== derivedQtyToday ||
      data.qtyUptoYesterday !== derivedQtyUptoYesterday
    ) {
      onUpdate({
        ...data,
        qtyToday: derivedQtyToday,
        qtyUptoYesterday: derivedQtyUptoYesterday,
      });
    }
  }, [derivedQtyToday, derivedQtyUptoYesterday]);

  const handleAddLog = () => {
    if (logQty === '' || isNaN(Number(logQty)) || Number(logQty) <= 0) return;

    const newLog = {
      id: `cut_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      date: logDate,
      qty: Number(logQty),
    };

    const updatedHistory = [...history, newLog];
    
    // Sort history by date descending
    updatedHistory.sort((a, b) => b.date.localeCompare(a.date));

    // Calculate active sums for immediate update
    const newQtyToday = updatedHistory
      .filter((h) => h.date === todayStr)
      .reduce((sum, h) => sum + h.qty, 0);

    const newQtyUptoYesterday = updatedHistory
      .filter((h) => h.date < todayStr)
      .reduce((sum, h) => sum + h.qty, 0);

    onUpdate({
      ...data,
      history: updatedHistory,
      qtyToday: newQtyToday,
      qtyUptoYesterday: newQtyUptoYesterday,
    });

    setLogQty(''); // Clear "Qty Today" input on logging as requested!
  };

  const handleDeleteLog = (id: string) => {
    const updatedHistory = history.filter((h) => h.id !== id);

    const newQtyToday = updatedHistory
      .filter((h) => h.date === todayStr)
      .reduce((sum, h) => sum + h.qty, 0);

    const newQtyUptoYesterday = updatedHistory
      .filter((h) => h.date < todayStr)
      .reduce((sum, h) => sum + h.qty, 0);

    onUpdate({
      ...data,
      history: updatedHistory,
      qtyToday: newQtyToday,
      qtyUptoYesterday: newQtyUptoYesterday,
    });
  };

  const handleChange = (field: keyof CuttingDetails, value: any) => {
    onUpdate({
      ...data,
      [field]: value,
    });
  };

  const isFormValid = true; // No field mandatory in form

  return (
    <div id="step-cutting" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Step 4 of 9</span>
          <h2 className="text-lg font-bold text-gray-900 mt-1">Cutting Room Report</h2>
          <p className="text-xs text-gray-500 font-medium">Log fabric layout Cutting schedules, consumption weights, and pieces cut</p>
        </div>
      </div>

      {/* Date & Quantity Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 p-4 rounded-xl border border-gray-150/50">
        
        {/* Plan Start Date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-750">Plan Start Date (AD) *</label>
          <input
            type="date"
            required
            value={data.planStartDate}
            onChange={(e) => handleChange('planStartDate', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 font-semibold"
          />
        </div>

        {/* Actual Start Date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-750">Actual Start Date (AE) *</label>
          <input
            type="date"
            required
            value={data.actualStartDate}
            onChange={(e) => handleChange('actualStartDate', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 font-semibold"
          />
        </div>

        {/* Plan Cut Qty (+ %) */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-750">Plan Cut Qty (+ %)</label>
          <input
            type="number"
            readOnly
            value={targetPlanQty}
            className="w-full px-3 py-2 bg-slate-100 text-slate-700 font-bold border border-gray-200 rounded-lg text-sm font-mono cursor-not-allowed"
            title="Sourced from General Details: Planned Manufacturing Quantity"
          />
          <span className="text-[10px] text-gray-400 mt-0.5">Sourced from Planned Mfg Qty</span>
        </div>

        {/* Actual Consumption */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-750">Actual Consumption (AG)</label>
          <input
            type="number"
            step="0.001"
            placeholder="e.g. 0.285 kg/pc"
            value={data.actualConsumption}
            onChange={(e) => handleChange('actualConsumption', e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-emerald-500 font-semibold"
          />
          <span className="text-[10px] text-gray-400 mt-0.5">Manual consumption weight</span>
        </div>

      </div>

      {/* Cutting Output Logging Panel */}
      <div className="border border-emerald-100 bg-emerald-50/20 p-4.5 rounded-xl space-y-4">
        
        <div className="flex items-center gap-2 text-emerald-850">
          <ClipboardList className="w-4.5 h-4.5 text-emerald-600" />
          <h3 className="text-sm font-bold">Add Daily Cut Log</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          
          {/* Target Cut Date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-emerald-800">Cut Output Date</label>
            <div className="relative">
              <input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-emerald-500"
              />
              <Calendar className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Today Cut Qty */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-emerald-800">Pieces Cut Quantity (Manual)</label>
            <input
              type="number"
              placeholder="e.g. 2500"
              value={logQty}
              onChange={(e) => setLogQty(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>

          {/* Log Button */}
          <button
            type="button"
            onClick={handleAddLog}
            disabled={logQty === '' || Number(logQty) <= 0}
            className={`w-full py-2 px-4 rounded-lg font-bold text-sm tracking-tight flex items-center justify-center space-x-1.5 transition-all shadow-md ${
              logQty !== '' && Number(logQty) > 0
                ? 'bg-emerald-650 hover:bg-emerald-700 text-white shadow-emerald-600/10'
                : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Log Daily Cut (Clears field)</span>
          </button>

        </div>

      </div>

      {/* Numerical Analysis / Outputs */}
      <h3 className="text-sm font-bold text-gray-850 mt-2">Continuous Output Tracking</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Qty Today Summary */}
        <div className="bg-slate-50 p-4.5 rounded-xl border border-gray-100/60 text-center">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Qty Today (AH)</span>
          <p className="text-lg font-black font-mono text-gray-800 mt-1">
            {derivedQtyToday}
          </p>
          <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-1.5 inline-block font-semibold">Today's Logs Sum</span>
        </div>

        {/* Qty Upto Yesterday */}
        <div className="bg-slate-50 p-4.5 rounded-xl border border-gray-100/60 text-center">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Qty Upto Yesterday (AI)</span>
          <p className="text-lg font-black font-mono text-gray-800 mt-1">
            {derivedQtyUptoYesterday}
          </p>
          <span className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-1.5 inline-block font-semibold">Prior Logs Sum</span>
        </div>

        {/* Grand Total Cumulative */}
        <div className="bg-slate-50 p-4.5 rounded-xl border border-gray-100/60 text-center">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Cumulative Output (AJ)</span>
          <p className="text-lg font-black font-mono text-emerald-700 mt-1">
            {derivedCumulative}
          </p>
          <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-1.5 inline-block font-semibold">Total Cut Pieces</span>
        </div>

        {/* Balance to Cut */}
        <div className="bg-slate-50 p-4.5 rounded-xl border border-gray-100/60 text-center">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Balance To Cut (AK)</span>
          <p className={`text-lg font-black font-mono mt-1 ${derivedBalance <= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
            {derivedBalance}
          </p>
          <span className="text-[9px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded mt-1.5 inline-block font-semibold">Target - Cumulative</span>
        </div>

      </div>

      {/* History Ledger Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
          <span>Cutting Output Logs History</span>
          <span className="text-xs font-semibold text-gray-550 bg-gray-100 px-2 py-0.5 rounded-full">{history.length} Entries</span>
        </h3>

        {history.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-55/60 border-b text-gray-700 font-bold uppercase tracking-wider">
                  <th className="p-3">Cut Date</th>
                  <th className="p-3">Logged Quantity</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {history.map((h) => {
                  const isTodayLog = h.date === todayStr;
                  return (
                    <tr key={h.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-gray-750 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{h.date}</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-gray-800">{h.qty.toLocaleString()} pcs</td>
                      <td className="p-3">
                        {isTodayLog ? (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full uppercase">Today's Cut (AH)</span>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase">Yesterday / Prior (AI)</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteLog(h.id)}
                          type="button"
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                          title="Delete Cut Log Entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed rounded-xl bg-slate-50 text-slate-400">
            <p className="text-xs font-semibold">No daily cutting outputs logged yet.</p>
            <p className="text-[10px] mt-1">Please insert target cutting quantities above using the manual log form.</p>
          </div>
        )}
      </div>

      {/* Navigation Footers */}
      <div className="border-t border-gray-100 pt-5 flex items-center justify-between">
        <button
          onClick={onPrev}
          id="btn-prev-step4"
          className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm tracking-tight hover:bg-gray-50 flex items-center space-x-1.5 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          onClick={onNext}
          id="btn-save-step4"
          disabled={!isFormValid}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm tracking-tight flex items-center space-x-1.5 transition-all shadow-md ${
            isFormValid
              ? 'bg-emerald-650 hover:bg-emerald-750 text-white shadow-emerald-500/10'
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
