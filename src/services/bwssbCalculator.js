/**
 * BWSSB Water Bill Calculator Engine
 * Precise telescopic slab computation following official BWSSB tariff structure
 */

import tariffs from '../data/bwssb/tariffs.json';

/**
 * Calculates telescopic slab charges for a given consumption and slab array.
 * @param {number} consumption - Total consumption in KL
 * @param {Array} slabs - Array of slab objects from tariffs.json
 * @returns {Array} slabBreakdown - Each slab with usage and charge
 */
export function calcSlabBreakdown(consumption, slabs) {
  let remaining = consumption;
  return slabs.map(slab => {
    if (remaining <= 0) return { ...slab, usage: 0, charge: 0 };
    const maxInSlab = slab.to === null ? Infinity : slab.to - slab.from;
    const usage = Math.min(remaining, maxInSlab);
    const charge = usage * slab.rate;
    remaining -= usage;
    return { ...slab, usage: parseFloat(usage.toFixed(3)), charge: parseFloat(charge.toFixed(2)) };
  });
}

/**
 * Calculates the full BWSSB domestic individual water bill.
 * @param {object} params
 * @param {number} params.consumption - Monthly consumption in KL
 * @param {string} params.meterSize  - e.g. '15mm', '20mm'
 * @param {boolean} params.hasBorewell
 * @param {boolean} params.rwhNonCompliant - true if RWH mandate applies and NOT complied
 * @returns {object} Full bill breakdown
 */
export function calcDomesticBill({ consumption, meterSize = '15mm', hasBorewell = false, rwhNonCompliant = false }) {
  const cfg = tariffs.domestic;
  const slabBreakdown = calcSlabBreakdown(consumption, cfg.slabs);
  const waterCharge = slabBreakdown.reduce((sum, s) => sum + s.charge, 0);

  const sanitaryCfg = cfg.sanitaryCharge;
  const sanitaryCharge = Math.max(
    sanitaryCfg.minimumAmount,
    parseFloat((waterCharge * sanitaryCfg.percentage / 100).toFixed(2))
  );

  const meterFixed = (cfg.meterFixedCharges.find(m => m.size === meterSize) || cfg.meterFixedCharges[0]).charge;
  const borewellCharge = hasBorewell ? cfg.borewellCharge.fixed : 0;

  const subtotal = waterCharge + sanitaryCharge + meterFixed + borewellCharge;
  const rwhPenalty = rwhNonCompliant ? parseFloat((subtotal * cfg.rwhPenalty.surchargePercentage / 100).toFixed(2)) : 0;
  const total = parseFloat((subtotal + rwhPenalty).toFixed(2));

  return {
    type: 'domestic',
    consumption,
    slabBreakdown,
    waterCharge: parseFloat(waterCharge.toFixed(2)),
    sanitaryCharge: parseFloat(sanitaryCharge.toFixed(2)),
    meterFixed,
    borewellCharge,
    rwhPenalty,
    subtotal: parseFloat(subtotal.toFixed(2)),
    total,
    effectiveRate: consumption > 0 ? parseFloat((total / consumption).toFixed(2)) : 0,
    tariffYear: tariffs.metadata.effectiveFrom,
  };
}

/**
 * Calculates the BWSSB bulk domestic (apartment) bill.
 * Formula: Each flat gets (totalConsumption / numFlats) → compute domestic slab for that, sum all flats.
 */
export function calcApartmentBill({ totalConsumption, numFlats, hasBorewell = false, rwhNonCompliant = false }) {
  if (!numFlats || numFlats < 1) return null;
  const perFlatConsumption = totalConsumption / numFlats;
  const singleFlatBill = calcDomesticBill({ consumption: perFlatConsumption, hasBorewell: false, rwhNonCompliant: false });

  const totalWaterCharge = parseFloat((singleFlatBill.waterCharge * numFlats).toFixed(2));
  const totalSanitary = parseFloat((singleFlatBill.sanitaryCharge * numFlats).toFixed(2));
  const borewellCharge = hasBorewell ? tariffs.domestic.borewellCharge.fixed * numFlats : 0;
  const subtotal = totalWaterCharge + totalSanitary + borewellCharge;
  const rwhPenalty = rwhNonCompliant ? parseFloat((subtotal * tariffs.domestic.rwhPenalty.surchargePercentage / 100).toFixed(2)) : 0;
  const total = parseFloat((subtotal + rwhPenalty).toFixed(2));

  return {
    type: 'apartment',
    totalConsumption,
    numFlats,
    perFlatConsumption: parseFloat(perFlatConsumption.toFixed(3)),
    perFlatBreakdown: singleFlatBill,
    totalWaterCharge,
    totalSanitary,
    borewellCharge,
    rwhPenalty,
    subtotal: parseFloat(subtotal.toFixed(2)),
    total,
    perFlatTotal: parseFloat((total / numFlats).toFixed(2)),
    tariffYear: tariffs.metadata.effectiveFrom,
  };
}

/**
 * Calculates the BWSSB non-domestic / commercial bill.
 */
export function calcCommercialBill({ consumption, borewellHP = 0, rwhNonCompliant = false }) {
  const cfg = tariffs.nonDomestic;
  const slabBreakdown = calcSlabBreakdown(consumption, cfg.slabs);
  const waterCharge = slabBreakdown.reduce((sum, s) => sum + s.charge, 0);

  const sanitaryCharge = Math.max(
    cfg.sanitaryCharge.minimumAmount,
    parseFloat((waterCharge * cfg.sanitaryCharge.percentage / 100).toFixed(2))
  );

  const borewellCharge = borewellHP > 0 ? borewellHP * cfg.borewellCharge.perHP : 0;
  const subtotal = waterCharge + sanitaryCharge + borewellCharge;
  const rwhPenalty = rwhNonCompliant ? parseFloat((subtotal * tariffs.domestic.rwhPenalty.surchargePercentage / 100).toFixed(2)) : 0;
  const total = parseFloat((subtotal + rwhPenalty).toFixed(2));

  return {
    type: 'commercial',
    consumption,
    slabBreakdown,
    waterCharge: parseFloat(waterCharge.toFixed(2)),
    sanitaryCharge: parseFloat(sanitaryCharge.toFixed(2)),
    borewellCharge,
    rwhPenalty,
    subtotal: parseFloat(subtotal.toFixed(2)),
    total,
    effectiveRate: consumption > 0 ? parseFloat((total / consumption).toFixed(2)) : 0,
    tariffYear: tariffs.metadata.effectiveFrom,
  };
}

/**
 * Returns which slab a given cumulative consumption falls into (for the gauge/chart)
 */
export function getActiveSlabIndex(consumption, slabs) {
  let cumulative = 0;
  for (let i = 0; i < slabs.length; i++) {
    const slabEnd = slabs[i].to ?? Infinity;
    if (consumption <= slabEnd) return i;
    cumulative = slabEnd;
  }
  return slabs.length - 1;
}

/**
 * Projects future monthly bill assuming n% annual tariff escalation.
 */
export function projectFutureBill(currentBill, yearsAhead, escalationPct = 3) {
  return parseFloat((currentBill * Math.pow(1 + escalationPct / 100, yearsAhead)).toFixed(2));
}

export { tariffs };
