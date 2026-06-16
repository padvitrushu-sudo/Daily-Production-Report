/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProductionReport, BranchConfig } from '../types';
import { calculateFabricRequirements, calculateFabricBalance, calculateCuttingCumulative, calculateCuttingBalance, calculateAqlPct, calculateCostPerPiece } from '../utils';
import { ChevronLeft, CloudLightning, ShieldAlert, ArrowUpRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface StepSummarySubmitProps {
  report: ProductionReport;
  branchConfig: BranchConfig | undefined;
  onPrev: () => void;
  onSubmit: (finalReport: ProductionReport) => Promise<void>;
}

export const StepSummarySubmit: React.FC<StepSummarySubmitProps> = ({
  report,
  branchConfig,
  onPrev,
  onSubmit,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasSyncUrl = !!branchConfig?.webAppUrl;

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setErrorText(null);
    try {
      await onSubmit(report);
      setSuccess(true);
    } catch (err: any) {
      console.error('Submission failed:', err);
      setErrorText(err.message || 'Connecting to Google Sheets failed. Your report is securely saved in local history tab anyway!');
    } finally {
      setSubmitting(false);
    }
  };

  // Recalculating totals for visual representation in the panel
  const general = report.general;
  const fabric = report.fabric;
  const cutting = report.cutting;
  const sewing = report.sewing;
  const trimming = report.trimming;
  const finishing = report.finishing;
  const ironing = report.ironingPacking;
  const ctn = report.ctnPacking;

  const fabricReq = calculateFabricRequirements(general.plannedMfrgQty, general.fabricConsumptionValue);
  const fabricBal = calculateFabricBalance(fabricReq, fabric.receivedQty);
  const cuttingTotal = calculateCuttingCumulative(cutting.qtyToday, cutting.qtyUptoYesterday);
  const cuttingBal = calculateCuttingBalance(cutting.planCutQtyPct, cuttingTotal);

  const calculatedAqlPct = calculateAqlPct(Number(finishing.aqlAudit.cumulativeResubmission), Number(finishing.aqlAudit.cumulative));
  const calculatedCost = calculateCostPerPiece(ironing.totalUsedManpower, ironing.today);

  return (
    <div id="step-summary-submit" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Final Gate</span>
          <h2 className="text-lg font-bold text-gray-900 mt-1">Review & Dispatch Report</h2>
          <p className="text-xs text-gray-500">Confirm all parameters before appending directly to {report.branch} Google Sheets</p>
        </div>
      </div>

      {success ? (
        <div className="py-12 px-6 text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 mx-auto rounded-full flex items-center justify-center shadow-inner relative">
            <CheckCircle2 className="w-10 h-10" />
            <span className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-ping opacity-25"></span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Daily Report Dispatched!</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            The Daily Production ticket for style <strong className="text-gray-900">{general.styleNo || 'N/A'}</strong> has been successfully archived in the in-app history log{hasSyncUrl ? ' and pushed to the Google Sheet tab!' : '.'}
          </p>
          {hasSyncUrl && (
            <p className="text-xs text-emerald-600 font-medium">Sheet Tab: "{report.branch}" is up to date.</p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Status Bar */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            hasSyncUrl 
              ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' 
              : 'bg-amber-50/40 border-amber-100 text-amber-800'
          }`}>
            <div className="flex items-start gap-2.5">
              {hasSyncUrl ? (
                <div className="bg-emerald-500 text-white p-1 rounded-lg mt-0.5 sm:mt-0">
                  <CloudLightning className="w-4 h-4" />
                </div>
              ) : (
                <div className="bg-amber-500 text-white p-1 rounded-lg mt-0.5 sm:mt-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
              )}
              <div>
                <p className="text-xs font-bold leading-none">
                  {hasSyncUrl ? `Direct Sync Target: ${report.branch} Web API` : 'Local Log Mode (Disconnected)'}
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  {hasSyncUrl 
                    ? `Data will instantly write to active spreadsheet at sheet name "${report.branch}"`
                    : 'To write directly to Google Sheets, copy the script from the settings gear icon in header.'
                  }
                </p>
              </div>
            </div>
            {!hasSyncUrl && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100/50 px-2 py-0.5 rounded border border-amber-200">
                LOCAL ARCHIVE ACTIVE
              </span>
            )}
          </div>

          {/* Grid Layout of Data Summaries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-gray-650">
            
            {/* Box 1: Order Profiles */}
            <div className="p-4 rounded-xl border border-gray-100 bg-slate-50/30 space-y-2.5">
              <h3 className="font-bold text-gray-900 border-b pb-1 flex items-center justify-between">
                <span>1. Head Profile Details</span>
                <span className="text-[10px] text-gray-55 bg-gray-200 px-1.5 py-0.2 rounded font-normal font-mono">{report.branch}</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-gray-400">Buyer Name:</span> <strong className="text-gray-850 font-medium">{general.buyerName || 'N/A'}</strong></div>
                <div><span className="text-gray-400">Style No:</span> <strong className="text-gray-850 font-medium">{general.styleNo || 'N/A'}</strong></div>
                <div><span className="text-gray-400">PO Number:</span> <strong className="text-gray-850 font-medium">{general.poNumber || 'N/A'}</strong></div>
                <div><span className="text-gray-400">PO Date:</span> <strong className="text-gray-850 font-medium font-mono">{general.poDate || 'N/A'}</strong></div>
                <div><span className="text-gray-400">Order Quantity:</span> <strong className="text-emerald-700 font-bold font-mono">{general.orderQuantity || 0} pcs</strong></div>
                <div><span className="text-gray-400">Pland Mfrng Qty:</span> <strong className="text-emerald-700 font-bold font-mono">{general.plannedMfrgQty || 0} pcs</strong></div>
              </div>
            </div>

            {/* Box 2: Plan Consumption */}
            <div className="p-4 rounded-xl border border-gray-100 bg-slate-50/30 space-y-2.5">
              <h3 className="font-bold text-gray-900 border-b pb-1">2. Fabric / Trims In-House</h3>
              {general.planConsumptionType === 'Fabric' || general.planConsumptionType === 'Both' ? (
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-gray-400">Required Fabric:</span> <strong className="text-gray-850 font-mono font-medium">{fabricReq || 0} KG</strong></div>
                  <div><span className="text-gray-400">Received Fabric:</span> <strong className="text-gray-850 font-mono font-medium">{fabric.receivedQty || 0} KG</strong></div>
                  <div><span className="text-gray-400">Balance Qty:</span> <strong className="text-amber-700 font-mono font-bold">{fabricBal || 0} KG</strong></div>
                  <div><span className="text-gray-400">Received Date:</span> <strong className="text-gray-850 font-mono font-medium">{fabric.receivedInHouseDate || 'N/A'}</strong></div>
                </div>
              ) : (
                <p className="text-slate-400 text-[11px] italic">Fabric plan not active for this transaction.</p>
              )}
              {report.trims.length > 0 && (
                <div className="mt-1 pb-1 border-t pt-1 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 leading-none">Active Trims Checklist:</span>
                  <div className="max-h-16 overflow-y-auto divide-y divide-gray-100">
                    {report.trims.map(t => (
                      <div key={t.id} className="flex justify-between py-1 font-mono text-[10px]">
                        <span className="text-gray-600 truncate max-w-[120px]">{t.item}</span>
                        <span className="text-slate-500">Recv: {t.receivedQty || 0} / Bal: {t.balanceQtyToReceive}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Box 3: Cutting & Accessories */}
            <div className="p-4 rounded-xl border border-gray-100 bg-slate-50/30 space-y-2.5">
              <h3 className="font-bold text-gray-900 border-b pb-1">3. Cutting & Accessories</h3>
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-gray-400">Plan Cut Qty:</span> <strong className="text-gray-800 font-medium font-mono">{cutting.planCutQtyPct || 0}</strong></div>
                <div><span className="text-gray-400">Cut Today:</span> <strong className="text-gray-850 font-mono font-medium">{cutting.qtyToday || 0}</strong></div>
                <div><span className="text-gray-400">Cumulative Cut:</span> <strong className="text-gray-850 font-mono font-medium">{cuttingTotal || 0}</strong></div>
                <div><span className="text-gray-400">Balance to Cut:</span> <strong className={`font-bold font-mono ${Number(cuttingBal) <= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>{cuttingBal}</strong></div>
              </div>
              {report.accessories.length > 0 && (
                <div className="mt-1 border-t pt-1.5 space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Accessories Items:</span>
                  <div className="max-h-16 overflow-y-auto font-mono text-[10px] text-gray-600">
                    {report.accessories.map(acc => (
                      <div key={acc.id} className="flex justify-between py-0.5">
                        <span className="truncate max-w-[120px]">{acc.item}</span>
                        <span>Bal: {acc.balanceToReceive}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Box 4: Sewing Assembly */}
            <div className="p-4 rounded-xl border border-gray-100 bg-slate-50/30 space-y-2.5">
              <h3 className="font-bold text-gray-900 border-b pb-1">4. Sewing input/output (On/Off)</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 bg-white p-2 rounded border border-gray-100/80">
                  <span className="text-[10px] font-bold text-emerald-600 block uppercase tracking-wider">Input Loading (On MC)</span>
                  <div className="flex justify-between"><span>Today:</span> <strong className="font-mono">{sewing.input.today || 0}</strong></div>
                  <div className="flex justify-between"><span>Cumul:</span> <strong className="font-mono">{sewing.input.cumulative || 0}</strong></div>
                </div>
                <div className="space-y-1 bg-white p-2 rounded border border-gray-100/80">
                  <span className="text-[10px] font-bold text-sky-650 block uppercase tracking-wider">Output Discharge (Off MC)</span>
                  <div className="flex justify-between"><span>Today:</span> <strong className="font-mono">{sewing.output.today || 0}</strong></div>
                  <div className="flex justify-between"><span>Cumul:</span> <strong className="font-mono">{sewing.output.cumulative || 0}</strong></div>
                </div>
              </div>
            </div>

            {/* Box 5: Trimming & Finishing */}
            <div className="p-4 rounded-xl border border-gray-100 bg-slate-50/30 space-y-2.5 md:col-span-2">
              <h3 className="font-bold text-gray-900 border-b pb-1">5. Trimming, Finishing Assembly & Quality (AQL)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                
                {/* Trimming Sub Column */}
                <div className="space-y-1 bg-white p-2 rounded border border-gray-100">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase">Trimming Line Output</span>
                  <div className="flex justify-between"><span>Today:</span> <strong className="font-mono">{trimming.today || 0}</strong></div>
                  <div className="flex justify-between"><span>Manpower:</span> <strong className="font-mono">{trimming.totalUsedManpower || 0}</strong></div>
                  <div className="flex justify-between"><span>Rate/Piece:</span> <strong className="font-mono text-emerald-700 font-bold">₹{calculateCostPerPiece(trimming.totalUsedManpower, trimming.today) || '0'}</strong></div>
                </div>

                {/* Finishing Sub Column */}
                <div className="space-y-1 bg-white p-2 rounded border border-gray-100">
                  <span className="text-[10px] font-bold text-sky-700 uppercase">Finishing Active tab: {finishing.subType}</span>
                  {finishing.subType === 'AQL Audit' ? (
                    <div className="text-[10px] font-mono leading-relaxed text-slate-650">
                      <div>Audited: <strong>{finishing.aqlAudit.today || 0}</strong></div>
                      <div>Defected Submissions: <strong>{finishing.aqlAudit.cumulativeResubmission || 0}</strong></div>
                      <div>Recheck ratio %: <strong className="text-red-600">{calculatedAqlPct}%</strong></div>
                    </div>
                  ) : finishing.subType === 'Checking' ? (
                    <div className="text-[10px] font-mono leading-normal text-slate-650 text-xs">
                      <div>Checked today: <strong>{finishing.checking.today || 0}</strong></div>
                      <div>Cumulative: <strong>{finishing.checking.cumulative || 0}</strong></div>
                      <div>Manpower: <strong>{finishing.checking.totalUsedManpower || 0}</strong></div>
                    </div>
                  ) : (
                    <div className="text-[10px] font-mono leading-normal text-slate-650 text-xs">
                      <div>Trimmed today: <strong>{finishing.trimming.today || 0}</strong></div>
                      <div>Cumulative: <strong>{finishing.trimming.cumulative || 0}</strong></div>
                      <div>Manpower: <strong>{finishing.trimming.totalUsedManpower || 0}</strong></div>
                    </div>
                  )}
                </div>

                {/* Ironing & Packing Sub Column */}
                <div className="space-y-1 bg-white p-2 rounded border border-gray-100">
                  <span className="text-[10px] font-bold text-teal-800 uppercase">Ironing & Packing stage</span>
                  <div className="flex justify-between"><span>Today:</span> <strong className="font-mono">{ironing.today || 0}</strong></div>
                  <div className="flex justify-between"><span>Manpower:</span> <strong className="font-mono">{ironing.totalUsedManpower || 0}</strong></div>
                  <div className="flex justify-between"><span>Rate/Piece:</span> <strong className="font-mono text-emerald-700 font-bold">₹{calculatedCost || '0'}</strong></div>
                </div>

              </div>
            </div>

            {/* Box 6: Carton Master Packing */}
            <div className="p-4 rounded-xl border border-gray-100 bg-slate-50/30 space-y-2.5 md:col-span-2">
              <h3 className="font-bold text-gray-900 border-b pb-1">6. CTN Box Packing & Final Inspection Schedule</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div><span className="text-gray-400">Cartons Today:</span> <strong className="text-gray-800 font-mono font-medium">{ctn.today || 0}</strong></div>
                <div><span className="text-gray-400">Cumulative CTN:</span> <strong className="text-gray-800 font-mono font-medium">{ctn.cumulative || 0}</strong></div>
                <div><span className="text-gray-400">Balance Box:</span> <strong className="text-gray-800 font-mono font-medium">{ctn.balanceToPack || 0}</strong></div>
                <div><span className="text-gray-400">Possible FI Date:</span> <strong className="text-teal-700 font-bold font-mono">{ctn.possibleFiDate || 'N/A'}</strong></div>
              </div>
              {ctn.remark && (
                <div className="p-2bg-slate-50 border rounded text-[11px] text-gray-500 italic mt-1 font-semibold">
                  Remarks: "{ctn.remark}"
                </div>
              )}
            </div>

          </div>

          {/* Submission Feedback Info */}
          {errorText && (
            <div className="p-3 bg-red-50 text-red-800 rounded-lg text-xs leading-5 border border-red-150 flex items-start gap-2 animate-bounce">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
              <span>{errorText}</span>
            </div>
          )}

          {/* Nav buttons */}
          <div className="border-t border-gray-100 pt-5 flex items-center justify-between">
            <button
              onClick={onPrev}
              type="button"
              disabled={submitting}
              className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm tracking-tight hover:bg-gray-50 active:bg-gray-100 flex items-center space-x-1.5 transition-all disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back & Modify</span>
            </button>
            <button
              onClick={handleFinalSubmit}
              type="button"
              disabled={submitting}
              id="btn-final-dispatch"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm tracking-tight flex items-center space-x-2 shadow-lg shadow-emerald-500/15 active:scale-95 transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting Entry...</span>
                </>
              ) : (
                <>
                  <span>Submit & Save Report</span>
                  <ArrowUpRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
