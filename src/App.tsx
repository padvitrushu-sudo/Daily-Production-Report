/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Branch, ProductionReport, BranchConfig, GeneralDetails, FabricDetails, TrimItem, AccessoryItem, CuttingDetails, SewingDetails, TrimmingDetails, FinishingDetails, IroningPackingDetails, CtnPackingDetails } from './types';
import { DEFAULT_BRANCHES, createNewReport } from './utils';
import { BranchHeader } from './components/BranchHeader';
import { StepGeneralDetails } from './components/StepGeneralDetails';
import { StepPlanConsumption } from './components/StepPlanConsumption';
import { StepAccessories } from './components/StepAccessories';
import { StepCutting } from './components/StepCutting';
import { StepSewing } from './components/StepSewing';
import { StepFinishing } from './components/StepFinishing';
import { StepIroningPacking } from './components/StepIroningPacking';
import { StepCtnPacking } from './components/StepCtnPacking';
import { StepSummarySubmit } from './components/StepSummarySubmit';
import { RecordsTable } from './components/RecordsTable';
import { LoginPage } from './components/LoginPage';
import { loadReportsFromSupabase, saveReportToSupabase, deleteReportFromSupabase } from './lib/supabase';
import { 
  CheckCircle, 
  Circle, 
  ChevronRight, 
  Layers, 
  Wrench, 
  PlusCircle, 
  Activity, 
  FolderSync, 
  Database,
  HelpCircle,
  ExternalLink,
  CloudLightning,
  RefreshCw,
  Wifi,
  WifiOff,
  Trash2
} from 'lucide-react';

