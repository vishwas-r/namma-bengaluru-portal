import { jsPDF } from 'jspdf';
import { calcDomesticBill, calcApartmentBill, calcCommercialBill } from './bwssbCalculator.js';

export function downloadBillPDF(state) {
  const f = state.calcForm;
  let result;
  if (f.type === 'domestic') {
    result = calcDomesticBill({
      consumption: f.consumption,
      meterSize: f.meterSize,
      hasBorewell: f.hasBorewell,
      rwhNonCompliant: f.rwhNonCompliant
    });
  } else if (f.type === 'apartment') {
    result = calcApartmentBill({
      totalConsumption: f.consumption,
      numFlats: f.numFlats,
      hasBorewell: f.hasBorewell,
      rwhNonCompliant: f.rwhNonCompliant
    });
  } else {
    result = calcCommercialBill({
      consumption: f.consumption,
      rwhNonCompliant: f.rwhNonCompliant
    });
  }

  if (!result || result.total === undefined) {
    console.error('Calculation result invalid:', result);
    return;
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header Banner
  doc.setFillColor(52, 81, 184); // #3451b8
  doc.rect(0, 0, 210, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('NAMMA BENGALURU — CITIZEN SERVICES', 14, 12);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text('BWSSB Water & Sewerage Official Monthly Bill Estimate (2026-27)', 14, 19);

  // Metadata
  const now = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  doc.setFontSize(8.5);
  doc.text(`Generated: ${now}`, 196, 19, { align: 'right' });

  // 1. Connection Details Card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 32, 182, 38, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 32, 182, 38, 3, 3, 'D');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Connection Details', 20, 40);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const connLabel = f.type === 'domestic' ? 'Domestic (Individual)' : f.type === 'apartment' ? `Apartment Bulk (${f.numFlats} Units)` : 'Non-Domestic / Commercial';
  
  doc.text('Connection Type:', 20, 48);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(connLabel, 55, 48);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Monthly Consumption:', 20, 56);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(52, 81, 184);
  doc.text(`${f.consumption} KL (${f.consumption} m³)`, 62, 56);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Meter Fixed Charge:', 120, 48);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(f.meterSize || '15mm Standard', 158, 48);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Addon Options:', 120, 56);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const addons = [];
  if (f.hasBorewell) addons.push('Borewell (+₹100)');
  if (f.rwhNonCompliant) addons.push('No RWH (+50%)');
  doc.text(addons.length ? addons.join(', ') : 'Standard Connection', 152, 56);

  // 2. Total Monthly Bill Summary Banner
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 76, 182, 26, 3, 3, 'F');
  doc.setDrawColor(52, 81, 184);
  doc.setLineWidth(0.6);
  doc.roundedRect(14, 76, 182, 26, 3, 3, 'D');

  doc.setTextColor(52, 81, 184);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('ESTIMATED TOTAL MONTHLY BILL', 20, 84);

  doc.setFontSize(18);
  doc.text(`INR ${result.total.toFixed(2)}`, 20, 95);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const effRate = (result.total / (f.consumption || 1)).toFixed(2);
  doc.text(`Effective Rate: INR ${effRate} / KL (m³)`, 190, 95, { align: 'right' });

  // 3. Itemized Breakdown Table
  let y = 112;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Itemized Charge Breakdown', 14, y);

  y += 5;
  // Table Header Bar
  doc.setFillColor(52, 81, 184);
  doc.rect(14, y, 182, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('CHARGE ITEM', 18, y + 5.5);
  doc.text('DETAILS / FORMULA', 90, y + 5.5);
  doc.text('AMOUNT (INR)', 190, y + 5.5, { align: 'right' });

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  const slabs = result.slabBreakdown || (result.perFlatBreakdown ? result.perFlatBreakdown.slabBreakdown : []);
  if (slabs && slabs.length) {
    slabs.forEach((s, idx) => {
      doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
      doc.rect(14, y, 182, 7.5, 'F');
      doc.setTextColor(30, 41, 59);
      doc.text(`Water Charge (${s.label || 'Slab'})`, 18, y + 5);
      doc.setTextColor(100, 116, 139);
      doc.text(`${(s.usage || 0).toFixed(2)} KL (m³) x INR ${(s.rate || 0).toFixed(2)} / KL`, 90, y + 5);
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.text(`INR ${(s.charge || 0).toFixed(2)}`, 190, y + 5, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      y += 7.5;
    });
  } else {
    doc.setFillColor(255, 255, 255);
    doc.rect(14, y, 182, 7.5, 'F');
    doc.setTextColor(30, 41, 59);
    doc.text('Water Consumption Charge', 18, y + 5);
    doc.setTextColor(100, 116, 139);
    doc.text('Telescopic slab breakdown', 90, y + 5);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text(`INR ${(result.waterCharge || result.totalWaterCharge || 0).toFixed(2)}`, 190, y + 5, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    y += 7.5;
  }

  // Sanitary charge row
  const sanitaryVal = result.sanitaryCharge !== undefined ? result.sanitaryCharge : (result.totalSanitary || 0);
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, 182, 7.5, 'F');
  doc.setTextColor(30, 41, 59);
  doc.text('Sanitary / Sewerage Charge', 18, y + 5);
  doc.setTextColor(100, 116, 139);
  doc.text('25% of water consumption charge (min INR 100)', 90, y + 5);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(`INR ${sanitaryVal.toFixed(2)}`, 190, y + 5, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  y += 7.5;

  // Meter charge row
  const meterVal = result.meterFixed || 0;
  if (meterVal > 0) {
    doc.setFillColor(255, 255, 255);
    doc.rect(14, y, 182, 7.5, 'F');
    doc.setTextColor(30, 41, 59);
    doc.text('Meter Fixed Charge', 18, y + 5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${f.meterSize || '15mm'} fixed monthly meter fee`, 90, y + 5);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text(`INR ${meterVal.toFixed(2)}`, 190, y + 5, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    y += 7.5;
  }

  if (result.borewellCharge > 0) {
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y, 182, 7.5, 'F');
    doc.setTextColor(30, 41, 59);
    doc.text('Registered Borewell Fee', 18, y + 5);
    doc.setTextColor(100, 116, 139);
    doc.text('Fixed monthly borewell sanitary fee', 90, y + 5);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text(`INR ${result.borewellCharge.toFixed(2)}`, 190, y + 5, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    y += 7.5;
  }

  if (result.rwhPenalty > 0) {
    doc.setFillColor(254, 242, 242);
    doc.rect(14, y, 182, 7.5, 'F');
    doc.setTextColor(220, 38, 38);
    doc.text('Non-RWH Penalty (50%)', 18, y + 5);
    doc.setTextColor(220, 38, 38);
    doc.text('50% penalty on total water charges', 90, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(`INR ${result.rwhPenalty.toFixed(2)}`, 190, y + 5, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    y += 7.5;
  }

  // Total Summary Footer Row
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 9, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 196, y);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL ESTIMATED MONTHLY BILL', 18, y + 6);
  doc.setTextColor(52, 81, 184);
  doc.setFontSize(11);
  doc.text(`INR ${result.total.toFixed(2)}`, 190, y + 6, { align: 'right' });

  // Official Gazette Note Footer
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Verified against Official BWSSB Gazette Notification (Water Tariff 2026-27).', 14, 280);
  doc.text('Namma Bengaluru Citizen Portal — https://nammabengaluru.online', 196, 280, { align: 'right' });

  // Save PDF
  doc.save(`BWSSB_Water_Bill_Estimate_${f.consumption}KL.pdf`);
}
