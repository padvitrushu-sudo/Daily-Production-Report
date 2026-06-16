/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AccessoryItem } from '../types';
import { calculateAccessoryBalance } from '../utils';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

interface StepAccessoriesProps {
  data: AccessoryItem[];
  plannedMfrgQty?: number | '';
  onUpdate: (updated: AccessoryItem[]) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const StepAccessories: React.FC<StepAccessoriesProps> = ({
  data,
  plannedMfrgQty = '',
  onUpdate,
  onPrev,
  onNext,
}) => {
  const [newItemName, setNewItemName] = useState('');
  
  const defaultRequired = plannedMfrgQty !== '' && !isNaN(Number(plannedMfrgQty))
    ? Math.round(Number(plannedMfrgQty) / 100 * 3 + Number(plannedMfrgQty))
    : '';

  const [newRequired, setNewRequired] = useState<number | ''>(defaultRequired);
  const [newReceived, setNewReceived] = useState<number | ''>('');
  const [newRemark, setNewRemark] = useState('');

  // Sync defaultRequired when plannedMfrgQty changes
  React.useEffect(() => {
    if (plannedMfrgQty !== '') {
      setNewRequired(defaultRequired);
    }
  }, [plannedMfrgQty]);

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    const req = newRequired === '' ? 0 : newRequired;
    const recv = newReceived === '' ? 0 : newReceived;
    const bal = calculateAccessoryBalance(req, recv);

    onUpdate([
      ...data,
      {
        id: `acc_${Date.now()}`,
        item: newItemName,
        requiredQty: newRequired === '' ? 0 : newRequired,
        receivedQty: newReceived,
        balanceToReceive: bal,
        remarks: newRemark,
      },
    ]);

    setNewItemName('');
    setNewRequired(defaultRequired);
    setNewReceived('');
    setNewRemark('');
  };

  const handleUpdateItem = (id: string, field: 'requiredQty' | 'receivedQty' | 'remarks', val: any) => {
    const updated = data.map((item) => {
      if (item.id === id) {
        const temp = { ...item, [field]: val };
        const req = temp.requiredQty === '' ? 0 : Number(temp.requiredQty);
        const recv = temp.receivedQty === '' ? 0 : Number(temp.receivedQty);
        temp.balanceToReceive = calculateAccessoryBalance(req, recv);
        return temp;
      }
      return item;
    });
    onUpdate(updated);
  };

  const handleDeleteItem = (id: string) => {
    onUpdate(data.filter((item) => item.id !== id));
  };

  return (
    <div id="step-accessories" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Step 3 of 9</span>
          <h2 className="text-lg font-bold text-gray-900 mt-1">Accessories Management</h2>
          <p className="text-xs text-gray-500">Track and plan general accessories (e.g. polybags, labels, hangtags, boxes)</p>
        </div>
      </div>

      {/* Quick Add Form */}
      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-600">Accessory Item Name</label>
          <input
            type="text"
            placeholder="e.g. Premium Polybag, Price Tag"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-600">Required Qty</label>
          <input
            type="number"
            placeholder="e.g. 10000"
            value={newRequired}
            onChange={(e) => setNewRequired(e.target.value === '' ? '' : Number(e.target.value))}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-600">Received Qty</label>
          <input
            type="number"
            placeholder="e.g. 9500"
            value={newReceived}
            onChange={(e) => setNewReceived(e.target.value === '' ? '' : Number(e.target.value))}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-600">Bal to Received (AB)</label>
          <input
            type="text"
            readOnly
            placeholder="Calculated empty"
            value={newRequired === '' ? ' ' : (Number(newRequired) - Number(newReceived || 0))}
            className="px-3 py-2 bg-slate-100 text-slate-700 font-bold border border-gray-200 rounded-lg text-sm font-mono cursor-not-allowed outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-600">Remarks</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Batch #4"
              value={newRemark}
              onChange={(e) => setNewRemark(e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleAddItem}
              type="button"
              disabled={!newItemName.trim()}
              className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-center ${
                newItemName.trim()
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Accessories Table */}
      {data.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-xl border border-gray-100">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-55/60 border-b text-gray-700 font-bold uppercase tracking-wider">
                <th className="p-3">Item Name</th>
                <th className="p-3">Required Qty</th>
                <th className="p-3">Received Qty</th>
                <th className="p-3">Bal to Received (AB)</th>
                <th className="p-3">Remarks</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="p-3 font-semibold text-gray-800">{item.item}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={item.requiredQty}
                      placeholder="Required"
                      onChange={(e) => handleUpdateItem(item.id, 'requiredQty', e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-24 px-2 py-1 border border-gray-200 rounded focus:border-emerald-500 font-mono text-xs"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={item.receivedQty}
                      placeholder="Received"
                      onChange={(e) => handleUpdateItem(item.id, 'receivedQty', e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-24 px-2 py-1 border border-gray-200 rounded focus:border-emerald-500 font-mono text-xs"
                    />
                  </td>
                  <td className={`p-3 font-semibold font-mono ${Number(item.balanceToReceive) <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {item.balanceToReceive}
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      placeholder="Add brief note"
                      value={item.remarks}
                      onChange={(e) => handleUpdateItem(item.id, 'remarks', e.target.value)}
                      className="px-2 py-1 border border-gray-200 rounded focus:border-emerald-500 text-xs w-full"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
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
        <div className="text-center py-8 border border-dashed rounded-xl bg-slate-50 text-slate-400">
          <p className="text-xs font-semibold">No accessories configured.</p>
          <p className="text-[10px] mt-1 text-slate-400">You can add custom ones above or skip to the next step if they don't apply.</p>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="border-t border-gray-100 pt-5 flex items-center justify-between">
        <button
          onClick={onPrev}
          id="btn-prev-step3"
          className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm tracking-tight hover:bg-gray-50 flex items-center space-x-1.5 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          onClick={onNext}
          id="btn-save-step3"
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm tracking-tight flex items-center space-x-1.5 shadow-md shadow-emerald-500/10 transition-all"
        >
          <span>Save & Next Step</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
