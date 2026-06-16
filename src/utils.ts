/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProductionReport, Branch, GeneralDetails, FabricDetails, CuttingDetails, SewingDetails, TrimmingDetails, FinishingDetails, IroningPackingDetails, CtnPackingDetails } from './types';

export const DEFAULT_BRANCHES: { id: Branch; name: string; spreadsheetId: string; webAppUrl: string }[] = [
  {
    id: 'Dondaycha',
    name: 'Dondaycha Branch',
    spreadsheetId: '1IIOBRwrV-7YBTI7pY8O06PevDYnRX6H0_OiLEurHsqU',
    webAppUrl: '',
  },
  {
    id: 'Hojiwala',
    name: 'Hojiwala Branch',
    spreadsheetId: '107lQoWsOCPpSNFm4L36Ym2EFElxsdgeEPMfGYvBCj5M',
    webAppUrl: '',
  },
  {
    id: 'Sachin',
    name: 'Sachin Branch',
    spreadsheetId: '12IBk2ZI09uSg5HTCDTNphp3RONJMNAFwFCy1nDZqmNc',
    webAppUrl: '',
  },
  {
    id: 'Ambernath',
    name: 'Ambernath Branch',
    spreadsheetId: '1cj-Coa7WdvmnAMyuEh4UPM3ckpOMQ6h-VDHipF7cfnE',
    webAppUrl: '',
  },
];

export function getInitialGeneral(): GeneralDetails {
  return {
    srNo: '',
    buyerName: '',
    styleNo: '',
    poNumber: '',
    poDate: '',
    garmentDescription: '',
    fabricDescription: '',
    gsm: '',
    color: '',
    orderQuantity: '',
    plannedMfrgQty: '',
    exFactoryDate: '',
    planConsumptionType: '',
    fabricConsumptionValue: '',
    trimsConsumptionValue: '',
  };
}

export function getInitialFabric(): FabricDetails {
  return {
    planInHouseDate: '',
    receivedInHouseDate: '',
    receivedQty: '',
  };
}

export function getInitialCutting(): CuttingDetails {
  return {
    planStartDate: '',
    actualStartDate: '',
    planCutQtyPct: '',
    actualConsumption: '',
    qtyToday: '',
    qtyUptoYesterday: '',
  };
}

export function getInitialSewing(): SewingDetails {
  return {
    input: { today: '', cumulative: '', balanceToLoad: '', remark: '' },
    output: { today: '', cumulative: '', balanceToSew: '', remark: '' },
  };
}

export function getInitialTrimming(): TrimmingDetails {
  return {
    today: '',
    cumulative: '',
    balance: '',
    totalUsedManpower: '',
  };
}

export function getInitialFinishing(): FinishingDetails {
  return {
    subType: 'Trimming',
    trimming: { today: '', cumulative: '', balance: '', totalUsedManpower: '', costPerPiece: '' },
    checking: { today: '', cumulative: '', balance: '', totalUsedManpower: '', costPerPiece: '' },
    aqlAudit: { today: '', cumulative: '', balance: '', todayResubmission: '', cumulativeResubmission: '', pctResubmission: '' },
  };
}

export function getInitialIroningPacking(): IroningPackingDetails {
  return {
    today: '',
    cumulative: '',
    balanceToPack: '',
    totalUsedManpower: '',
    costPerPiece: '',
  };
}

export function getInitialCtnPacking(): CtnPackingDetails {
  return {
    today: '',
    cumulative: '',
    balanceToPack: '',
    possibleFiDate: '',
    remark: '',
  };
}

