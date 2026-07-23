/**
 * Crowd-sourced Gemini API Key Pool Manager
 * Using official @google/genai SDK with multi-model fallback (gemini-3.6-flash, gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash)
 */

import { GoogleGenAI } from "@google/genai";

const STORAGE_KEY = 'nb_gemini_keys';
const ACTIVE_KEY_IDX = 'nb_gemini_active_idx';

export const CANDIDATE_MODELS = [
  'gemini-3.6-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
];

/** Clean raw key string from quotes, spaces, newlines */
export function cleanKey(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw.trim().replace(/^["'`]|["'`]$/g, '').trim();
}

/** @returns {Array<{key: string, status: 'ok'|'exhausted'|'unknown', label: string, addedAt: number}>} */
export function getKeyPool() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const pool = JSON.parse(raw);
    return pool.map(k => ({ ...k, key: cleanKey(k.key) }));
  } catch {
    return [];
  }
}

export function saveKeyPool(pool) {
  const cleaned = pool.map(k => ({ ...k, key: cleanKey(k.key) }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
}

export function addKey(rawKey, label = '') {
  const cleaned = cleanKey(rawKey);
  if (!cleaned) return false;
  const pool = getKeyPool();
  if (pool.some(k => k.key === cleaned)) return false;
  pool.push({
    key: cleaned,
    status: 'unknown',
    label: label || `Key #${pool.length + 1}`,
    addedAt: Date.now()
  });
  saveKeyPool(pool);
  return true;
}

export function removeKey(index) {
  const pool = getKeyPool();
  pool.splice(index, 1);
  saveKeyPool(pool);
  const activeIdx = parseInt(localStorage.getItem(ACTIVE_KEY_IDX) || '0');
  if (activeIdx >= pool.length) localStorage.setItem(ACTIVE_KEY_IDX, '0');
}

export function markKeyStatus(index, status) {
  const pool = getKeyPool();
  if (pool[index]) pool[index].status = status;
  saveKeyPool(pool);
}

export function hasAnyKey() {
  return getKeyPool().filter(k => k.status !== 'exhausted').length > 0;
}

/**
 * Tests if a given API key works using @google/genai SDK across candidate models.
 * @param {string} rawKey
 * @returns {Promise<'ok'|'exhausted'|'invalid'>}
 */
export async function testKey(rawKey) {
  const key = cleanKey(rawKey);
  if (!key) return 'invalid';

  for (const model of CANDIDATE_MODELS) {
    try {
      // 1. Try SDK
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model,
        contents: 'Ping',
        config: { maxOutputTokens: 5 }
      });
      if (response) return 'ok';
    } catch (err) {
      const msg = String(err?.message || err || '');
      if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
        return 'exhausted';
      }
      if (msg.includes('API key not valid') || msg.includes('INVALID_ARGUMENT')) {
        return 'invalid';
      }
      // If 404 or model unrecognized by SDK, fallback to REST fetch test
      try {
        const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const res = await fetch(restUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'Ping' }] }] })
        });
        if (res.ok) return 'ok';
        if (res.status === 429) return 'exhausted';
      } catch {}
    }
  }

  // Final REST fallback check on models endpoint
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    if (listRes.ok) return 'ok';
    if (listRes.status === 429) return 'exhausted';
  } catch {}

  return 'invalid';
}

/**
 * Makes a Gemini API request using @google/genai SDK with automatic key & model rotation.
 * @param {string} prompt
 * @param {string} [systemInstruction]
 * @returns {Promise<string>}
 */
export async function queryGemini(prompt, systemInstruction = '') {
  const pool = getKeyPool();
  const availableKeys = pool.filter(k => k.status !== 'exhausted');

  if (availableKeys.length === 0) {
    throw new Error('NO_KEYS_AVAILABLE');
  }

  for (const keyEntry of availableKeys) {
    const key = cleanKey(keyEntry.key);
    const idx = pool.findIndex(k => k.key === key);

    for (const model of CANDIDATE_MODELS) {
      try {
        const ai = new GoogleGenAI({ apiKey: key });
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            ...(systemInstruction && { systemInstruction }),
            temperature: 0.3,
            maxOutputTokens: 4096
          }
        });

        const text = response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text) {
          if (idx >= 0) markKeyStatus(idx, 'ok');
          return text;
        }
      } catch (err) {
        const msg = String(err?.message || err || '');
        if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
          if (idx >= 0) markKeyStatus(idx, 'exhausted');
          break; // Try next key
        }

        // REST fallback for this model & key
        try {
          const body = {
            contents: [{ parts: [{ text: prompt }] }],
            ...(systemInstruction && { systemInstruction: { parts: [{ text: systemInstruction }] } }),
            generationConfig: { temperature: 0.3, maxOutputTokens: 4096 }
          };
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          if (res.ok) {
            const data = await res.json();
            const txt = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (txt) {
              if (idx >= 0) markKeyStatus(idx, 'ok');
              return txt;
            }
          }
        } catch {}
      }
    }
  }
  throw new Error('ALL_KEYS_EXHAUSTED');
}
