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
  if (plannedMfrgQty === '' || isNaN(Number(plannedMfrgQty))) {
    return '';
  }
  const factor = trimsConsumptionValue === '' || isNaN(Number(trimsConsumptionValue)) ? 5 : Number(trimsConsumptionValue);
  return parseFloat((Number(plannedMfrgQty) * factor).toFixed(2));
}

export function calculateTrimBalance(requiredQty: number | '', receivedQty: number | ''): number | '' {
  if (requiredQty === '' || receivedQty === '' || isNaN(requiredQty) || isNaN(receivedQty)) return '';
  return parseFloat((requiredQty - receivedQty).toFixed(2));
}

export function calculateAccessoryBalance(requiredQty: number | '', receivedQty: number | ''): number | ' ' {
  if (requiredQty === '' || isNaN(Number(requiredQty))) return ' ';
  const recv = receivedQty === '' || isNaN(Number(receivedQty)) ? 0 : Number(receivedQty);
  return parseFloat((Number(requiredQty) - recv).toFixed(2));
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
 * 1. Open your Google Sheet
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
    
    // Check if headers exist, if not, create them (73 columns matching A-BU exactly)
    if (sheet.getLastRow() === 0) {
      var headers = [
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
    
    // Serializing trims
    var trimsList = data.trims || [];
    var trimNames = trimsList.map(function(t) { return t.item || ""; }).join("\n");
    var trimReqs = trimsList.map(function(t) { return t.requiredQty || ""; }).join("\n");
    var trimRecvs = trimsList.map(function(t) { return t.receivedQty || ""; }).join("\n");
    var trimBals = trimsList.map(function(t) { return t.balanceQtyToReceive !== undefined ? t.balanceQtyToReceive : ""; }).join("\n");
    
    // Serializing accessories
    var accList = data.accessories || [];
    var accNames = accList.map(function(a) { return a.item || ""; }).join("\n");
    var accReqs = accList.map(function(a) { return a.requiredQty || ""; }).join("\n");
    var accRecvs = accList.map(function(a) { return a.receivedQty || ""; }).join("\n");
    var accBals = accList.map(function(a) { return a.balanceToReceive !== undefined ? a.balanceToReceive : ""; }).join("\n");
    var accRemarks = accList.map(function(a) { return a.remarks || ""; }).join("\n");

    var cutCum = (cutting.qtyToday || 0) + (cutting.qtyUptoYesterday || 0);
    var cutBal = (cutting.planCutQtyPct || 0) - cutCum;
    
    // AQL Details
    var aqlToday = "";
    var aqlCum = "";
    var aqlBal = "";
    var aqlTodayResub = "";
    var aqlCumResub = "";
    var aqlPct = 0;
    if (finishing.aqlAudit) {
      aqlToday = finishing.aqlAudit.today || "";
      aqlCum = finishing.aqlAudit.cumulative || "";
      aqlBal = finishing.aqlAudit.balance || "";
      aqlTodayResub = finishing.aqlAudit.todayResubmission || "";
      aqlCumResub = finishing.aqlAudit.cumulativeResubmission || "";
      aqlPct = aqlCum ? ((aqlCumResub / aqlCum) * 100) : 0;
    }

    var rowValues = [
      timestamp,
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
      general.fabricConsumptionValue || "",
      general.trimsConsumptionValue || "",
      fabricReq,
      fabric.planInHouseDate || "",
      fabric.receivedInHouseDate || "",
      fabricRecv,
      fabricBal,
      
      // Trims columns (Col U-X: 21-24)
      trimNames,
      trimReqs,
      trimRecvs,
      trimBals,
      
      // Accessories columns (Col Y-AC: 25-29)
      accNames,
      accReqs,
      accRecvs,
      accBals,
      accRemarks,
      
      // Cutting columns (Col AD-AK: 30-37)
      cutting.planStartDate || "",
      cutting.actualStartDate || "",
      cutting.planCutQtyPct || "",
      cutting.actualConsumption || "",
      cutting.qtyToday || "",
      cutting.qtyUptoYesterday || "",
      cutCum,
      cutBal,
      
      // Sewing Input (Col AL-AO: 38-41)
      sewing.input ? sewing.input.today : "",
      sewing.input ? sewing.input.cumulative : "",
      sewing.input ? sewing.input.balanceToLoad : "",
      sewing.input ? sewing.input.remark : "",
      
      // Sewing Output (Col AP-AS: 42-45)
      sewing.output ? sewing.output.today : "",
      sewing.output ? sewing.output.cumulative : "",
      sewing.output ? sewing.output.balanceToSew : "",
      sewing.output ? sewing.output.remark : "",
      
      // Trimming (Col AT-AX: 46-50)
      trimming.today || "",
      trimming.cumulative || "",
      trimming.balance || "",
      trimming.totalUsedManpower || "",
      (trimming.totalUsedManpower && trimming.today) ? (trimming.totalUsedManpower / trimming.today).toFixed(2) : "",
      
      // Checking (Col AY-BD: 51-56)
      finishing.checking ? finishing.checking.today : "",
      finishing.checking ? finishing.checking.cumulative : "",
      finishing.checking ? finishing.checking.balance : "",
      finishing.checking ? finishing.checking.totalUsedManpower : "",
      "", // Column BC blank
      finishing.checking && finishing.checking.totalUsedManpower && finishing.checking.today ? (finishing.checking.totalUsedManpower / finishing.checking.today).toFixed(2) : "",
      
      // AQL Audit (Col BE-BJ: 57-62)
      aqlToday,
      aqlCum,
      aqlBal,
      aqlTodayResub,
      aqlCumResub,
      aqlPct ? aqlPct.toFixed(2) + "%" : "0%",
      
      // Ironing & Packing (Col BK-BP: 63-68)
      ironing.today || "",
      ironing.cumulative || "",
      ironing.balanceToPack || "",
      ironing.totalUsedManpower || "",
      "", // Column BO blank
      ironing.costPerPiece || "",
      
      // Carton Packing (Col BQ-BU: 69-73)
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
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
`;
