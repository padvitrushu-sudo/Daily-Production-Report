/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Branch = 'Dondaicha' | 'Hojiwala' | 'Sachin' | 'Ambernath';

export interface GeneralDetails {
  srNo: string;
  buyerName: string;
  styleNo: string;
  poNumber: string;
  poDate: string;
  garmentDescription: string;
  fabricDescription: string;
  gsm: string;
  color: string;
  orderQuantity: number | '';
  plannedMfrgQty: number | ''; // Calculated: orderQuantity * 1.03 if orderQuantity exists
  exFactoryDate: string;
  planConsumptionType: 'Fabric' | 'Trims' | 'Both' | '';
  fabricConsumptionValue: number | '';
  trimsConsumptionValue: number | '';
}

export interface FabricDetails {
  planInHouseDate: string;
  receivedInHouseDate: string;
  receivedQty: number | '';
  // Calculations:
  // Required Qty = GeneralDetails.plannedMfrgQty * GeneralDetails.fabricConsumptionValue
  // Balance Qty Received = Required Qty - Received Qty
}

export interface TrimItem {
  id: string; // unique ID
  item: string;
  requiredQty: number | ''; // Calculated: plannedMfrgQty * trimValue input
  receivedQty: number | '';
  balanceQtyToReceive: number | ''; // Calculated: requiredQty - receivedQty
}

export interface AccessoryItem {
  id: string;
  item: string;
  requiredQty: number | '';
  receivedQty: number | '';
  balanceToReceive: number | ' ' | ''; // requiredQty - receivedQty
  remarks: string;
}

export interface CuttingDetails {
  planStartDate: string;
  actualStartDate: string;
  planCutQtyPct: number | '';
  actualConsumption: number | '';
  qtyToday: number | '';
  qtyUptoYesterday: number | '';
  history?: { id: string; date: string; qty: number; createdAt?: number }[];
  // Calculations:
  // grandTotalCumulative = qtyToday + qtyUptoYesterday
  // balanceToCut = planCutQtyPct - grandTotalCumulative
}

export interface SewingDetails {
  input: {
    today: number | '';
    cumulative: number | '';
    balanceToLoad: number | '';
    remark: string;
  };
  output: {
    today: number | '';
    cumulative: number | '';
    balanceToSew: number | '';
    remark: string;
  };
}

export interface TrimmingDetails {
  today: number | '';
  cumulative: number | '';
  balance: number | '';
  totalUsedManpower: number | '';
  // Calculations:
  // costPerPiece = totalUsedManpower / (today || 1) or cumulative or something
}

export interface FinishingDetails {
  subType: 'Trimming' | 'Checking' | 'AQL Audit';
  trimming: {
    today: number | '';
    cumulative: number | '';
    balance: number | '';
    totalUsedManpower: number | '';
    costPerPiece: number | '';
  };
  checking: {
    today: number | '';
    cumulative: number | '';
    balance: number | '';
    totalUsedManpower: number | '';
    costPerPiece: number | '';
  };
  aqlAudit: {
    today: number | '';
    cumulative: number | '';
    balance: number | '';
    todayResubmission: number | '';
    cumulativeResubmission: number | '';
    pctResubmission: number | ''; // (cumulativeResubmission / cumulative) * 100
  };
  trimmingHistory?: { id: string; qty: number; createdAt: number }[];
  checkingHistory?: { id: string; qty: number; createdAt: number }[];
  aqlHistory?: { id: string; qty: number; createdAt: number }[];
}

export interface IroningPackingDetails {
  today: number | '';
  cumulative: number | '';
  balanceToPack: number | '';
  totalUsedManpower: number | '';
  costPerPiece: number | '';
}

export interface CtnPackingDetails {
  today: number | '';
  cumulative: number | '';
  balanceToPack: number | '';
  possibleFiDate: string;
  remark: string;
}

export interface ProductionReport {
  id: string; // unique identifier
  timestamp: string; // Timestamp column A
  branch: Branch;
  general: GeneralDetails;
  fabric: FabricDetails;
  trims: TrimItem[];
  accessories: AccessoryItem[];
  cutting: CuttingDetails;
  sewing: SewingDetails;
  trimming: TrimmingDetails;
  finishing: FinishingDetails;
  ironingPacking: IroningPackingDetails;
  ctnPacking: CtnPackingDetails;
  isFinalSubmitted: boolean;
  status: 'Draft' | 'Submitted';
  activeStep?: number;
}

export interface BranchConfig {
  id: Branch;
  name: string;
  spreadsheetId: string;
  webAppUrl: string; // Google Apps Script Web App Endpoint
}
