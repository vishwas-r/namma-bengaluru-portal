import './style.css';
import deptData from './data/departments.json';
import { renderSOSBar, renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { renderModal } from './components/modal.js';
import { renderHomePage } from './pages/homePage.js';
import { renderComingSoonPage } from './pages/comingSoonPage.js';
import { renderBWSSBPage, renderTab as renderBWSSBTab, renderCalc as renderBWSSBCalc, recalcBill as recalcBWSSBBill, renderTariffChart as renderBWSSBTariffChart, renderNoticeCard as renderBWSSBNoticeCard, renderSteps as renderBWSSBSteps } from './pages/bwssbPage.js';
import { renderBESCOMPage, renderTab as renderBESCOMTab, renderCalc as renderBESCOMCalc, recalcBill as recalcBESCOMBill, renderTariffChart as renderBESCOMTariffChart, renderNoticeCard as renderBESCOMNoticeCard, renderSteps as renderBESCOMSteps } from './pages/bescomPage.js';
import { getKeyPool, addKey, removeKey, markKeyStatus, testKey, cleanKey, queryGemini } from './services/keyPool.js';
import { downloadBillPDF } from './services/pdfExporter.js';
import bwssbNoticesData from './data/bwssb/notices.json';
import bwssbComplaintsData from './data/bwssb/complaints.json';
import bescomNoticesData from './data/bescom/notices.json';
import bescomComplaintsData from './data/bescom/complaints.json';

// ── Application State ──────────────────────────────────────
const state = {
  route: 'home',
  deptId: null,
  activeTab: 'calculator',
  lang: localStorage.getItem('nb_lang') || 'en',
  theme: localStorage.getItem('nb_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  calcForm: {
    type: 'domestic',
    consumption: 15,
    numFlats: 56,
    meterSize: '15mm',
    hasBorewell: false,
    rwhNonCompliant: false,
  },
  modalOpen: false,
  dropdownOpen: false,
  mobileMenuOpen: false,
  noticeFilter: 'all',
  selectedComplaintType: 'no-water',
  selectedServiceId: 'name-change',
  chatHistory: [{
    role: 'bot',
    content: 'Namaskara! I am <strong>Ask NammaBengaluru AI</strong>, your citizen assistant for Bengaluru. Ask me anything about BWSSB water tariffs, BESCOM electricity bill, owner name change online, filing complaints, or Gazette circulars.'
  }],
};

// ── i18n Dictionary ────────────────────────────────────────
const I18N = {
  en: {
    heroTitle: 'Your Rights. Your City.<br>One Place.',
    heroSub: 'Access bill calculators, official circulars, complaint guides, online service wizards, and emergency helplines across all Bengaluru civic departments — 100% free.',
    placeholder: 'Search notices, tariffs, complaint guides...',
    tabs: {
      calculator: { icon: 'bi-calculator', label: 'Bill Calculator' },
      tariff: { icon: 'bi-table', label: 'Tariff & Rates' },
      services: { icon: 'bi-file-earmark-check', label: 'Services & Applications' },
      outages: { icon: 'bi-broadcast-pin', label: 'Outage Tracker' },
      notices: { icon: 'bi-newspaper', label: 'Notices' },
      complaint: { icon: 'bi-life-preserver', label: 'Complaint Guide' },
      ai: { icon: 'bi-robot', label: 'Ask NammaBengaluru AI' },
    },
    sync: 'AI-synced daily at 10 AM IST',
    langToggle: 'ಕನ್ನಡ',
  },
  kn: {
    heroTitle: 'ನಿಮ್ಮ ಹಕ್ಕುಗಳು. ನಿಮ್ಮ ನಗರ.<br>ಒಂದೇ ಜಾಗದಲ್ಲಿ.',
    heroSub: 'ಬೆಂಗಳೂರಿನ ಎಲ್ಲಾ ಸರ್ಕಾರಿ ಇಲಾಖೆಗಳ ಬಿಲ್ ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ಗಳು, ಸುತ್ತೋಲೆಗಳು, ದೂರು ಮಾರ್ಗದರ್ಶಿ ಮತ್ತು ತುರ್ತು ಸಹಾಯವಾಣಿಗಳು — 100% ಉಚಿತ.',
    placeholder: 'ಹುಡುಕಿ: ಸುತ್ತೋಲೆಗಳು, ದರಗಳು, ಮಾರ್ಗದರ್ಶಿ...',
    tabs: {
      calculator: { icon: 'bi-calculator', label: 'ಬಿಲ್ ಕ್ಯಾಲ್ಕುಲೇಟರ್' },
      tariff: { icon: 'bi-table', label: 'ದರ ಪಟ್ಟಿ' },
      services: { icon: 'bi-file-earmark-check', label: 'ಸೇವೆಗಳು ಮತ್ತು ಅರ್ಜಿಗಳು' },
      outages: { icon: 'bi-broadcast-pin', label: 'ಅಡಚಣೆ ಟ್ರ್ಯಾಕರ್' },
      notices: { icon: 'bi-newspaper', label: 'ಸುತ್ತೋಲೆಗಳು' },
      complaint: { icon: 'bi-life-preserver', label: 'ದೂರು ಮಾರ್ಗದರ್ಶಿ' },
      ai: { icon: 'bi-robot', label: 'AI ಕೇಳಿ' },
    },
    sync: 'ಪ್ರತಿ ದಿನ ಬೆಳಗ್ಗೆ 10 ಗಂಟೆಗೆ AI ಮೂಲಕ ಅಪ್‌ಡೇಟ್',
    langToggle: 'English',
  },
};

const getLang = () => I18N[state.lang] || I18N.en;

// ── Router ─────────────────────────────────────────────────
function router() {
  const hash = window.location.hash || '#/';
  if (hash.startsWith('#/dept/')) {
    state.route = 'dept';
    state.deptId = hash.replace('#/dept/', '');
  } else {
    state.route = 'home';
    state.deptId = null;
  }
  renderApp();
}

function navigate(path) {
  window.location.hash = path;
}

// ── Theme Management ───────────────────────────────────────
function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-bs-theme', theme);
  localStorage.setItem('nb_theme', theme);
  const btn = document.getElementById('themeBtn');
  if (btn) btn.innerHTML = theme === 'dark'
    ? '<i class="bi bi-sun-fill"></i>' : '<i class="bi bi-moon-stars-fill"></i>';
}

