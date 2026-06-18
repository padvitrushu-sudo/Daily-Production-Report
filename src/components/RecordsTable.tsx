/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProductionReport, Branch } from '../types';
import { getInitialGeneral, calculateFabricRequirements, calculateCuttingCumulative, calculateAqlPct } from '../utils';
import { Search, MapPin, Download, Trash2, Layers, CheckCircle, Clock } from 'lucide-react';

interface RecordsTableProps {
  records: ProductionReport[];
  selectedBranch: Branch;
  onDeleteRecord: (id: string) => void;
  user: { username: string; branch: Branch | 'Admin'; label: string } | null;
}

export const RecordsTable: React.FC<RecordsTableProps> = ({
  records,
  selectedBranch,
  onDeleteRecord,
  user,
}) => {
  const [searchQuery, setSearchQuery] = useState('');


  // Filter records by active branch and optional search query
  const filteredRecords = records.filter((rec) => {
    const matchesBranch = rec.branch === selectedBranch;
    const matchesQuery =
      rec.general.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.general.styleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.general.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.general.garmentDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBranch && matchesQuery;
  });

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;

    // Headers matching the Google Sheet design
    const headers = [
      "Timestamp", "Sr.No", "Buyer Name", "Style No", "PO. Number", "PO Date", "Garment Description", "Fabric Description", "G.S.M ", "Color", 
      "Order Quantity", "Pland Mfrng Qty", "Ex. Factory Date", "Fabric", "Trims", "Required Qty", "Plan In House Date", "Received InHouse Date", "Received Qty", "Balance Qty Received",
      "Item", "Required Qty", "Received Qty", "Balance Qty to Received",
      "Items", "Required Qty", "Recived Qty", "Bal to Receieved", "Remarks",
      "Plan Start Date", "Actual Start Date", "Plan Cut Qty (+ %)", "Actual Consumption", "Qty Today", "Qty Upto Yesterday", "Grand Total Cumulative", "Balance To Cut",
      "Today", "Cumulative", "Balance to Load", "Remark",
      "Today", "Cumulative", "Balance to Sew", "Remark",
      "Today", "Cumulative", "Balance", "Total Used to Manpower", "Cost Per Piecs",
      "Today", "Cumulative", "Balance", "Total Used to Manpower", "", "Cost Per Piecs",
      "Today", "Cumulative", "Balance", "Today Re-submission", "Cumulative Resubmission", "% Re-submission ",
      "Today", "Cumulative", "Balance to Pack", "Total Used to Manpower", "", "Cost Per Pics",
      "Today", "Cumulative", "Balance to Pack", "Possible FI Date", "Remark"
    ];

    const csvRows = [headers.join(',')];

    for (const rec of filteredRecords) {
      const g = rec.general;
      const f = rec.fabric;
      const c = rec.cutting;
      const s = rec.sewing;
      const fin = rec.finishing;
      const i = rec.ironingPacking;
      const ctn = rec.ctnPacking;

      const fabReq = calculateFabricRequirements(g.plannedMfrgQty, g.fabricConsumptionValue) || 0;
      const fabRec = f.receivedQty || 0;
      const fabBal = fabReq ? (fabReq - fabRec) : 0;

      // Trims & Accessories Serializations
      const trimNames = (rec.trims || []).map(x => x.item || '').join('; ');
      const trimReqs = (rec.trims || []).map(x => x.requiredQty || '').join('; ');
      const trimRecvs = (rec.trims || []).map(x => x.receivedQty || '').join('; ');
      const trimBals = (rec.trims || []).map(x => x.balanceQtyToReceive !== undefined ? x.balanceQtyToReceive : '').join('; ');

      const accNames = (rec.accessories || []).map(x => x.item || '').join('; ');
      const accReqs = (rec.accessories || []).map(x => x.requiredQty || '').join('; ');
      const accRecvs = (rec.accessories || []).map(x => x.receivedQty || '').join('; ');
      const accBals = (rec.accessories || []).map(x => x.balanceToReceive !== undefined ? x.balanceToReceive : '').join('; ');
      const accRemarks = (rec.accessories || []).map(x => x.remarks || '').join('; ');

      const cutCum = calculateCuttingCumulative(c.qtyToday, c.qtyUptoYesterday) || 0;
      const cutBal = c.planCutQtyPct ? (Number(c.planCutQtyPct) - cutCum) : 0;

      const trim = fin.trimming || { today: '', cumulative: '', balance: '', totalUsedManpower: '', costPerPiece: '' };
      const chk = fin.checking || { today: '', cumulative: '', balance: '', totalUsedManpower: '', costPerPiece: '' };
      const aql = fin.aqlAudit || { today: '', cumulative: '', balance: '', todayResubmission: '', cumulativeResubmission: '', pctResubmission: '' };
      
      const computedAqlPct = calculateAqlPct(Number(aql.cumulativeResubmission), Number(aql.cumulative)) || '0%';

      const values = [
        `"${new Date(rec.timestamp).toISOString()}"`,
        `"${g.srNo || ''}"`,
        `"${g.buyerName || ''}"`,
        `"${g.styleNo || ''}"`,
        `"${g.poNumber || ''}"`,
        `"${g.poDate || ''}"`,
        `"${g.garmentDescription || ''}"`,
        `"${g.fabricDescription || ''}"`,
        `"${g.gsm || ''}"`,
        `"${g.color || ''}"`,
        g.orderQuantity || 0,
        g.plannedMfrgQty || 0,
        `"${g.exFactoryDate || ''}"`,
        g.fabricConsumptionValue || 0,
        g.trimsConsumptionValue || 0,
        fabReq,
        `"${f.planInHouseDate || ''}"`,
        `"${f.receivedInHouseDate || ''}"`,
        fabRec,
        fabBal,
        
        // Trims (Col U-X: 21-24)
        `"${trimNames}"`,
        `"${trimReqs}"`,
        `"${trimRecvs}"`,
        `"${trimBals}"`,
        
        // Accessories (Col Y-AC: 25-29)
        `"${accNames}"`,
        `"${accReqs}"`,
        `"${accRecvs}"`,
        `"${accBals}"`,
        `"${accRemarks}"`,
        
        // Cutting (Col AD-AK: 30-37)
        `"${c.planStartDate || ''}"`,
        `"${c.actualStartDate || ''}"`,
        c.planCutQtyPct || 0,
        c.actualConsumption || 0,
        c.qtyToday || 0,
        c.qtyUptoYesterday || 0,
        cutCum,
        cutBal,
        
        // Sewing Input (Col AL-AO: 38-41)
        s.input ? s.input.today : 0,
        s.input ? s.input.cumulative : 0,
        s.input ? s.input.balanceToLoad : 0,
        `"${s.input ? s.input.remark : ''}"`,
        
        // Sewing Output (Col AP-AS: 42-45)
        s.output ? s.output.today : 0,
        s.output ? s.output.cumulative : 0,
        s.output ? s.output.balanceToSew : 0,
        `"${s.output ? s.output.remark : ''}"`,
        
        // Trimming (Col AT-AX: 46-50)
        trim.today || 0,
        trim.cumulative || 0,
        trim.balance || 0,
        trim.totalUsedManpower || 0,
        trim.costPerPiece || 0,
        
        // Checking (Col AY-BD: 51-56)
        chk.today || 0,
        chk.cumulative || 0,
        chk.balance || 0,
        chk.totalUsedManpower || 0,
        "", // Column BC blank
        (chk.totalUsedManpower && chk.today) ? (Number(chk.totalUsedManpower) / Number(chk.today)).toFixed(2) : 0,
        
        // AQL Audit (Col BE-BJ: 57-62)
        aql.today || 0,
        aql.cumulative || 0,
        aql.balance || 0,
        aql.todayResubmission || 0,
        aql.cumulativeResubmission || 0,
        `"${computedAqlPct}"`,
        
        // Ironing & Packing (Col BK-BP: 63-68)
        i.today || 0,
        i.cumulative || 0,
        i.balanceToPack || 0,
        i.totalUsedManpower || 0,
        "", // Column BO blank
        i.costPerPiece || 0,
        
        // Carton Packing (Col BQ-BU: 69-73)
        ctn.today || 0,
        ctn.cumulative || 0,
        ctn.balanceToPack || 0,
        `"${ctn.possibleFiDate || ''}"`,
        `"${ctn.remark || ''}"`
      ];

      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Daily_Production_Report_${selectedBranch}_${new Date().toLocaleDateString()}.csv`);
    link.click();
  };

  return (
    <div id="records-table" className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-4">
      
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center space-x-1.5">
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>Database Archives ({selectedBranch})</span>
          </h2>
          <p className="text-xs text-gray-500">View and audit stored production records for the active branch</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            disabled={filteredRecords.length === 0}
            className={`w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition-colors shadow-xs border ${
              filteredRecords.length > 0
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Export Active CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex bg-gray-50 p-2 rounded-xl items-center focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/10 border border-transparent focus-within:border-emerald-500 transition-all">
        <Search className="w-4.5 h-4.5 text-gray-400 ml-2 mr-2.5 flex-shrink-0" />
        <input
          type="text"
          placeholder="Filter archives by Buyer Name, Style No, PO Number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-sm text-gray-900 outline-none w-full placeholder-gray-400 font-medium"
        />
      </div>

      {/* Grid List */}
      {filteredRecords.length > 0 ? (
        <div className="overflow-x-auto border rounded-xl divide-y">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-700 font-bold uppercase tracking-wider">
                <th className="p-3">Profile / Style</th>
                <th className="p-3">Order / Planned</th>
                <th className="p-3">Cutting Today</th>
                <th className="p-3">Sewing Off Today</th>
                <th className="p-3">Finishing Output</th>
                <th className="p-3">CTN Today</th>
                <th className="p-3 text-center">Receipt</th>
                <th className="p-3 text-center">{user?.branch === 'Admin' ? 'Remove' : 'Role Security'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRecords.map((rec) => {
                const g = rec.general;
                const c = rec.cutting;
                const s = rec.sewing;
                const f = rec.finishing;
                
                let finishingDesc = 'N/A';
                if (f.subType === 'Trimming') finishingDesc = `Trim: ${f.trimming.today || 0}`;
                else if (f.subType === 'Checking') finishingDesc = `Check: ${f.checking.today || 0}`;
                else if (f.subType === 'AQL Audit') finishingDesc = `AQL: ${f.aqlAudit.today || 0}`;

                return (
                  <tr key={rec.id} className="hover:bg-gray-50/50">
                    <td className="p-3 space-y-1">
                      <div className="font-semibold text-gray-950 truncate max-w-[150px]">{g.buyerName || 'N/A'}</div>
                      <div className="text-[10px] text-gray-500 flex flex-wrap items-center gap-1.5 font-semibold">
                        <span className="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.2 rounded font-bold">Sr: {g.srNo || '#'}</span>
                        <span className="font-mono bg-slate-100 text-slate-700 px-1 py-0.2 rounded font-bold">Style: {g.styleNo || 'N/A'}</span>
                        <span>• PO: {g.poNumber || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-gray-800 font-medium">{g.orderQuantity || 0} pcs</div>
                      <div className="text-[10px] text-gray-500 font-mono">Plan: {g.plannedMfrgQty || 0}</div>
                    </td>
                    <td className="p-3 text-gray-700 font-mono font-medium">{c.qtyToday || 0}</td>
                    <td className="p-3 text-gray-700 font-mono font-medium">{s.output.today || 0}</td>
                    <td className="p-3 text-gray-700 font-medium">{finishingDesc}</td>
                    <td className="p-3 text-gray-700 font-mono font-medium">{rec.ctnPacking.today || 0}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 text-[10px] rounded-full font-bold uppercase tracking-wider ${
                        rec.status === 'Submitted'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {rec.status === 'Submitted' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        <span>{rec.status}</span>
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {user?.branch === 'Admin' ? (
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete report for Style ${g.styleNo}? This cannot be undone.`)) {
                              onDeleteRecord(rec.id);
                            }
                          }}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100-active"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider inline-flex items-center gap-1 border border-gray-200">
                          🔒 LOCKED
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed rounded-xl bg-slate-50 text-slate-400">
          <Layers className="w-8 h-8 mx-auto stroke-1.5 text-slate-350" />
          <h3 className="text-xs font-semibold mt-2.5 text-gray-700">No stored sheets found</h3>
          <p className="text-[10px] text-gray-500 max-w-xs mx-auto mt-1">
            There are no finalized production records for the branch <strong className="text-gray-800">{selectedBranch}</strong>. Switch branches or fill out the multi-step form to append entries.
          </p>
        </div>
      )}

    </div>
  );
};
