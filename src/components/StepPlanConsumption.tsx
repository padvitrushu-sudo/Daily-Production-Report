/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GeneralDetails, FabricDetails, TrimItem } from '../types';
import { calculateFabricRequirements, calculateFabricBalance, calculateTrimsRequirement, calculateTrimBalance } from '../utils';
import { ChevronLeft, ChevronRight, Plus, Trash2, HelpCircle } from 'lucide-react';

interface StepPlanConsumptionProps {
  generalData: GeneralDetails;
  fabricData: FabricDetails;
  trimsData: TrimItem[];
  onUpdateFabric: (fabric: FabricDetails) => void;
  onUpdateTrims: (trims: TrimItem[]) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const StepPlanConsumption: React.FC<StepPlanConsumptionProps> = ({
  generalData,
  fabricData,
  trimsData,
  onUpdateFabric,
  onUpdateTrims,
  onPrev,
  onNext,
}) => {
  const [trimItemName, setTrimItemName] = useState('');
  const [trimReceived, setTrimReceived] = useState<number | ''>('');

  // Calculations
  const calculatedFabricRequired = calculateFabricRequirements(
    generalData.plannedMfrgQty,
    generalData.fabricConsumptionValue
  );

  const calculatedFabricBalance = calculateFabricBalance(
    calculatedFabricRequired,
    fabricData.receivedQty
  );

  // Auto initialize Trims table with a default item if empty
  useEffect(() => {
    if (
      (generalData.planConsumptionType === 'Trims' || generalData.planConsumptionType === 'Both') &&
      trimsData.length === 0
    ) {
      const defaultReq = calculateTrimsRequirement(
        generalData.plannedMfrgQty,
        generalData.trimsConsumptionValue
      );
      onUpdateTrims([
        {
          id: `trim_${Date.now()}`,
          item: 'Main Trims Brand Label',
          requiredQty: defaultReq,
          receivedQty: '',
          balanceQtyToReceive: defaultReq,
        },
      ]);
    }
  }, [generalData.planConsumptionType, generalData.plannedMfrgQty, generalData.trimsConsumptionValue]);

  const handleFabricChange = (field: keyof FabricDetails, value: any) => {
    onUpdateFabric({
      ...fabricData,
      [field]: value,
    });
  };

  const handleAddTrimItem = () => {
    if (!trimItemName.trim()) return;
    const required = calculateTrimsRequirement(
      generalData.plannedMfrgQty,
      generalData.trimsConsumptionValue
    );
    const receivedVal = trimReceived === '' ? 0 : trimReceived;
    const balance = calculateTrimBalance(required, receivedVal);

    onUpdateTrims([
      ...trimsData,
      {
        id: `trim_${Date.now()}`,
        item: trimItemName,
        requiredQty: required,
        receivedQty: trimReceived,
        balanceQtyToReceive: balance,
      },
    ]);

    setTrimItemName('');
    setTrimReceived('');
  };

  const handleUpdateTrimReceived = (id: string, receivedVal: number | '') => {
    const updated = trimsData.map((trim) => {
      if (trim.id === id) {
        const balance = calculateTrimBalance(trim.requiredQty, receivedVal);
        return {
          ...trim,
          receivedQty: receivedVal,
          balanceQtyToReceive: balance,
        };
      }
      return trim;
    });
    onUpdateTrims(updated);
  };

  const handleDeleteTrim = (id: string) => {
    onUpdateTrims(trimsData.filter((t) => t.id !== id));
  };

  const isFabricActive = generalData.planConsumptionType === 'Fabric' || generalData.planConsumptionType === 'Both';
  const isTrimsActive = generalData.planConsumptionType === 'Trims' || generalData.planConsumptionType === 'Both';

  const isFormValid = true; // No field mandatory in form

  return (
    <div id="step-plan-consumption" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Step 2 of 9</span>
          <h2 className="text-lg font-bold text-gray-900 mt-1">Plan Consumption</h2>
          <p className="text-xs text-gray-500">
            Details for {generalData.planConsumptionType} Consumption based on {generalData.plannedMfrgQty || 0} planned garments
          </p>
        </div>
      </div>

      {/* Fabric Consumption Subform */}
      {isFabricActive && (
        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Fabric Requirements & In-House Tracking</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            
            {/* Required Quantity (Auto output) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-750">Required Qty (KG)</label>
              <div className="relative">
                <input
                  type="number"
                  readOnly
                  value={calculatedFabricRequired}
                  className="w-full px-3 py-2 bg-white text-emerald-700 border border-gray-200 rounded-lg text-sm font-bold font-mono cursor-not-allowed select-none"
                  placeholder="Auto-calculated (Qty * Consumption)"
                />
              </div>
            </div>

            {/* Plan In-House Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Plan In House Date (calender)</label>
              <input
                type="date"
                value={fabricData.planInHouseDate}
                onChange={(e) => handleFabricChange('planInHouseDate', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Received In-House Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Received InHouse Date (calender)</label>
              <input
                type="date"
                value={fabricData.receivedInHouseDate}
                onChange={(e) => handleFabricChange('receivedInHouseDate', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Received Quantity */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700">Received Qty (KG)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Manual fill"
                value={fabricData.receivedQty}
                onChange={(e) => handleFabricChange('receivedQty', e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Balance Quantity Received */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-750 flex items-center justify-between">
                <span>Balance Qty Received</span>
                <span className="text-[9px] text-amber-600 bg-amber-50 px-1 rounded">Required - Received</span>
              </label>
              <input
                type="number"
                readOnly
                value={calculatedFabricBalance}
                className="w-full px-3 py-2 bg-slate-100 text-slate-600 border border-gray-200 rounded-lg text-sm font-bold font-mono cursor-not-allowed"
                placeholder="Auto balance calculation"
              />
            </div>

          </div>
        </div>
      )}

      {/* Trims Consumption Subform */}
      {isTrimsActive && (
        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              <span>Trims Requirements & In-House Tracking</span>
            </h3>
            <span className="text-xs text-gray-500">Trim factor: <strong>{generalData.trimsConsumptionValue || '5'}</strong> (Default: 5)</span>
          </div>

          {/* Quick Add Trim Form */}
          <div className="p-4 bg-white rounded-xl border border-gray-150 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px] flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-650">Item (u)</label>
              <input
                type="text"
                placeholder="e.g. Logo buttons, Main zipper, Care label"
                value={trimItemName}
                onChange={(e) => setTrimItemName(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="w-[124px] flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-600">Received Qty (w)</label>
              </div>
              <input
                type="number"
                placeholder="Initial load"
                value={trimReceived}
                onChange={(e) => setTrimReceived(e.target.value === '' ? '' : Number(e.target.value))}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              onClick={handleAddTrimItem}
              type="button"
              disabled={!trimItemName.trim()}
              className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center space-x-1 ${
                trimItemName.trim()
                  ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Add Trim</span>
            </button>
          </div>

          {/* Trims Grid / Table */}
          {trimsData.length > 0 ? (
            <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-700 font-bold uppercase tracking-wider">
                    <th className="p-3">Item (u)</th>
                    <th className="p-3">Required Qty (v)</th>
                    <th className="p-3">Received Qty (w)</th>
                    <th className="p-3">Balance Qty to Received (x)</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {trimsData.map((trim) => (
                    <tr key={trim.id} className="hover:bg-gray-50/50">
                      <td className="p-3 font-semibold text-gray-800">{trim.item}</td>
                      <td className="p-3 font-mono font-bold text-teal-600">{trim.requiredQty}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={trim.receivedQty}
                          placeholder="Fill quantity"
                          onChange={(e) => handleUpdateTrimReceived(trim.id, e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-28 px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-sky-500 font-mono text-xs font-medium"
                        />
                      </td>
                      <td className={`p-3 font-mono font-bold ${Number(trim.balanceQtyToReceive) <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {trim.balanceQtyToReceive}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteTrim(trim.id)}
                          type="button"
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 bg-white border border-dashed rounded-xl text-gray-400 flex flex-col items-center justify-center gap-1">
              <p className="text-xs font-semibold">No trim items added yet.</p>
              <p className="text-[10px]">Add at least one trim item above to progress.</p>
            </div>
          )}
        </div>
      )}

      {/* Button Layout */}
      <div className="border-t border-gray-100 pt-5 flex items-center justify-between">
        <button
          onClick={onPrev}
          id="btn-prev-step2"
          className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm tracking-tight hover:bg-gray-50 active:bg-gray-100 flex items-center space-x-1.5 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          onClick={onNext}
          id="btn-save-step2"
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