// ── Department Theme ───────────────────────────────────────
function applyDeptTheme(deptId) {
  const root = document.documentElement;
  if (!deptId) {
    document.body.classList.remove('is-dept-page');
    root.style.setProperty('--nb-dept-primary', '#4f46e5');
    root.style.setProperty('--nb-dept-dark', '#3730a3');
    root.style.setProperty('--nb-dept-rgb', '79, 70, 229');
    return;
  }
  document.body.classList.add('is-dept-page');
  const dept = deptData.find(d => d.id === deptId);
  if (dept && dept.color) {
    const hex = dept.color;
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    const darkR = Math.max(0, r - 35);
    const darkG = Math.max(0, g - 35);
    const darkB = Math.max(0, b - 35);
    const darkHex = '#' + [darkR, darkG, darkB].map(x => x.toString(16).padStart(2, '0')).join('');
    
    root.style.setProperty('--nb-dept-primary', hex);
    root.style.setProperty('--nb-dept-dark', darkHex);
    root.style.setProperty('--nb-dept-rgb', `${r}, ${g}, ${b}`);
  }
}

// ── Toast Notifications ────────────────────────────────────
function toast(msg, type = 'info', ms = 3500) {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const bg = { info: 'bg-primary', success: 'bg-success', error: 'bg-danger', warning: 'bg-warning text-dark' }[type] || 'bg-primary';
  const el = document.createElement('div');
  el.className = `toast align-items-center text-white ${bg} border-0 show`;
  el.innerHTML = `<div class="d-flex"><div class="toast-body fw-medium">${msg}</div>
    <button class="btn-close btn-close-white me-2 m-auto" onclick="this.closest('.toast').remove()"></button></div>`;
  c.appendChild(el);
  setTimeout(() => el.remove(), ms);
}