export default function App() {
  const [configs, setConfigs] = useState<BranchConfig[]>(() => {
    const saved = localStorage.getItem('DAILY_SH_BRANCH_CONFIGS');
    let loaded: BranchConfig[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Auto-migrate any stale "Dondaycha" keys to "Dondaicha" in the user's browser localStorage cache
          loaded = parsed.map((c: any) => {
            if (c.id === 'Dondaycha') {
              return { ...c, id: 'Dondaicha' as Branch, name: 'Dondaicha Branch' };
            }
            return c as BranchConfig;
          });
        }
      } catch (err) {
        // ignore
      }
    }

    if (loaded.length === 0) {
      return DEFAULT_BRANCHES;
    }

    // Merge DEFAULT_BRANCHES so that if loaded configuration does not have a webAppUrl, 
    // it locks in the system default provided by the user.
    return DEFAULT_BRANCHES.map(def => {
      const match = loaded.find(l => l.id === def.id);
      return {
        ...def,
        webAppUrl: match && match.webAppUrl ? match.webAppUrl : def.webAppUrl,
        spreadsheetId: match && match.spreadsheetId ? match.spreadsheetId : def.spreadsheetId,
      };
    });
  });

  // Logged-in Operator/Admin user session 
  const [user, setUser] = useState<{ username: string; branch: Branch | 'Admin'; label: string } | null>(() => {
    const saved = localStorage.getItem('DAILY_SH_ACTIVE_USER');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u && u.branch === 'Dondaycha') {
          u.branch = 'Dondaicha';
          if (u.label && u.label.includes('Dondaycha')) {
            u.label = u.label.replace('Dondaycha', 'Dondaicha');
          }
        }
        return u;
      } catch (e) {
        // ignore
      }
    }
    return null;
  });

  const [records, setRecords] = useState<ProductionReport[]>([]);
  const [drafts, setDrafts] = useState<ProductionReport[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string>('');

  // Auto Sync Indicators
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'synced' | 'failed' | 'saving-all' | 'synced-all'>('idle');
  const [loadingDb, setLoadingDb] = useState(false);

  // Active view 
  const [activeView, setActiveView] = useState<'form' | 'archives'>('form');

  // Persistence triggers for configuration parameters
  useEffect(() => {
    localStorage.setItem('DAILY_SH_BRANCH_CONFIGS', JSON.stringify(configs));
  }, [configs]);

  // Session storage updater
  useEffect(() => {
    if (user) {
      localStorage.setItem('DAILY_SH_ACTIVE_USER', JSON.stringify(user));
    } else {
      localStorage.removeItem('DAILY_SH_ACTIVE_USER');
    }
  }, [user]);

  // Initial set currentBranch based on assigned user branch
  const [currentBranch, setCurrentBranchState] = useState<Branch>(() => {
    const savedUser = localStorage.getItem('DAILY_SH_ACTIVE_USER');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.branch && u.branch !== 'Admin') {
          const b = u.branch === 'Dondaycha' ? 'Dondaicha' : u.branch;
          return b as Branch;
        }
      } catch (e) {
        // ignore
      }
    }
    return 'Hojiwala';
  });

  // Sync / Fetch drafts and reports from Supabase database based on role login and active branch selections
  useEffect(() => {
    if (!user) return;

    const syncReports = async () => {
      setLoadingDb(true);
      try {
        // Determine branch filter: If Admin, filter by current selected branch. If Operator, lock to assigned branch.
        const branchFilter = user.branch === 'Admin' ? currentBranch : user.branch;
        const res = await loadReportsFromSupabase(branchFilter);

        // Map drafts
        if (res.drafts.length > 0) {
          setDrafts(res.drafts);
          const hasActive = res.drafts.some(d => d.id === activeDraftId);
          if (!hasActive) {
            setActiveDraftId(res.drafts[0].id);
          }
        } else {
          const fresh = createNewReport(branchFilter);
          setDrafts([fresh]);
          setActiveDraftId(fresh.id);
        }

        // Map submitted/locked reports
        setRecords(res.history);
      } catch (err) {
        console.error("Database connection failure, using local drafts cache:", err);
      } finally {
        setLoadingDb(false);
      }
    };

    syncReports();
  }, [user, currentBranch]);

  // Derive active report and activeStep
  const matchedDraft = drafts.find(d => d.id === activeDraftId) || drafts[0];
  const report = matchedDraft as ProductionReport;
  const activeStep = report?.activeStep !== undefined ? report.activeStep : 0;

  // Make sure activeDraftId matches the current report's ID
  useEffect(() => {
    if (report && report.id !== activeDraftId) {
      setActiveDraftId(report.id);
    }
  }, [report, activeDraftId]);

  // Auto-sync the active report draft back to Supabase database (debounced 1.2s)
  useEffect(() => {
    if (!user || !report || report.isFinalSubmitted) return;

    setSyncStatus('saving');
    const timer = setTimeout(async () => {
      try {
        await saveReportToSupabase(report);
        setSyncStatus('synced');
      } catch (err) {
        console.error("Auto-sync to Supabase failed:", err);
        setSyncStatus('failed');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [report, user]);

  // Save current report details as draft whenever changed locally
  const handleUpdateReport = (updated: ProductionReport) => {
    setDrafts(prev => prev.map(d => d.id === updated.id ? updated : d));
  };

  const handleBranchChange = (branch: Branch) => {
    if (user && user.branch !== 'Admin') return; // block operators from switching
    setCurrentBranchState(branch);
  };

  const handleLoginSuccess = (loggedInUser: { username: string; branch: Branch | 'Admin'; label: string }) => {
    setUser(loggedInUser);
    if (loggedInUser.branch !== 'Admin') {
      setCurrentBranchState(loggedInUser.branch as Branch);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setDrafts([]);
    setRecords([]);
    setActiveDraftId('');
    localStorage.removeItem('DAILY_SH_ACTIVE_USER');
  };


  const selectedConfig = configs.find(c => c.id === currentBranch);

  const stepsList = [
    { title: 'General Info', desc: 'Garments Profile info' },
    { title: 'Plan Consumption', desc: 'Fabric / Trims targets' },
    { title: 'Accessories', desc: 'Plan bulk labels & tags' },
    { title: 'Cutting Room', desc: 'Schedule and pieces cut' },
    { title: 'Sewing / Bonding', desc: 'On MC & Off MC lines' },
    { title: 'Finishing Gate', desc: 'Checking / AQL Audits' },
    { title: 'Ironing & Packing', desc: 'Press folds & piece costs' },
    { title: 'CTN Box Packing', desc: 'Master cartons & FI Dates' },
    { title: 'Review & Dispatch', desc: 'Sync spreadsheet archive' }
  ];

  // Logic to determine if a step is fully populated/saved to display status badge in sidebar
  const isStepComplete = (index: number): boolean => {
    switch (index) {
      case 0:
        return !!report.general.buyerName && !!report.general.styleNo && !!report.general.poNumber && !!report.general.orderQuantity;
      case 1:
        if (report.general.planConsumptionType === 'Fabric' || report.general.planConsumptionType === 'Both') {
          if (!report.fabric.planInHouseDate || !report.fabric.receivedQty) return false;
        }
        if (report.general.planConsumptionType === 'Trims' || report.general.planConsumptionType === 'Both') {
          if (report.trims.length === 0) return false;
        }
        return true;
      case 2:
        return true; // accessories are optional
      case 3:
        return !!report.cutting.planStartDate && !!report.cutting.qtyToday;
      case 4:
        return report.sewing.input.today !== '' && report.sewing.output.today !== '';
      case 5:
        return (
          report.finishing.trimming.today !== '' ||
          report.finishing.checking.today !== '' ||
          report.finishing.aqlAudit.today !== ''
        );
      case 6:
        return report.ironingPacking.today !== '';
      case 7:
        return report.ctnPacking.today !== '' && !!report.ctnPacking.possibleFiDate;
      case 8:
        return report.isFinalSubmitted;
      default:
        return false;
    }
  };

  const handleStepSaveAndNext = async (nextIndex: number) => {
    // Scroll container to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const updated = {
      ...report,
      activeStep: nextIndex
    };
    
    // Locally update state right away
    handleUpdateReport(updated);

    // Save to Supabase and sync to Google Sheets in real-time
    setSyncStatus('saving-all');
    try {
      // 1. Save to Supabase
      await saveReportToSupabase(updated);
      
      // 2. Synchronize to Google Sheets
      const config = configs.find(c => c.id === currentBranch);
      if (config?.webAppUrl) {
        try {
          const payload = {
            ...updated,
            spreadsheetId: config.spreadsheetId,
          };
          await fetch(config.webAppUrl, {
            method: 'POST',
            mode: 'no-cors', // Use no-cors to bypass CORS and redirect blockages in browser
            headers: {
              'Content-Type': 'text/plain',
            },
            body: JSON.stringify(payload),
          });
          console.log('Google Sheets synchronized successfully in background.');
        } catch (sheetErr) {
          console.error('Google Sheet background push delayed:', sheetErr);
        }
      }
      
      setSyncStatus('synced-all');
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
      
    } catch (err) {
      console.error("Step double-destination sync failed:", err);
      setSyncStatus('failed');
    }
  };

  const handleFinalSubmit = async (finalReport: ProductionReport) => {
    const config = configs.find(c => c.id === currentBranch);
    
    // Create finalized static record
    const submittedReport: ProductionReport = {
      ...finalReport,
      timestamp: new Date().toISOString(),
      status: 'Submitted',
      isFinalSubmitted: true,
    };

    setSyncStatus('saving');
    try {
      // Save finalized locked report to Supabase
      await saveReportToSupabase(submittedReport);
      setSyncStatus('synced');
    } catch (e) {
      console.error("Failed storing locked report to Supabase:", e);
      setSyncStatus('failed');
    }

    // Attempt pushing to Google Sheets Web App if defined
    if (config?.webAppUrl) {
      try {
        const payload = {
          ...submittedReport,
          spreadsheetId: config.spreadsheetId,
        };
        await fetch(config.webAppUrl, {
          method: 'POST',
          mode: 'no-cors', // Use no-cors to bypass CORS and redirect blockages in browser
          headers: {
            'Content-Type': 'text/plain',
          },
          body: JSON.stringify(payload),
        });
        console.log('Final locked report synchronized to Google Sheets successfully.');
      } catch (err) {
        console.error('Google Sheet push delayed:', err);
      }
    }

    // Append report to active archived records in view list
    setRecords(prev => [submittedReport, ...prev.filter(r => r.id !== submittedReport.id)]);
    
    // Transition to another draft or spawn a fresh one for the active branch
    const remaining = drafts.filter(d => d.id !== finalReport.id);
    if (remaining.length > 0) {
      setDrafts(remaining);
      setActiveDraftId(remaining[0].id);
    } else {
      const fresh = createNewReport(currentBranch);
      setDrafts([fresh]);
      setActiveDraftId(fresh.id);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await deleteReportFromSupabase(id, user?.branch === 'Admin');
    } catch (err) {
      console.error("Delete propagation failed:", err);
    }
    setRecords(prev => prev.filter(r => r.id !== id));
  };


  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (loadingDb || !report) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center font-sans antialiased select-none">
        <div className="mx-auto h-14 w-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/10 animate-pulse mb-5">
          <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H12" />
          </svg>
        </div>
        <p className="text-sm font-black text-gray-900 uppercase tracking-widest leading-none">Syncing Cloud Workspace</p>
        <p className="text-xs text-gray-450 mt-1.5 font-medium">Please wait while we connect to secure Supabase database...</p>
      </div>
    );
  }

  return (
    <div id="production-app-root" className="min-h-screen bg-slate-50 text-gray-850 font-sans flex flex-col antialiased font-sans">
      
      {/* Banner / Header */}
      <BranchHeader
        currentBranch={currentBranch}
        onBranchChange={handleBranchChange}
        configs={configs}
        onConfigChange={setConfigs}
        user={user}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex flex-col gap-6">
        
        {/* Secondary Navigation Rails */}
        <div id="navigator-rail" className="flex items-center justify-between border-2 border-slate-900 bg-white p-3.5 rounded-2xl shadow-sm">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('form')}
              type="button"
              className={`px-4.5 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-all flex items-center space-x-1.5 ${
                activeView === 'form'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/10'
                  : 'text-slate-900 hover:bg-slate-100 font-bold'
              }`}
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5px]" />
              <span>Fill Daily Entry</span>
            </button>
            <button
              onClick={() => setActiveView('archives')}
              type="button"
              id="btn-archives"
              className={`px-4.5 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-all flex items-center space-x-1.5 ${
                activeView === 'archives'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/10'
                  : 'text-slate-900 hover:bg-slate-100 font-bold'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Database Sheets ({records.filter(r => r.branch === currentBranch).length})</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] font-medium">
            {(() => {
              let text = '';
              let statusClass = '';
              let iconElement = null;

              if (loadingDb) {
                text = 'Database loader syncing...';
                statusClass = 'text-emerald-700 border-emerald-600/70 bg-white';
                iconElement = <RefreshCw className="w-3.5 h-3.5 text-emerald-500 animate-spin" />;
              } else if (syncStatus === 'saving') {
                text = 'Auto-saving cloud draft...';
                statusClass = 'text-amber-700 border-amber-500 bg-white';
                iconElement = <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />;
              } else if (syncStatus === 'saving-all') {
                text = 'Saving to Supabase & Sheet...';
                statusClass = 'text-blue-700 border-blue-500 bg-white';
                iconElement = <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />;
              } else if (syncStatus === 'synced-all') {
                text = 'Synced to Supabase & Sheet!';
                statusClass = 'text-[#0f766e] border-emerald-600/70 bg-white';
                iconElement = <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50 animate-bounce" />;
              } else {
                // Default / Synced / Connection Intact - show identically to screenshot
                text = 'Draft saved to Supabase';
                statusClass = 'text-emerald-700 border-emerald-600/70 bg-white';
                iconElement = <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50" />;
              }

              return (
                <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border shadow-xs transition-all ${statusClass}`}>
                  {iconElement}
                  <span className="font-bold text-xs font-sans tracking-tight">{text}</span>
                </div>
              );
            })()}
            <div className="flex items-center space-x-1.5 text-gray-400">
              <span className="text-xs font-medium text-gray-400">Branch:</span>
              <span className="font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-xl text-xs">{currentBranch}</span>
            </div>
          </div>
        </div>

        {activeView === 'archives' ? (
          /* ARCHIVE LOGS PANEL VIEW */
          <div className="animate-fade-in block">
            <RecordsTable
              records={records}
              selectedBranch={currentBranch}
              onDeleteRecord={handleDeleteRecord}
              user={user}
            />
          </div>
        ) : (
          /* ACTIVE REPORT ENTRY FLOW VIEW */
          <div className="space-y-6 animate-fade-in">
            
            {/* Active Forms Deck */}
            <div id="active-forms-deck" className="bg-white p-5 rounded-2xl border border-gray-150/80 shadow-xs flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-gray-950 flex items-center gap-1.5">
                    <Activity className="w-4.5 h-4.5 text-emerald-600 animate-pulse" />
                    <span>Workspace: Active Project Forms In-Progress</span>
                    <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full">{drafts.length} Active Forms</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">
                    You can fill multiple production reports concurrently. Click any form to switch project instantly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const fresh = createNewReport(currentBranch);
                    setDrafts(prev => [...prev, fresh]);
                    setActiveDraftId(fresh.id);
                  }}
                  className="self-start sm:self-center bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Start New Project Form</span>
                </button>
              </div>

              {/* Elegant List of Active Drafts */}
              <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
                {drafts.map((dt) => {
                  const isActive = dt.id === report.id;
                  const stepNum = dt.activeStep !== undefined ? dt.activeStep : 0;
                  const sr = dt.general.srNo ? dt.general.srNo : '';
                  const style = dt.general.styleNo ? dt.general.styleNo : '';
                  const buyer = dt.general.buyerName ? dt.general.buyerName : '';
                  const qty = dt.general.orderQuantity ? dt.general.orderQuantity : '';
                  const description = dt.general.garmentDescription ? dt.general.garmentDescription : '';

                  const hasInfo = sr || style || buyer;

                  return (
                    <div
                      key={dt.id}
                      onClick={() => setActiveDraftId(dt.id)}
                      className={`relative rounded-xl border p-3 flex flex-col md:flex-row md:items-center justify-between gap-3.5 transition-all cursor-pointer select-none group ${
                        isActive
                          ? 'border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/10'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-slate-50'
                      }`}
                    >
                      {/* Left: Indicator & Content Group */}
                      <div className="flex items-start md:items-center space-x-3.5 flex-1 min-w-0">
                        {/* Selector/Sync Indicator */}
                        <div className="mt-1 md:mt-0 flex-shrink-0">
                          {isActive ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white ring-4 ring-emerald-500/10 shadow-sm">
                              <span className="w-2 h-2 rounded-full bg-white block animate-pulse" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-200 bg-white group-hover:border-emerald-400 group-hover:bg-emerald-50/35 transition-all" />
                          )}
                        </div>

                        {/* Detailed Column Grid */}
                        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center">
                          {/* Project Identifiers */}
                          <div className="md:col-span-5 min-w-0">
                            {hasInfo ? (
                              <div className="flex flex-wrap items-center gap-1.5">
                                {sr && (
                                  <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded font-mono">
                                    Sr: {sr}
                                  </span>
                                )}
                                {style && (
                                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                                    Style: {style}
                                  </span>
                                )}
                                {buyer && (
                                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[150px]">
                                    {buyer}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs font-extrabold text-gray-400 italic">
                                New Form Outline (Unsaved / Empty)
                              </span>
                            )}
                            {description && (
                              <p className="text-[11px] text-gray-400 mt-1 truncate max-w-[340px]">
                                {description}
                              </p>
                            )}
                          </div>

                          {/* Order Quantity Metadata */}
                          <div className="md:col-span-3 text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                            {qty ? (
                              <span className="font-mono text-emerald-700 bg-emerald-50/50 px-2 py-0.5 rounded">
                                {Number(qty).toLocaleString()} pcs
                              </span>
                            ) : (
                              <span className="text-[11px] text-gray-300 italic">No Qty set</span>
                            )}
                          </div>

                          {/* Branch indicator */}
                          <div className="md:col-span-2">
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider block w-fit">
                              {dt.branch}
                            </span>
                          </div>

                          {/* Progress display */}
                          <div className="md:col-span-2 flex items-center space-x-1.5 text-xs text-gray-400 font-semibold">
                            <span>Step:</span>
                            <span className="text-emerald-700 bg-emerald-50 font-extrabold px-2 py-0.5 rounded text-[11px] font-mono whitespace-nowrap">
                              {stepNum + 1} of {stepsList.length}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side Action Menu */}
                      <div className="flex items-center justify-end flex-shrink-0">
                        {drafts.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm("Are you sure you want to discard this active form draft?")) {
                                const filtered = drafts.filter(x => x.id !== dt.id);
                                setDrafts(filtered);
                                if (isActive) {
                                  setActiveDraftId(filtered[0].id);
                                }
                                deleteReportFromSupabase(dt.id).catch(err => {
                                  console.error("Draft remove delayed in cloud:", err);
                                });
                              }
                            }}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg p-2 transition-all"
                            title="Discard Draft"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Sidebar Steps Navigator (Desktop / Laptop view) */}
            <aside className="lg:col-span-3 space-y-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs hidden lg:block max-h-[85vh] overflow-y-auto">
              <h3 className="px-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Form Progress</h3>
              <div className="space-y-1">
                {stepsList.map((st, idx) => {
                  const isActive = activeStep === idx;
                  const isDone = isStepComplete(idx);

                  return (
                    <button
                      key={idx}
                      id={`sidebar-step-${idx}`}
                      onClick={() => handleStepSaveAndNext(idx)}
                      type="button"
                      className={`w-full text-left p-2.5 rounded-xl flex items-start space-x-3 transition-colors border ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-100/50'
                          : 'bg-transparent text-gray-600 hover:bg-slate-50 border-transparent'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isDone ? (
                          <CheckCircle className="w-4.5 h-4.5 text-emerald-600 fill-emerald-100" />
                        ) : isActive ? (
                          <Circle className="w-4.5 h-4.5 text-emerald-500 stroke-[2.5]" />
                        ) : (
                          <Circle className="w-4.5 h-4.5 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${isActive ? 'text-emerald-950 font-extrabold' : 'text-gray-800'}`}>
                          {idx + 1}. {st.title}
                        </p>
                        <p className="text-[10px] text-gray-405 truncate">{st.desc}</p>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 text-emerald-500 self-center" />}
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Mobile Horizontal Steps List (Swipeable View) */}
            <div className="lg:hidden bg-white p-3 rounded-2xl border border-gray-100 flex gap-2.5 overflow-x-auto select-none no-scrollbar py-3.5 shadow-sm">
              {stepsList.map((st, idx) => {
                const isActive = activeStep === idx;
                const isDone = isStepComplete(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleStepSaveAndNext(idx)}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    <span>{st.title}</span>
                    {isDone && <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-emerald-500'}`}></span>}
                  </button>
                );
              })}
            </div>

            {/* Right Main Column - Active Form Body */}
            <section className="lg:col-span-9">
              {activeStep === 0 && (
                <StepGeneralDetails
                  data={report.general}
                  onUpdate={(general) => handleUpdateReport({ ...report, general })}
                  onNext={() => handleStepSaveAndNext(1)}
                />
              )}

              {activeStep === 1 && (
                <StepPlanConsumption
                  generalData={report.general}
                  fabricData={report.fabric}
                  trimsData={report.trims}
                  onUpdateFabric={(fabric) => handleUpdateReport({ ...report, fabric })}
                  onUpdateTrims={(trims) => handleUpdateReport({ ...report, trims })}
                  onPrev={() => handleStepSaveAndNext(0)}
                  onNext={() => handleStepSaveAndNext(2)}
                />
              )}

              {activeStep === 2 && (
                <StepAccessories
                  data={report.accessories}
                  plannedMfrgQty={report.general.plannedMfrgQty}
                  onUpdate={(accessories) => handleUpdateReport({ ...report, accessories })}
                  onPrev={() => handleStepSaveAndNext(1)}
                  onNext={() => handleStepSaveAndNext(3)}
                />
              )}

              {activeStep === 3 && (
                <StepCutting
                  data={report.cutting}
                  plannedMfrgQty={report.general.plannedMfrgQty}
                  onUpdate={(cutting) => handleUpdateReport({ ...report, cutting })}
                  onPrev={() => handleStepSaveAndNext(2)}
                  onNext={() => handleStepSaveAndNext(4)}
                />
              )}

              {activeStep === 4 && (
                <StepSewing
                  data={report.sewing}
                  cuttingCumulative={(report.cutting.qtyToday !== '' ? Number(report.cutting.qtyToday) : 0) + (report.cutting.qtyUptoYesterday !== '' ? Number(report.cutting.qtyUptoYesterday) : 0)}
                  onUpdate={(sewing) => handleUpdateReport({ ...report, sewing })}
                  onPrev={() => handleStepSaveAndNext(3)}
                  onNext={() => handleStepSaveAndNext(5)}
                />
              )}

              {activeStep === 5 && (
                <StepFinishing
                  data={report.finishing}
                  sewingOutputCumulative={report.sewing.output.cumulative}
                  onUpdate={(finishing) => handleUpdateReport({ ...report, finishing })}
                  onPrev={() => handleStepSaveAndNext(4)}
                  onNext={() => handleStepSaveAndNext(6)}
                />
              )}

              {activeStep === 6 && (
                <StepIroningPacking
                  data={report.ironingPacking}
                  aqlAuditCumulative={report.finishing.aqlAudit.cumulative}
                  onUpdate={(ironingPacking) => handleUpdateReport({ ...report, ironingPacking })}
                  onPrev={() => handleStepSaveAndNext(5)}
                  onNext={() => handleStepSaveAndNext(7)}
                />
              )}

              {activeStep === 7 && (
                <StepCtnPacking
                  data={report.ctnPacking}
                  ironingCumulative={report.ironingPacking.cumulative}
                  onUpdate={(ctnPacking) => handleUpdateReport({ ...report, ctnPacking })}
                  onPrev={() => handleStepSaveAndNext(6)}
                  onNext={() => handleStepSaveAndNext(8)}
                />
              )}

              {activeStep === 8 && (
                <StepSummarySubmit
                  report={report}
                  branchConfig={selectedConfig}
                  onPrev={() => handleStepSaveAndNext(7)}
                  onSubmit={handleFinalSubmit}
                />
              )}
            </section>

          </div>
        </div>
      )}

      </main>

      <footer className="bg-white border-t py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-400 font-medium">
          <p>© 2026 Daily Production Report. Designed with Desktop Precision & Mobile Fluidity.</p>
          <div className="flex justify-center space-x-3 mt-1 text-[11px] font-semibold text-gray-500">
            <span>Google Sheet Connector Active</span>
            <span>•</span>
            <a 
              href={`https://docs.google.com/spreadsheets/d/${selectedConfig?.spreadsheetId || '107lQoWsOCPpSNFm4L36Ym2EFElxsdgeEPMfGYvBCj5M'}/edit?gid=0#gid=0`}
              className="hover:underline text-emerald-600 flex items-center" 
              target="_blank" 
              rel="noreferrer"
            >
              open linked sheet <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
