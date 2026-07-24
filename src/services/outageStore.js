/**
 * Crowd-Sourced Outage Data Store — Namma Bengaluru Portal
 * Manages verified citizen outage reports, rate limiting, and 2-hour TTL auto-decay.
 */

const STORAGE_KEY_PREFIX = 'nb_outages_';

export const NEIGHBORHOODS = [
  'HSR Layout',
  'Indiranagar',
  'Whitefield / ITPL',
  'Jayanagar',
  'Koramangala',
  'Yelahanka',
  'Electronic City',
  'JP Nagar',
  'Hebbal / Sahakarnagar',
  'Bellandur / Sarjapur Road',
  'Marathahalli / Varthur',
  'Malleshwaram / Rajajinagar',
  'BTM Layout',
  'Banashankari'
];

export function getOutageReports(dept = 'bescom') {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + dept);
    let reports = raw ? JSON.parse(raw) : [];

    // Apply 2-Hour TTL Auto-Decay (filter out reports older than 2 hours)
    const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
    const validReports = reports.filter(r => new Date(r.timestamp).getTime() > twoHoursAgo);

    if (validReports.length !== reports.length) {
      localStorage.setItem(STORAGE_KEY_PREFIX + dept, JSON.stringify(validReports));
    }

    return validReports;
  } catch {
    return [];
  }
}

export function canUserReport(user, dept = 'bescom') {
  if (!user || !user.sub) return { allowed: false, reason: 'Please sign in with Google to report.' };

  const reports = getOutageReports(dept);
  const oneHourAgo = Date.now() - (60 * 60 * 1000);

  const recentUserReport = reports.find(r => r.user.sub === user.sub && new Date(r.timestamp).getTime() > oneHourAgo);

  if (recentUserReport) {
    const elapsedMins = Math.floor((Date.now() - new Date(recentUserReport.timestamp).getTime()) / 60000);
    const remainingMins = 60 - elapsedMins;
    return {
      allowed: false,
      reason: `You reported an outage ${elapsedMins}m ago. Next report available in ${remainingMins}m.`,
      remainingMins
    };
  }

  return { allowed: true };
}

export function submitOutageReport(user, dept, area, outageType) {
  const check = canUserReport(user, dept);
  if (!check.allowed) {
    throw new Error(check.reason);
  }

  const reports = getOutageReports(dept);
  const newReport = {
    id: 'rep_' + Math.random().toString(36).slice(2, 9),
    dept,
    area,
    outageType: outageType || (dept === 'bescom' ? 'Power Outage (Unscheduled)' : 'Water Supply Interruption'),
    user: {
      sub: user.sub,
      name: user.name,
      givenName: user.givenName || user.name.split(' ')[0],
      picture: user.picture || null
    },
    timestamp: new Date().toISOString(),
    verified: true
  };

  const updated = [newReport, ...reports];
  localStorage.setItem(STORAGE_KEY_PREFIX + dept, JSON.stringify(updated));
  return newReport;
}

export function getNeighborhoodStats(dept = 'bescom') {
  const reports = getOutageReports(dept);
  const stats = {};

  NEIGHBORHOODS.forEach(area => {
    stats[area] = { area, count: 0, highUrgencyCount: 0, reporters: [], latestTimestamp: null };
  });

  const thirtyMinsAgo = Date.now() - (30 * 60 * 1000);

  reports.forEach(r => {
    if (!stats[r.area]) {
      stats[r.area] = { area: r.area, count: 0, highUrgencyCount: 0, reporters: [], latestTimestamp: null };
    }
    const item = stats[r.area];
    item.count += 1;
    item.reporters.push(r.user);
    if (new Date(r.timestamp).getTime() > thirtyMinsAgo) {
      item.highUrgencyCount += 1;
    }
    if (!item.latestTimestamp || new Date(r.timestamp) > new Date(item.latestTimestamp)) {
      item.latestTimestamp = r.timestamp;
    }
  });

  // Calculate disruption status level
  Object.values(stats).forEach(item => {
    if (item.count >= 3 || item.highUrgencyCount >= 2) {
      item.level = 'high'; // 🔴 Active Community Alert
    } else if (item.count >= 1) {
      item.level = 'moderate'; // 🟡 Moderate Disruption
    } else {
      item.level = 'normal'; // 🟢 Normal Operations
    }
  });

  return stats;
}