export function createNewReport(branch: Branch): ProductionReport {
  return {
    id: `rep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    branch,
    general: getInitialGeneral(),
    fabric: getInitialFabric(),
    trims: [],
    accessories: [],
    cutting: getInitialCutting(),
    sewing: getInitialSewing(),
    trimming: getInitialTrimming(),
    finishing: getInitialFinishing(),
    ironingPacking: getInitialIroningPacking(),
    ctnPacking: getInitialCtnPacking(),
    isFinalSubmitted: false,
    status: 'Draft',
    activeStep: 0,
  };
}

// Calculations based on equations specified by the user

export function calculatePlannedMfrgQty(orderQty: number | ''): number | '' {
  if (orderQty === '' || isNaN(orderQty)) return '';
  // Formula given under: =IF(J6=" "," ",J6/100*3+J6) => J6/100 * 3 + J6 => J6 * 1.03
  return Math.round(orderQty / 100 * 3 + orderQty);
}

export function calculateFabricRequirements(plannedMfrgQty: number | '', fabricConsumptionValue: number | ''): number | '' {
  if (plannedMfrgQty === '' || fabricConsumptionValue === '' || isNaN(plannedMfrgQty) || isNaN(fabricConsumptionValue)) {
    return '';
  }
  return parseFloat((plannedMfrgQty * fabricConsumptionValue).toFixed(2));
}

export function calculateFabricBalance(requiredQty: number | '', receivedQty: number | ''): number | '' {
  if (requiredQty === '' || receivedQty === '' || isNaN(requiredQty) || isNaN(receivedQty)) return '';
  return parseFloat((requiredQty - receivedQty).toFixed(2));
}

export function calculateTrimsRequirement(plannedMfrgQty: number | '', trimsConsumptionValue: number | ''): number | '' {
  if (plannedMfrgQty === '' || trimsConsumptionValue === '' || isNaN(plannedMfrgQty) || isNaN(trimsConsumptionValue)) {
    return '';
  }
  return parseFloat((plannedMfrgQty * trimsConsumptionValue).toFixed(2));
}

export function calculateTrimBalance(requiredQty: number | '', receivedQty: number | ''): number | '' {
  if (requiredQty === '' || receivedQty === '' || isNaN(requiredQty) || isNaN(receivedQty)) return '';
  return parseFloat((requiredQty - receivedQty).toFixed(2));
}

export function calculateAccessoryBalance(requiredQty: number | '', receivedQty: number | ''): number | '' {
  if (requiredQty === '' || receivedQty === '' || isNaN(requiredQty) || isNaN(receivedQty)) return '';
  return parseFloat((requiredQty - receivedQty).toFixed(2));
}

export function calculateCuttingCumulative(qtyToday: number | '', qtyUptoYesterday: number | ''): number | '' {
  if (qtyToday === '' && qtyUptoYesterday === '') return '';
  const todayVal = qtyToday === '' ? 0 : qtyToday;
  const yesterVal = qtyUptoYesterday === '' ? 0 : qtyUptoYesterday;
  return todayVal + yesterVal;
}

export function calculateCuttingBalance(planCutQtyPct: number | '', cumulativeQty: number | ''): number | '' {
  if (planCutQtyPct === '' || cumulativeQty === '' || isNaN(planCutQtyPct) || isNaN(cumulativeQty)) return '';
  return planCutQtyPct - cumulativeQty;
}

export function calculateAqlPct(resubmission: number | '', cumulative: number | ''): number | '' {
  if (!resubmission || !cumulative || isNaN(resubmission) || isNaN(cumulative)) return 0;
  return parseFloat(((resubmission / cumulative) * 100).toFixed(2));
}

// Cost Per Piece formulas: Total Used Manpower Cost (or rate representation) / (today or cumulative)
export function calculateCostPerPiece(manpower: number | '', qty: number | ''): number | '' {
  if (!manpower || !qty || isNaN(manpower) || isNaN(qty)) return '';
  return parseFloat((manpower / qty).toFixed(2));
}

// Google Apps Script source code template for easy deployment in Google Sheets
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * Google Apps Script to handle Daily Production Report submission
 * 
 * Instructions:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1IIOBRwrV-7YBTI7pY8O06PevDYnRX6H0_OiLEurHsqU/edit
 * 2. Go to 'Extensions' > 'Apps Script'.
 * 3. Delete any code in Code.gs and paste this script.
 * 4. Save (click the floppy disk icon).
 * 5. Click 'Deploy' > 'New deployment'.
 * 6. Select type: 'Web app'.
 * 7. Set 'Execute as' to: 'Me (your email)'.
 * 8. Set 'Who has access' to: 'Anyone'.
 * 9. Click 'Deploy'. Authorize permissions when prompted.
 * 10. Copy the Web App URL and paste it in the Settings Tab in this Applet!
 */

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    
    // Select the active sheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = data.branch || "Daily Data";
    var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
    
    // Check if headers exist, if not, create them
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Timestamp", "Branch", "Sr.No", "Buyer Name", "Style No", "PO Number", "PO Date", 
        "Garment Description", "Fabric Description", "GSM", "Color", 
        "Order Quantity", "Planned Mfg Qty", "Ex Factory Date", "Plan Consumption Type",
        "Fabric Recv Date", "Fabric Required Qty", "Fabric Received Qty", "Fabric Balance Qty",
        "Cutting Plan Start", "Cutting Actual Start", "Cutting Plan Qty", "Cutting Today", "Cutting Cumulative", "Cutting Balance",
        "Sewing Input Today", "Sewing Input Cumulative", "Sewing Output Today", "Sewing Output Cumulative",
        "Trimming Today", "Trimming Cumulative", "Trimming Manpower", "Trimming Cost Per Piece",
        "Finishing Type", "Finishing Today", "Finishing Cumulative", "Finishing Manpower",
        "AQL Audit Today", "AQL Audit Cumulative", "AQL Resubmissions", "AQL Resubmission %",
        "Ironing Today", "Ironing Cumulative", "Ironing Manpower", "Ironing Cost Per Piece",
        "CTN Packing Today", "CTN Packing Cumulative", "CTN Packing Balance", "Possible FI Date", "Remarks"
      ];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#F3F4F6");
    }
    
    // Map JSON parameters to sheet row array
    var timestamp = new Date();
    var general = data.general || {};
    var fabric = data.fabric || {};
    var cutting = data.cutting || {};
    var sewing = data.sewing || {};
    var trimming = data.trimming || {};
    var finishing = data.finishing || {};
    var ironing = data.ironingPacking || {};
    var ctn = data.ctnPacking || {};
    
    // Calculations or overrides
    var plannedMfg = general.plannedMfrgQty || "";
    var fabricReq = (general.plannedMfrgQty && general.fabricConsumptionValue) ? (general.plannedMfrgQty * general.fabricConsumptionValue) : "";
    var fabricRecv = fabric.receivedQty || 0;
    var fabricBal = fabricReq !== "" ? (fabricReq - fabricRecv) : "";
    
    var cutCum = (cutting.qtyToday || 0) + (cutting.qtyUptoYesterday || 0);
    var cutBal = (cutting.planCutQtyPct || 0) - cutCum;
    
    var finActive = finishing.subType || "Trimming";
    var finToday = "", finCum = "", finMan = "";
    if (finActive === "Trimming" && finishing.trimming) {
      finToday = finishing.trimming.today;
      finCum = finishing.trimming.cumulative;
      finMan = finishing.trimming.totalUsedManpower;
    } else if (finActive === "Checking" && finishing.checking) {
      finToday = finishing.checking.today;
      finCum = finishing.checking.cumulative;
      finMan = finishing.checking.totalUsedManpower;
    }
    
    var aqlToday = "", aqlCum = "", aqlResub = "", aqlPct = "";
    if (finishing.aqlAudit) {
      aqlToday = finishing.aqlAudit.today || "";
      aqlCum = finishing.aqlAudit.cumulative || "";
      aqlResub = finishing.aqlAudit.cumulativeResubmission || "";
      aqlPct = aqlCum ? ((aqlResub / aqlCum) * 100) : 0;
    }

    var rowValues = [
      timestamp,
      data.branch || "",
      general.srNo || "",
      general.buyerName || "",
      general.styleNo || "",
      general.poNumber || "",
      general.poDate || "",
      general.garmentDescription || "",
      general.fabricDescription || "",
      general.gsm || "",
      general.color || "",
      general.orderQuantity || "",
      plannedMfg,
      general.exFactoryDate || "",
      general.planConsumptionType || "",
      fabric.receivedInHouseDate || "",
      fabricReq,
      fabricRecv,
      fabricBal,
      cutting.planStartDate || "",
      cutting.actualStartDate || "",
      cutting.planCutQtyPct || "",
      cutting.qtyToday || "",
      cutCum,
      cutBal,
      sewing.input ? sewing.input.today : "",
      sewing.input ? sewing.input.cumulative : "",
      sewing.output ? sewing.output.today : "",
      sewing.output ? sewing.output.cumulative : "",
      trimming.today || "",
      trimming.cumulative || "",
      trimming.totalUsedManpower || "",
      (trimming.totalUsedManpower && trimming.today) ? (trimming.totalUsedManpower / trimming.today) : "",
      finActive,
      finToday,
      finCum,
      finMan,
      aqlToday,
      aqlCum,
      aqlResub,
      aqlPct ? aqlPct.toFixed(2) + "%" : "",
      ironing.today || "",
      ironing.cumulative || "",
      ironing.totalUsedManpower || "",
      ironing.costPerPiece || "",
      ctn.today || "",
      ctn.cumulative || "",
      ctn.balanceToPack || "",
      ctn.possibleFiDate || "",
      ctn.remark || ""
    ];
    
    sheet.appendRow(rowValues);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data entered successfully into sheet " + sheetName,
      row: sheet.getLastRow()
    })).setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
    });
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
    });
  }
}

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
}
`;
