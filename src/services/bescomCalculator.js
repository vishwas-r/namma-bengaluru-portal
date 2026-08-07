import tariffData from '../data/bescom/tariffs.json';

export function calculateBESCOMUniversalBill({
  tariffId = 'lt1_domestic',
  consumption = 0,
  sanctionedLoad = 1,
  billingMonths = 1,
  facRate = 0.32,
  others = 0,
  gruhaJyothi = false
}) {
  const result = {
    tariffCode: 'LT-1',
    tariffLabel: 'LT-1 Domestic',
    unitType: 'kW',
    billingMonths: Math.max(1, parseInt(billingMonths) || 1),
    consumption: parseFloat(consumption) || 0,
    fixedCharge: 0,
    energyCharge: 0,
    facCharge: 0,
    facRate: parseFloat(facRate) >= 0 ? parseFloat(facRate) : 0.32,
    electricityDuty: 0,
    otherCharges: parseFloat(others) || 0,
    total: 0,
    isGruhaJyothiApplied: false,
    kercRef: '',
    slabBreakdown: []
  };

  const category = tariffData[tariffId] || tariffData.lt1_domestic;
  if (!category) return result;

  const months = result.billingMonths;
  result.tariffCode = category.code;
  result.tariffLabel = category.label;
  result.unitType = category.unitType || 'kW';
  result.kercRef = category.kercRef || '';

  // 1. Fixed Charges: Load (kW/HP) * Monthly Rate * Billing Months
  const load = Math.max(1, Math.ceil(sanctionedLoad));
  const fixedRate = category.fixedCharges || 150;
  result.fixedCharge = load * fixedRate * months;

  // 2. Gruha Jyothi Scheme Logic (LT-1 Domestic only, monthly average usage <= 200)
  const monthlyAvgUnits = consumption / months;
  let isGJ = Boolean(category.allowGruhaJyothi && gruhaJyothi && monthlyAvgUnits <= 200);
  result.isGruhaJyothiApplied = isGJ;

  if (isGJ) {
    result.fixedCharge = 0;
    result.energyCharge = 0;
    result.slabBreakdown.push({
      label: 'Gruha Jyothi Subsidy (Free up to 200 units)',
      usage: consumption,
      rate: 0,
      charge: 0,
      color: '#10b981'
    });
  } else {
    // Energy Charges (Total Units * Flat Energy Rate)
    const rate = category.energyRate || 5.80;
    result.energyCharge = consumption * rate;
    result.slabBreakdown.push({
      label: `₹${rate.toFixed(2)}/Unit`,
      usage: consumption,
      rate: rate,
      charge: result.energyCharge,
      color: '#10b981'
    });
  }

  // 3. Fuel Adjustment Charge (FAC)
  if (!isGJ && consumption > 0) {
    result.facCharge = consumption * result.facRate;
  }

  // 4. Electricity Duty (9% Govt Tax on Energy + Fixed Taxable Base)
  if (!isGJ && category.electricityDutyPercent > 0) {
    const fixedTaxableBase = result.fixedCharge >= 600 ? 158.82 : 0;
    const taxableBase = result.energyCharge + fixedTaxableBase;
    result.electricityDuty = Math.round(taxableBase * (category.electricityDutyPercent / 100) * 100) / 100;
  }

  result.total = result.fixedCharge + result.energyCharge + result.facCharge + result.electricityDuty + result.otherCharges;

  // Formatting decimal outputs
  result.fixedCharge = parseFloat(result.fixedCharge.toFixed(2));
  result.energyCharge = parseFloat(result.energyCharge.toFixed(2));
  result.facCharge = parseFloat(result.facCharge.toFixed(2));
  result.electricityDuty = parseFloat(result.electricityDuty.toFixed(2));
  result.otherCharges = parseFloat(result.otherCharges.toFixed(2));
  result.total = parseFloat(result.total.toFixed(2));
  result.effectiveRate = consumption > 0 ? parseFloat((result.total / consumption).toFixed(2)) : 0;

  return result;
}

// Backwards compatibility functions
export function calcDomesticElectricityBill(params) {
  return calculateBESCOMUniversalBill({ ...params, tariffId: 'lt1_domestic' });
}

export function calcCommercialElectricityBill(params) {
  return calculateBESCOMUniversalBill({ ...params, tariffId: 'lt3a_commercial' });
}
