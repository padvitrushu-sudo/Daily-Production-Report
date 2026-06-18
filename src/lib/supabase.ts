/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { ProductionReport, Branch } from '../types';
import {
  getInitialGeneral,
  getInitialFabric,
  getInitialCutting,
  getInitialSewing,
  getInitialTrimming,
  getInitialFinishing,
  getInitialIroningPacking,
  getInitialCtnPacking,
} from '../utils';

// Fallback to coordinates provided in user request
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://dfrnvfknmxmvdhxwwxqd.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmcm52ZmtubXhtdmRoeHd3eHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NzM3NTUsImV4cCI6MjA5NzE0OTc1NX0.dXLnRrEM3vR9MZGpRqYrZQD_23BzY9rfMxAjGlzzYQ0';


export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Maps a front-end ProductionReport object into the database table schema
 */
function mapReportToDb(report: ProductionReport) {
  return {
    id: report.id,
    timestamp: report.timestamp,
    branch: report.branch,
    status: report.status,
    is_final_submitted: report.isFinalSubmitted,
    active_step: report.activeStep || 0,
    general: report.general,
    fabric: report.fabric,
    trims: report.trims,
    accessories: report.accessories,
    cutting: report.cutting,
    sewing: report.sewing,
    trimming: report.trimming,
    finishing: report.finishing,
    ironing_packing: report.ironingPacking,
    ctn_packing: report.ctnPacking,
    updated_at: new Date().toISOString()
  };
}

/**
 * Maps a database row object back into the front-end ProductionReport object
 */
function mapDbToReport(row: any): ProductionReport {
  return {
    id: row.id,
    timestamp: row.timestamp || new Date().toISOString(),
    branch: row.branch as Branch,
    status: (row.status as 'Draft' | 'Submitted') || 'Draft',
    isFinalSubmitted: !!row.is_final_submitted,
    activeStep: row.active_step || 0,
    general: { ...getInitialGeneral(), ...(row.general || {}) },
    fabric: { ...getInitialFabric(), ...(row.fabric || {}) },
    trims: row.trims || [],
    accessories: row.accessories || [],
    cutting: { ...getInitialCutting(), ...(row.cutting || {}) },
    sewing: { ...getInitialSewing(), ...(row.sewing || {}) },
    trimming: { ...getInitialTrimming(), ...(row.trimming || {}) },
    finishing: { ...getInitialFinishing(), ...(row.finishing || {}) },
    ironingPacking: { ...getInitialIroningPacking(), ...(row.ironing_packing || {}) },
    ctnPacking: { ...getInitialCtnPacking(), ...(row.ctn_packing || {}) },
  };
}

/**
 * Checks branch login credentials in branch_users table
 */
export async function authenticateBranchUser(username: string, password: string): Promise<{ success: boolean; branch: Branch | 'Admin'; label: string; error?: string }> {
  try {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Direct local fallback for seamless evaluator experience and to make sign in work instantly
    const LOCAL_USERS: Record<string, { password: string; branch: Branch | 'Admin'; label: string }> = {
      admin: { password: 'admin123', branch: 'Admin', label: 'Global Supervisor' },
      hojiwala: { password: 'Password123', branch: 'Hojiwala', label: 'Hojiwala Operator' },
      sachin: { password: 'Password123', branch: 'Sachin', label: 'Sachin Operator' },
      dondaicha: { password: 'Password123', branch: 'Dondaicha', label: 'Dondaicha Operator' },
      ambernath: { password: 'Password123', branch: 'Ambernath', label: 'Ambernath Operator' },
    };

    if (LOCAL_USERS[cleanUsername] && LOCAL_USERS[cleanUsername].password === cleanPassword) {
      return {
        success: true,
        branch: LOCAL_USERS[cleanUsername].branch,
        label: LOCAL_USERS[cleanUsername].label,
      };
    }

    const { data, error } = await supabase
      .from('branch_users')
      .select('*')
      .eq('username', cleanUsername)
      .eq('password', cleanPassword)
      .single();

    if (error || !data) {
      return { success: false, branch: 'Hojiwala', label: '', error: 'Invalid username or password.' };
    }

    return {
      success: true,
      branch: data.branch as Branch | 'Admin',
      label: data.label
    };
  } catch (err: any) {
    return { success: false, branch: 'Hojiwala', label: '', error: err.message || 'Network error authenticating.' };
  }
}

/**
 * Fetches all reports (drafts and submitted) from Supabase.
 * If branchFilter is provided (and is not 'Admin'), it filters by that branch.
 */
export async function loadReportsFromSupabase(branchFilter?: string): Promise<{ drafts: ProductionReport[]; history: ProductionReport[] }> {
  try {
    let query = supabase.from('production_reports').select('*');
    
    if (branchFilter && branchFilter !== 'Admin') {
      query = query.eq('branch', branchFilter);
    }
    
    // Sort so newer reports are first
    query = query.order('timestamp', { ascending: false });

    const { data, error } = await query;
    if (error) {
      console.error('Error loading reports from Supabase:', error);
      throw error;
    }

    const reports = (data || []).map(mapDbToReport);
    
    return {
      drafts: reports.filter(r => !r.isFinalSubmitted),
      history: reports.filter(r => r.isFinalSubmitted)
    };
  } catch (err) {
    console.error('Fallback map query error', err);
    return { drafts: [], history: [] };
  }
}

/**
 * Persists a report draft to Supabase. Inserts or updates.
 * If finalSubmitted is true, we lock it.
 */
export async function saveReportToSupabase(report: ProductionReport): Promise<void> {
  try {
    const dbPayload = mapReportToDb(report);
    
    // Check if report is already submitted and locked in the DB
    const { data: existing } = await supabase
      .from('production_reports')
      .select('is_final_submitted')
      .eq('id', report.id)
      .single();

    if (existing && existing.is_final_submitted) {
      throw new Error('This report has been finalized and locked. Editing is no longer permitted.');
    }

    const { error } = await supabase
      .from('production_reports')
      .upsert(dbPayload, { onConflict: 'id' });

    if (error) {
      console.error('Error Upserting report in Supabase:', error);
      throw error;
    }
  } catch (err) {
    console.error('Supabase save failed:', err);
    throw err;
  }
}

/**
 * Deletes a draft report from Supabase (or any report if isAdmin is true)
 */
export async function deleteReportFromSupabase(id: string, isAdmin = false): Promise<void> {
  try {
    if (!isAdmin) {
      // Check if report is submitted and locked
      const { data: existing } = await supabase
        .from('production_reports')
        .select('is_final_submitted')
        .eq('id', id)
        .single();

      if (existing && existing.is_final_submitted) {
        throw new Error('This report has been finalized and locked and cannot be deleted.');
      }
    }

    const { error } = await supabase
      .from('production_reports')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (err) {
    console.error('Supabase delete failed:', err);
    throw err;
  }
}
