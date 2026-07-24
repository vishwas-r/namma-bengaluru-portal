import tariffData from '../data/bescom/tariffs.json';

export function calcDomesticElectricityBill({ consumption = 0, sanctionedLoad = 1, gruhaJyothi = false }) {
  const result = {
    fixedCharge: 0,
    energyCharge: 0,
    facCharge: 0,
    electricityDuty: 0,
    total: 0,
    slabBreakdown: []
  };

  const t = tariffData.domestic;
  if (!t) return result;

  // Fixed Charges (Sanctioned Load)
  const baseFixedCharge = t.fixedCharges[0].charge;
  const extraFixedCharge = t.fixedCharges[1]?.charge || baseFixedCharge;
  
  if (sanctionedLoad <= 1) {
    result.fixedCharge = baseFixedCharge;
  } else {
    result.fixedCharge = baseFixedCharge + (Math.ceil(sanctionedLoad) - 1) * extraFixedCharge;
  }

  // Gruha Jyothi Logic (If eligible and consumption <= 200)
  // Simplified logic: If Gruha Jyothi is active and usage <= 200, energy & fixed are ₹0
  let isGruhaJyothiApplied = gruhaJyothi && consumption <= 200;

  if (isGruhaJyothiApplied) {
    result.fixedCharge = 0;
    // Energy is 0
  } else {
    // Energy Charges (Telescopic Slabs)
    let remaining = consumption;
    
    for (const slab of t.slabs) {
      if (remaining <= 0) break;
      
      const slabMax = slab.to === null ? Infinity : (slab.to - slab.from + (slab.from === 0 ? 0 : 1));
      const usageInSlab = Math.min(remaining, slabMax);
      
      const charge = usageInSlab * slab.rate;
      result.energyCharge += charge;
      
      result.slabBreakdown.push({
        label: slab.label,
        usage: usageInSlab,
        rate: slab.rate,
        charge: charge,
        color: slab.color
      });
      
      remaining -= usageInSlab;
    }
  }

  // Fuel Adjustment Charge (FAC)
  if (!isGruhaJyothiApplied && consumption > 0) {
    result.facCharge = consumption * t.fuelAdjustmentCharge;
  }

  // Electricity Duty (9% on fixed + energy + fac)
  if (!isGruhaJyothiApplied) {
    result.electricityDuty = (result.fixedCharge + result.energyCharge + result.facCharge) * (t.electricityDutyPercent / 100);
  }

  result.total = result.fixedCharge + result.energyCharge + result.facCharge + result.electricityDuty;
  
  // Format to 2 decimal places
  result.fixedCharge = parseFloat(result.fixedCharge.toFixed(2));
  result.energyCharge = parseFloat(result.energyCharge.toFixed(2));
  result.facCharge = parseFloat(result.facCharge.toFixed(2));
  result.electricityDuty = parseFloat(result.electricityDuty.toFixed(2));
  result.total = parseFloat(result.total.toFixed(2));
  result.effectiveRate = consumption > 0 ? (result.total / consumption) : 0;
  result.isGruhaJyothiApplied = isGruhaJyothiApplied;

  return result;
}

export function calcCommercialElectricityBill({ consumption = 0, sanctionedLoad = 1 }) {
  const result = {
    fixedCharge: 0,
    energyCharge: 0,
    facCharge: 0,
    electricityDuty: 0,
    total: 0,
    slabBreakdown: []
  };

  const t = tariffData.commercial;
  if (!t) return result;

  // Commercial Fixed Charges
  const fixedRate = t.fixedCharges[0].charge;
  result.fixedCharge = Math.ceil(sanctionedLoad) * fixedRate;

  // Energy Charges
  let remaining = consumption;
  
  for (const slab of t.slabs) {
    if (remaining <= 0) break;
    
    const slabMax = slab.to === null ? Infinity : (slab.to - slab.from + (slab.from === 0 ? 0 : 1));
    const usageInSlab = Math.min(remaining, slabMax);
    
    const charge = usageInSlab * slab.rate;
    result.energyCharge += charge;
    
    result.slabBreakdown.push({
      label: slab.label,
      usage: usageInSlab,
      rate: slab.rate,
      charge: charge,
      color: slab.color
    });
    
    remaining -= usageInSlab;
  }

  // FAC
  if (consumption > 0) {
    result.facCharge = consumption * t.fuelAdjustmentCharge;
  }

  // Electricity Duty
  result.electricityDuty = (result.fixedCharge + result.energyCharge + result.facCharge) * (t.electricityDutyPercent / 100);

  result.total = result.fixedCharge + result.energyCharge + result.facCharge + result.electricityDuty;
  
  result.fixedCharge = parseFloat(result.fixedCharge.toFixed(2));
  result.energyCharge = parseFloat(result.energyCharge.toFixed(2));
  result.facCharge = parseFloat(result.facCharge.toFixed(2));
  result.electricityDuty = parseFloat(result.electricityDuty.toFixed(2));
  result.total = parseFloat(result.total.toFixed(2));
  result.effectiveRate = consumption > 0 ? (result.total / consumption) : 0;

  return result;
}
