/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { GeneralDetails } from '../types';
import { calculatePlannedMfrgQty } from '../utils';
import { CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';

interface StepGeneralDetailsProps {
  data: GeneralDetails;
  onUpdate: (updated: GeneralDetails) => void;
  onNext: () => void;
}

export const StepGeneralDetails: React.FC<StepGeneralDetailsProps> = ({
  data,
  onUpdate,
  onNext,
}) => {
  // Recalculating planned manufacturing quantity in real-time when orderQuantity changes
  useEffect(() => {
    if (data.orderQuantity !== '') {
      const calculatedVal = calculatePlannedMfrgQty(Number(data.orderQuantity));
      if (calculatedVal !== data.plannedMfrgQty) {
        onUpdate({
          ...data,
          plannedMfrgQty: calculatedVal,
        });
      }
    } else if (data.plannedMfrgQty !== '') {
      onUpdate({ ...data, plannedMfrgQty: '' });
    }
  }, [data.orderQuantity]);

  const handleChange = (field: keyof GeneralDetails, value: any) => {
    onUpdate({
      ...data,
      [field]: value,
    });
  };

  const isFormValid = true; // No field mandatory in form

  return (
    <div id="step-general-details" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
      
      {/* Step Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Step 1 of 9</span>
          <h2 className="text-lg font-bold text-gray-900 mt-1">General Details & Planning</h2>
          <p className="text-xs text-gray-500">Order profile info and planned production quantities</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* 1. Sr.No */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700">Sr.No</label>
          <input
            type="text"
            placeholder="Enter Serial Number"
            value={data.srNo || ''}
            onChange={(e) => handleChange('srNo', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 focus:bg-white text-gray-900 border border-gray-200 focus:border-emerald-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold font-mono"
          />
        </div>

        {/* 2. Buyer Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700">Buyer Name</label>
          <input
            type="text"
            placeholder="Enter buyer name"
            value={data.buyerName}
            onChange={(e) => handleChange('buyerName', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 focus:bg-white text-gray-900 border border-gray-200 focus:border-emerald-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold"
          />
        </div>

        {/* 3. Style No */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700">Style No</label>
          <input
            type="text"
            placeholder="Enter style code"
            value={data.styleNo}
            onChange={(e) => handleChange('styleNo', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 focus:bg-white text-gray-900 border border-gray-200 focus:border-emerald-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold font-mono"
          />
        </div>

        {/* 4. PO. Number */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700">PO. Number</label>
          <input
            type="text"
            placeholder="Enter purchase order number"
            value={data.poNumber}
            onChange={(e) => handleChange('poNumber', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 focus:bg-white text-gray-900 border border-gray-200 focus:border-emerald-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold"
          />
        </div>

        {/* 5. PO Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700">PO Date</label>
          <input
            type="date"
            value={data.poDate}
            onChange={(e) => handleChange('poDate', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 focus:bg-white text-gray-900 border border-gray-200 focus:border-emerald-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold"
          />
        </div>

        {/* 6. Garment Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700">Garment Description</label>
          <input
            type="text"
            placeholder="e.g. Round Neck cotton T-shirt"
            value={data.garmentDescription}
            onChange={(e) => handleChange('garmentDescription', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 focus:bg-white text-gray-900 border border-gray-200 focus:border-emerald-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold"
          />
        </div>

        {/* 7. Fabric Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700">Fabric Description</label>
          <input
            type="text"
            placeholder="e.g. 100% Combed Cotton Single Jersey"
            value={data.fabricDescription}
            onChange={(e) => handleChange('fabricDescription', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 focus:bg-white text-gray-900 border border-gray-200 focus:border-emerald-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold"
          />
        </div>

        {/* 8. G.S.M */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700">G.S.M</label>
          <input
            type="text"
            placeholder="e.g. 180, 220"
            value={data.gsm}
            onChange={(e) => handleChange('gsm', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 focus:bg-white text-gray-900 border border-gray-200 focus:border-emerald-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold font-mono"
          />
        </div>

        {/* 9. Color */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700">Color</label>
          <input
            type="text"
            placeholder="e.g. Navy Blue"
            value={data.color}
            onChange={(e) => handleChange('color', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 focus:bg-white text-gray-900 border border-gray-200 focus:border-emerald-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold"
          />
        </div>

        {/* 10. Order Quantity */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700">Order Quantity (pcs)</label>
          <input
            type="number"
            min="1"
            placeholder="e.g. 10000"
            value={data.orderQuantity}
            onChange={(e) => handleChange('orderQuantity', e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 focus:bg-white text-gray-900 border border-gray-200 focus:border-emerald-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold font-mono text-emerald-800"
          />
        </div>

        {/* 11. Pland Mfrng Qty */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-700">Pland Mfrng Qty</label>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold font-mono">Order Qty + 3%</span>
          </div>
          <div className="relative">
            <input
              type="number"
              readOnly
              placeholder="Calculated (Order Qty * 1.03)"
              value={data.plannedMfrgQty}
              className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-500 border border-gray-200 rounded-xl text-sm font-bold font-mono cursor-not-allowed outline-none select-none"
            />
          </div>
        </div>

        {/* 12. Ex. Factory Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700">Ex. Factory Date</label>
          <input
            type="date"
            value={data.exFactoryDate}
            onChange={(e) => handleChange('exFactoryDate', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 focus:bg-white text-gray-900 border border-gray-200 focus:border-emerald-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold"
          />
        </div>

        {/* 13. Plan Consumption Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-750 text-emerald-800">Plan Consumption Option</label>
          <select
            value={data.planConsumptionType}
            onChange={(e) => handleChange('planConsumptionType', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-emerald-50/50 hover:bg-emerald-50 focus:bg-white text-gray-900 border border-emerald-150 focus:border-emerald-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold"
          >
            <option value="">-- Select Option --</option>
            <option value="Fabric">Fabric Only</option>
            <option value="Trims">Trims Only</option>
            <option value="Both">Both (Fabric & Trims)</option>
          </select>
        </div>

        {/* Fabric Consumption Value */}
        {(data.planConsumptionType === 'Fabric' || data.planConsumptionType === 'Both') && (
          <div className="flex flex-col gap-1.5 animate-fade-in block">
            <label className="text-xs font-bold text-emerald-800">Fabric Consumption Value (KG / pc)</label>
            <input
              type="number"
              step="0.001"
              placeholder="e.g. 0.250"
              value={data.fabricConsumptionValue}
              onChange={(e) => handleChange('fabricConsumptionValue', e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-emerald-50/20 hover:bg-white focus:bg-white text-gray-900 border border-emerald-100 focus:border-emerald-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold font-mono"
            />
          </div>
        )}

        {/* Trims Consumption Value */}
        {(data.planConsumptionType === 'Trims' || data.planConsumptionType === 'Both') && (
          <div className="flex flex-col gap-1.5 animate-fade-in block">
            <label className="text-xs font-bold text-emerald-800">Trims Consumption Value (items / pc)</label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 6.00 (e.g. buttons)"
              value={data.trimsConsumptionValue}
              onChange={(e) => handleChange('trimsConsumptionValue', e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-emerald-50/20 hover:bg-white focus:bg-white text-gray-900 border border-emerald-100 focus:border-emerald-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold font-mono"
            />
          </div>
        )}

      </div>

      {/* Save Step Action */}
      <div className="border-t border-gray-100 pt-5 flex items-center justify-between font-semibold">
        <span className="text-xs text-gray-400 italic">All fields are optional. Fill as needed and click Save & Next.</span>
        <button
          onClick={onNext}
          id="btn-save-step1"
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