// ── Department Router Page ──────────────────────────────────
function renderDeptPage() {
  const dept = deptData.find(d => d.id === state.deptId);
  if (!dept) return '<div class="container py-5 text-center text-secondary">Department not found.</div>';
  if (dept.status !== 'live') return renderComingSoonPage(dept);
  if (state.deptId === 'bwssb') return renderBWSSBPage(dept, state, getLang());
  if (state.deptId === 'bescom') return renderBESCOMPage(dept, state, getLang());
  return renderComingSoonPage(dept);
}

// ── Root Render ────────────────────────────────────────────
function renderApp(skipScroll = false) {
  const page = state.route === 'dept' ? renderDeptPage() : renderHomePage(getLang());
  document.getElementById('app').innerHTML = `
    ${renderSOSBar()}
    ${renderHeader(state, getLang())}
    <main>${page}</main>
    ${renderFooter()}
    ${state.modalOpen ? renderModal() : ''}
    <div class="toast-container position-fixed bottom-0 end-0 p-3" id="toastContainer" style="z-index:9999;"></div>
  `;
  bindAll();
  applyTheme(state.theme);
  applyDeptTheme(state.route === 'dept' ? state.deptId : null);
  if (state.route === 'dept') {
    if (state.deptId === 'bwssb') {
      if (state.activeTab === 'calculator') recalcBWSSBBill(state);
      if (state.activeTab === 'tariff') setTimeout(renderBWSSBTariffChart, 60);
    } else if (state.deptId === 'bescom') {
      if (state.activeTab === 'calculator') recalcBESCOMBill(state);
      if (state.activeTab === 'tariff') setTimeout(renderBESCOMTariffChart, 60);
    }
  }
  if (!skipScroll && !state.modalOpen) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ── Event Handlers & Global Bindings ───────────────────────
function bindAll() {
  window.__navDept = (id) => {
    state.dropdownOpen = false;
    state.activeTab = 'calculator';
    navigate(`#/dept/${id}`);
  };

  window.__tab = (tabId) => {
    state.activeTab = tabId;
    const c = document.getElementById('tabContent');
    if (c) {
      if (state.deptId === 'bwssb') c.innerHTML = renderBWSSBTab(state, getLang());
      else if (state.deptId === 'bescom') c.innerHTML = renderBESCOMTab(state, getLang());
    }
    document.querySelectorAll('.nb-tab-btn').forEach(b => {
      b.classList.toggle('is-active', b.getAttribute('onclick')?.includes(`'${tabId}'`));
    });
    
    if (tabId === 'calculator') {
      if (state.deptId === 'bwssb') recalcBWSSBBill(state);
      else if (state.deptId === 'bescom') recalcBESCOMBill(state);
    }
    if (tabId === 'tariff') {
      if (state.deptId === 'bwssb') setTimeout(renderBWSSBTariffChart, 60);
      else if (state.deptId === 'bescom') setTimeout(renderBESCOMTariffChart, 60);
    }
  };

  window.__lang = () => {
    state.lang = state.lang === 'en' ? 'kn' : 'en';
    localStorage.setItem('nb_lang', state.lang);
    renderApp();
  };

  window.__theme = () => {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  };

  window.__toggleDropdown = (e) => {
    e.stopPropagation();
    state.dropdownOpen = !state.dropdownOpen;
    document.getElementById('deptDropdown')?.classList.toggle('open', state.dropdownOpen);
  };

  window.__toggleMobileMenu = () => {
    state.mobileMenuOpen = !state.mobileMenuOpen;
    const menu = document.getElementById('mobileMenu');
    if (menu) menu.style.setProperty('display', state.mobileMenuOpen ? 'block' : 'none', 'important');
  };

  window.__hideMobileMenu = () => {
    state.mobileMenuOpen = false;
    const menu = document.getElementById('mobileMenu');
    if (menu) menu.style.setProperty('display', 'none', 'important');
  };

  document.addEventListener('click', () => {
    if (state.dropdownOpen) {
      state.dropdownOpen = false;
      document.getElementById('deptDropdown')?.classList.remove('open');
    }
  });

  window.__filter = (f) => {
    state.noticeFilter = f;
    const el = document.getElementById('noticeList');
    const sourceData = state.deptId === 'bescom' ? bescomNoticesData : bwssbNoticesData;
    const list = sourceData
      .filter(n => f === 'all' || n.category === f)
      .sort((a, b) => new Date(b.date || b.syncedAt || 0) - new Date(a.date || a.syncedAt || 0));

    if (el) {
      if (list.length === 0) {
        el.innerHTML = '<div class="text-center text-secondary py-5">No notices found for this category.</div>';
      } else {
        const renderCard = state.deptId === 'bescom' ? renderBESCOMNoticeCard : renderBWSSBNoticeCard;
        el.innerHTML = list.map(n => renderCard(n)).join('');
      }
    }

    document.querySelectorAll('[onclick*="__filter"]').forEach(btn => {
      const isSelected = btn.getAttribute('onclick')?.includes(`'${f}'`);
      btn.classList.toggle('is-active', isSelected);
    });
  };

  window.__complaint = (id) => {
    state.selectedComplaintType = id;
    const box = document.getElementById('stepsBox');
    const hd = document.getElementById('stepsHeading');
    const sourceData = state.deptId === 'bescom' ? bescomComplaintsData : bwssbComplaintsData;
    const ct = sourceData.complaintTypes.find(c => c.id === id);
    if (box) {
      if (state.deptId === 'bescom') box.innerHTML = renderBESCOMSteps(ct);
      else box.innerHTML = renderBWSSBSteps(ct);
    }
    if (hd) hd.innerHTML = `<i class="bi bi-list-ol text-primary me-2"></i> Steps: ${ct?.label || ''}`;
    document.querySelectorAll('.nb-complaint-btn').forEach(btn => {
      btn.classList.toggle('is-selected', btn.getAttribute('onclick')?.includes(`'${id}'`));
    });
  };

  window.__service = (id) => {
    state.selectedServiceId = id;
    const c = document.getElementById('tabContent');
    if (c) {
      if (state.deptId === 'bwssb') c.innerHTML = renderBWSSBTab(state, getLang());
      else if (state.deptId === 'bescom') c.innerHTML = renderBESCOMTab(state, getLang());
    }
  };

  window.__toggleDoc = (chk) => {
    const label = chk.closest('.form-check')?.querySelector('.form-check-label');
    if (label) {
      label.style.textDecoration = chk.checked ? 'line-through' : 'none';
      label.style.opacity = chk.checked ? '0.65' : '1';
    }
  };

  window.__calc = (field, val) => {
    state.calcForm[field] = val;
    if (field === 'type') {
      const c = document.getElementById('tabContent');
      if (c) {
        if (state.deptId === 'bwssb') c.innerHTML = renderBWSSBCalc(state);
        else if (state.deptId === 'bescom') c.innerHTML = renderBESCOMCalc(state);
      }
    }
    if (field === 'consumption') {
      const rng = document.getElementById('consumptionRange');
      if (rng) rng.value = Math.min(val, state.deptId === 'bescom' ? 500 : 100);
    }
    if (state.deptId === 'bwssb') recalcBWSSBBill(state);
    else if (state.deptId === 'bescom') recalcBESCOMBill(state);
  };

  window.__calcSlider = (val) => {
    const v = parseFloat(val) || 0;
    state.calcForm.consumption = v;
    const inp = document.getElementById('consumptionInput');
    if (inp) inp.value = v;
    if (state.deptId === 'bwssb') recalcBWSSBBill(state);
    else if (state.deptId === 'bescom') recalcBESCOMBill(state);
  };

  window.__downloadPDF = () => {
    downloadBillPDF(state);
  };

  window.__modal = () => { state.modalOpen = true; renderApp(true); };
  window.__closeModal = () => { state.modalOpen = false; renderApp(true); };

  window.__addKey = async () => {
    const inp = document.getElementById('newKey');
    if (!inp?.value) return;
    const raw = cleanKey(inp.value);
    if (!raw) { toast('Please paste a valid Gemini API key.', 'warning'); return; }
    toast('Validating key with Google Gemini API...', 'info', 3000);
    const status = await testKey(raw);
    if (status === 'invalid') {
      toast('Invalid API key. Please copy directly from Google AI Studio (aistudio.google.com).', 'error', 5000);
      return;
    }
    if (!addKey(raw)) { toast('Key already in your pool.', 'warning'); return; }
    const pool = getKeyPool();
    const idx = pool.findIndex(k => k.key === raw);
    if (idx >= 0) markKeyStatus(idx, status);
    renderApp();
    toast(status === 'exhausted' ? 'Key saved (Quota limit currently reached).' : 'Gemini API key verified & saved successfully!', status === 'exhausted' ? 'warning' : 'success');
  };

  window.__removeKey = (i) => { removeKey(i); renderApp(); toast('Key removed.', 'info'); };

  window.__testKey = async (i) => {
    const pool = getKeyPool();
    if (!pool[i]) return;
    toast(`Testing key ${i + 1}...`, 'info', 2000);
    const r = await testKey(pool[i].key);
    markKeyStatus(i, r);
    renderApp();
    toast(r === 'ok' ? 'Key is working!' : r === 'exhausted' ? 'Quota exhausted.' : 'Key invalid.', r === 'ok' ? 'success' : 'warning');
  };

  window.__send = async () => {
    const inp = document.getElementById('chatIn');
    const btn = document.getElementById('chatSendBtn');
    const msg = inp?.value?.trim();
    if (!msg) return;
    inp.value = '';
    if (btn) btn.disabled = true;
    state.chatHistory.push({ role: 'user', content: msg });
    appendMsg('user', msg);

    const SYSTEM = `You are "Ask NammaBengaluru AI", the official AI guide for Bengaluru public utilities. Provide clear, accurate answers about BWSSB water tariffs (2026-27 telescopic slabs: 0-8 KL @ ₹9.53, 8-25 KL @ ₹14.97, 25-50 KL @ ₹35.39, >50 KL @ ₹51.64), BESCOM electricity tariffs (LT-2a: 0-50 units @ ₹4.75, 51-100 units @ ₹6.25, >100 units @ ₹7.80, with Gruha Jyothi free up to 200 units), apartment bulk billing, RWH non-compliance surcharge (+50%), borewell charges (+₹100/month), helplines (BWSSB: 1916, BESCOM: 1912), and RTI filing. Keep responses professional, helpful, concise, and formatted in HTML (use <strong>, <ul>, <li>, <br> tags instead of raw markdown).`;

    const typing = document.createElement('div');
    typing.className = 'd-flex gap-2';
    typing.innerHTML = `<div class="nb-chat-avatar flex-shrink-0" style="width:32px;height:32px;font-size:0.9rem;"><i class="bi bi-robot"></i></div><div class="nb-chat-bubble bot" style="font-style:italic;color:var(--bs-secondary-color);">Thinking...</div>`;
    document.getElementById('chatMsgs')?.appendChild(typing);
    scrollChat();
    try {
      const res = await queryGemini(msg, SYSTEM);
      typing.remove();
      state.chatHistory.push({ role: 'bot', content: res });
      appendMsg('bot', res);
    } catch (err) {
      typing.remove();
      appendMsg('bot', err.message === 'NO_KEYS_AVAILABLE' || err.message === 'ALL_KEYS_EXHAUSTED'
        ? 'All API keys are exhausted. Add a new key in the key management panel.'
        : 'Connection error. Please try again.');
    } finally { if (btn) btn.disabled = false; }
  };

  window.__search = (q) => { if (q.trim().length > 3) navigate('#/dept/bwssb'); };
}

function appendMsg(role, content) {
  const c = document.getElementById('chatMsgs');
  if (!c) return;
  const el = document.createElement('div');
  el.className = `d-flex gap-2 ${role === 'user' ? 'justify-content-end' : ''}`;
  el.innerHTML = `
    ${role === 'bot' ? '<div class="nb-chat-avatar flex-shrink-0" style="width:32px;height:32px;font-size:0.9rem;"><i class="bi bi-robot"></i></div>' : ''}
    <div class="nb-chat-bubble ${role}">${content}</div>`;
  c.appendChild(el);
  scrollChat();
}

function scrollChat() { const c = document.getElementById('chatMsgs'); if (c) c.scrollTop = c.scrollHeight; }

// ── Boot ───────────────────────────────────────────────────
window.addEventListener('hashchange', router);
router();
