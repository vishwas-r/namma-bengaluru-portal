/**
 * Crowd-Sourced Outage Data Store — Namma Bengaluru Portal
 * Manages verified citizen outage reports, rate limiting, and 2-hour TTL auto-decay.
 */

import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebaseSetup.js';
import bescomOutages from '../data/bescom/outages.json';
import bwssbOutages from '../data/bwssb/outages.json';

const BASELINE_DATASETS = {
  bescom: bescomOutages || [],
  bwssb: bwssbOutages || [],
  metro: [],
  bmrcl: []
};

// In-memory cache for synchronous reads by the UI
let cachedReports = {
  bescom: [],
  bwssb: [],
  metro: [],
  bmrcl: []
};

let unsubscribes = {};

export function subscribeToOutageReports(dept = 'bescom', callback) {
  if (unsubscribes[dept]) {
    unsubscribes[dept]();
  }

  const twoHoursAgoString = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  const q = query(
    collection(db, 'outages_' + dept),
    where('timestamp', '>', twoHoursAgoString),
    orderBy('timestamp', 'desc')
  );

  unsubscribes[dept] = onSnapshot(q, (snapshot) => {
    const reports = snapshot.docs.map(doc => {
      const data = doc.data();
      return { id: doc.id, ...data };
    });
    
    cachedReports[dept] = reports;
    if (callback) callback(reports);
  }, (error) => {
    console.warn("Firestore subscription error:", error);
    // Fallback to baseline if firestore fails
    if(cachedReports[dept].length === 0) cachedReports[dept] = BASELINE_DATASETS[dept];
  });
}

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
  return cachedReports[dept] || [];
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

export async function submitOutageReport(user, dept, area, outageType) {
  const check = canUserReport(user, dept);
  if (!check.allowed) {
    throw new Error(check.reason);
  }

  const newReport = {
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

  try {
    const docRef = await addDoc(collection(db, 'outages_' + dept), newReport);
    return { id: docRef.id, ...newReport };
  } catch (error) {
    console.error("Error adding document: ", error);
    throw new Error("Failed to save report. Please check your connection.");
  }
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

export async function submitMetroReport(user, reportData) {
  if (!user || !user.sub) {
    throw new Error('Please sign in with Google to report a Metro disruption.');
  }

  const newReport = {
    dept: 'metro',
    line: reportData.line || 'purple',
    lineName: reportData.lineName || 'Purple Line',
    station: reportData.station || 'Majestic',
    category: reportData.category || 'delay',
    categoryLabel: reportData.categoryLabel || '⏱️ Train Delay (5-15 Mins)',
    comment: reportData.comment,
    timeAgo: 'Just now',
    upvotes: 1,
    status: reportData.status || 'Active Disruption',
    badgeClass: reportData.badgeClass || 'bg-warning text-dark',
    user: {
      sub: user.sub,
      name: user.name,
      givenName: user.givenName || user.name.split(' ')[0],
      picture: user.picture || null,
      email: user.email || null
    },
    timestamp: new Date().toISOString(),
    verified: true
  };

  try {
    const docRef = await addDoc(collection(db, 'outages_metro'), newReport);
    return { id: docRef.id, ...newReport };
  } catch (error) {
    console.error("Error adding Metro report to Firestore: ", error);
    throw new Error("Failed to submit Metro report. Please check your network connection.");
  }
}
