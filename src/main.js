import './style.css';
import * as bootstrap from 'bootstrap';
window.bootstrap = bootstrap;
import TomSelect from 'tom-select';
import 'tom-select/dist/css/tom-select.bootstrap5.css';

import deptData from './data/departments.json';
import { renderSOSBar, renderHeader, renderGlobalSidebar } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { renderModal, renderSearchModal, renderSearchResultsHTML } from './components/modal.js';
import { renderHomePage } from './pages/homePage.js';
import { renderComingSoonPage } from './pages/comingSoonPage.js';
import { renderAboutPage } from './pages/aboutPage.js';
import { renderDepartmentsPage } from './pages/departmentsPage.js';
import { renderBWSSBPage, renderTab as renderBWSSBTab, renderCalc as renderBWSSBCalc, recalcBill as recalcBWSSBBill, renderTariffChart as renderBWSSBTariffChart, renderNoticeCard as renderBWSSBNoticeCard, renderSteps as renderBWSSBSteps } from './pages/bwssbPage.js';
import { renderBESCOMPage, renderTab as renderBESCOMTab, renderCalc as renderBESCOMCalc, recalcBill as recalcBESCOMBill, renderTariffChart as renderBESCOMTariffChart, renderNoticeCard as renderBESCOMNoticeCard, renderSteps as renderBESCOMSteps } from './pages/bescomPage.js';
import { renderMetroPage, renderTab as renderMetroTab } from './pages/metroPage.js';
import { getAllStations, getStationById } from './services/metroEngine.js';
import { initMetroLeafletMap } from './components/metroMap.js';
import { getCurrentUser, promptGoogleLogin } from './services/googleAuth.js';
import { subscribeToOutageReports, submitMetroReport } from './services/outageStore.js';
import { getKeyPool, addKey, removeKey, markKeyStatus, testKey, cleanKey, queryGemini } from './services/keyPool.js';
import { downloadBillPDF } from './services/pdfExporter.js';
import bwssbNoticesData from './data/bwssb/notices.json';
import bwssbComplaintsData from './data/bwssb/complaints.json';
import bescomNoticesData from './data/bescom/notices.json';
import bescomComplaintsData from './data/bescom/complaints.json';
import { updateMetaForRoute } from './services/seoEngine.js';

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
  searchModalOpen: false,
  searchQuery: '',
  dropdownOpen: false,
  mobileMenuOpen: false,
  deptSidebarOpen: window.innerWidth >= 992,
  noticeFilter: 'all',
  selectedComplaintType: 'no-water',
  selectedServiceId: 'name-change',
  metroCrowdReports: JSON.parse(localStorage.getItem('nb_metro_reports') || '[]'),
  chatHistory: [{
    role: 'bot',
    content: 'Namaskara! I am <strong>NammaBengaluru AI</strong>, your citizen assistant for Bengaluru. Ask me anything about BWSSB water tariffs, BESCOM electricity bill, owner name change online, filing complaints, or Gazette circulars.'
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
      social: { icon: 'bi-share', label: 'Social Feed' },
      complaint: { icon: 'bi-life-preserver', label: 'Complaint Guide' },
      ai: { icon: 'bi-robot', label: 'NammaBengaluru AI' },
    },
    sync: 'AI-synced daily at 10 AM IST',
    langToggle: 'ಕನ್ನಡ',
  },
};

const getLang = () => I18N.en;


// ── Google Translate Helper ────────────────────────────────
window.__changeLanguage = (langCode) => {
  const select = document.querySelector('select.goog-te-combo');
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event('change'));
    localStorage.setItem('nb_lang', langCode);
  }
};

// ── Router ─────────────────────────────────────────────────
function router() {
  const hash = window.location.hash || '#/';
  if (hash === '#/about') {
    state.route = 'about';
    state.deptId = null;
    applyDeptTheme(null);
  } else if (hash === '#/departments') {
    state.route = 'departments';
    state.deptId = null;
    applyDeptTheme(null);
  } else if (hash.startsWith('#/dept/')) {
    const rawPath = hash.replace('#/dept/', '');
    const parts = rawPath.split('/');
    const newDept = parts[0];
    const newTab = parts[1] || 'overview';

    state.route = 'dept';
    state.deptId = newDept;
    state.activeTab = newTab;
    applyDeptTheme(newDept);
  } else {
    state.route = 'home';
    state.deptId = null;
    applyDeptTheme(null);
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
  const logo = document.getElementById('nbAppLogo');
  if (logo) logo.src = theme === 'dark' ? './assets/images/logo.svg' : './assets/images/logo-light.svg';
}

// ── Department Theme ───────────────────────────────────────
function applyDeptTheme(deptId) {
  const root = document.documentElement;
  if (!deptId) {
    document.body.classList.remove('is-dept-page');
    root.style.setProperty('--nb-dept-primary', '#4f46e5');
    root.style.setProperty('--nb-dept-dark', '#3730a3');
    root.style.setProperty('--nb-dept-rgb', '79, 70, 229');
    root.style.removeProperty('--nb-dept-secondary');
    root.style.removeProperty('--nb-dept-gradient');
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
    
    if (dept.colorSecondary) {
      root.style.setProperty('--nb-dept-secondary', dept.colorSecondary);
    }
    if (dept.colorGradient) {
      root.style.setProperty('--nb-dept-gradient', dept.colorGradient);
    }
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
  if (state.deptId === 'bmrcl' || state.deptId === 'metro') return renderMetroPage(dept, state, getLang());
  return renderComingSoonPage(dept);
}

// ── Root Render ────────────────────────────────────────────
function renderApp(skipScroll = false) {
  let page = renderHomePage(getLang());
  if (state.route === 'dept') {
    page = renderDeptPage();
  } else if (state.route === 'about') {
    page = renderAboutPage();
  } else if (state.route === 'departments') {
    page = renderDepartmentsPage(getLang());
  }
  document.getElementById('app').innerHTML = `
    <!-- Top Header Stack: Full Width Edge-to-Edge -->
    <div class="nb-top-header-stack sticky-top border-bottom bg-body" style="z-index:1040;">
      ${renderSOSBar()}
      ${renderHeader(state, getLang())}
    </div>

    <!-- Main Body Layout Container (Below Top Header) -->
    <div class="nb-app-body-container position-relative">
      ${renderGlobalSidebar(state, getLang())}
      <div class="nb-app-main-content">
        <main class="pb-3">${page}</main>
        ${renderFooter()}
      </div>
    </div>
    ${state.modalOpen ? renderModal() : ''}
    ${state.searchModalOpen ? renderSearchModal(state) : ''}
    <div class="toast-container position-fixed bottom-0 end-0 p-3" id="toastContainer" style="z-index:9999;"></div>
  `;
  bindAll();
  updateMetaForRoute(state.route, state.deptId, state);
  applyTheme(state.theme);
  applyDeptTheme(state.route === 'dept' ? state.deptId : null);
  document.body.classList.toggle('nb-sidebar-open', Boolean(state.route === 'dept' && state.deptSidebarOpen));
  if (state.route === 'dept') {
    reloadTwitterWidgets();
    if (state.deptId === 'bwssb') {
      if (state.activeTab === 'calculator') recalcBWSSBBill(state);
      if (state.activeTab === 'tariff') setTimeout(renderBWSSBTariffChart, 60);
      if (state.activeTab === 'outages' || state.activeTab === 'planned-outages' || state.activeTab === 'crowd-reports') setTimeout(() => { if(window.__nbInitOutageMap) window.__nbInitOutageMap('bwssb'); }, 100);
    } else if (state.deptId === 'bescom') {
      if (state.activeTab === 'calculator') recalcBESCOMBill(state);
      if (state.activeTab === 'tariff') setTimeout(renderBESCOMTariffChart, 60);
      if (state.activeTab === 'outages' || state.activeTab === 'planned-outages' || state.activeTab === 'crowd-reports') setTimeout(() => { if(window.__nbInitOutageMap) window.__nbInitOutageMap('bescom'); }, 100);
    }
  }
  if (!skipScroll && !state.modalOpen) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (state.deptId === 'bmrcl' || state.deptId === 'metro') {
    initMetroSelects();
    setTimeout(initMetroLeafletMap, 120);
  }
}

let tsSource, tsDest, tsLive;
function initMetroSelects() {
  const cfg = {
    plugins: ['dropdown_input'],
    dropdownParent: 'body',
    searchField: ['text', 'neighborhood'],
    render: {
      option: function(data, escape) {
        const color = data.line === 'purple' ? '#a020f0' : data.line === 'green' ? '#4caf50' : '#ffc61a';
        return `<div class="py-2 px-3 border-bottom border-light-subtle bg-body text-body">
          <div class="fw-bold d-flex align-items-center gap-2" style="font-size: 0.92rem;">
            <span style="color: ${color}; font-size: 1rem; line-height: 1;">◉</span>
            <span>${escape(data.text)}</span>
          </div>
          ${data.neighborhood ? `<small class="text-secondary d-block text-truncate mt-1" style="font-size: 0.74rem; max-width: 100%;" title="${escape(data.neighborhood)}">${escape(data.neighborhood)}</small>` : ''}
        </div>`;
      },
      item: function(data, escape) {
        const color = data.line === 'purple' ? '#a020f0' : data.line === 'green' ? '#4caf50' : '#ffc61a';
        return `<div class="d-flex align-items-center gap-2 text-body">
          <span style="color: ${color}; font-size: 1rem; line-height: 1;">◉</span>
          <span class="fw-semibold" style="font-size: 0.92rem;">${escape(data.text)}</span>
        </div>`;
      }
    }
  };

  const sEl = document.getElementById('metroSourceSelect');
  if (sEl) tsSource = new TomSelect(sEl, cfg);
  const dEl = document.getElementById('metroDestSelect');
  if (dEl) tsDest = new TomSelect(dEl, cfg);
  const lEl = document.getElementById('metroLiveSelect');
  if (lEl) tsLive = new TomSelect(lEl, cfg);
}

function reloadTwitterWidgets() {
  setTimeout(() => {
    if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load();
    }
  }, 150);
}

// ── Event Handlers & Global Bindings ───────────────────────
function bindAll() {
  window.__switchSocialFeed = (tab) => {
    document.querySelectorAll('.nb-social-feed-pane').forEach(el => el.classList.add('d-none'));
    document.querySelectorAll('.nb-social-subtab-btn').forEach(btn => {
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-outline-secondary');
    });
    
    const activePane = document.getElementById(`socialPane_${tab}`);
    if (activePane) activePane.classList.remove('d-none');
    
    const activeBtn = document.getElementById(`socialTabBtn_${tab}`);
    if (activeBtn) {
      activeBtn.classList.remove('btn-outline-secondary');
      activeBtn.classList.add('btn-primary');
    }
  };

  window.__toggleMobileTabMenu = (e) => {
    e.stopPropagation();
    const menu = document.getElementById('mobileTabMenu');
    if (menu) menu.classList.toggle('d-none');
  };

  window.__selectMobileTab = (id) => {
    const menu = document.getElementById('mobileTabMenu');
    if (menu) menu.classList.add('d-none');
    window.__tab(id);
  };

  window.__navDept = (id, tab = 'overview') => {
    state.dropdownOpen = false;
    if (window.innerWidth < 992 && window.__toggleSidebar) {
      window.__toggleSidebar(false);
    }
    state.activeTab = tab;
    navigate(`#/dept/${id}/${tab}`);
  };

  window.__tab = (tabId) => {
    state.activeTab = tabId;
    if (window.innerWidth < 992 && window.__toggleSidebar) {
      window.__toggleSidebar(false);
    }
    if (state.route === 'dept' && state.deptId) {
      const targetHash = `#/dept/${state.deptId}/${tabId}`;
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      } else {
        renderApp(true);
      }
    } else {
      renderApp(true);
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

  window.__toggleSidebar = (forceState) => {
    state.deptSidebarOpen = forceState !== undefined ? Boolean(forceState) : !state.deptSidebarOpen;
    const sidebar = document.getElementById('nbDeptSidebar');
    const backdrop = document.getElementById('nbDeptSidebarBackdrop');
    if (sidebar) sidebar.classList.toggle('is-open', state.deptSidebarOpen);
    if (backdrop) backdrop.classList.toggle('is-visible', state.deptSidebarOpen);
    document.body.classList.toggle('nb-sidebar-open', Boolean(state.route === 'dept' && state.deptSidebarOpen));
  };

  window.__swapMetroStations = () => {
    const tmp = state.metroSource || 'majestic';
    state.metroSource = state.metroDest || 'whitefield';
    state.metroDest = tmp;
    if (tsSource) tsSource.setValue(state.metroSource, true);
    if (tsDest) tsDest.setValue(state.metroDest, true);
  };

  window.__onMetroStationChange = () => {
    const src = document.getElementById('metroSourceSelect')?.value;
    const dst = document.getElementById('metroDestSelect')?.value;
    if (src) state.metroSource = src;
    if (dst) state.metroDest = dst;
  };



  window.__calculateMetroFare = async () => {
    window.__onMetroStationChange();
    state.liveMetroFare = null; // Rely on local engine
    renderApp(true);
  };

  window.__selectMetroStation = (id) => {
    state.selectedMetroStationId = id;
    renderApp(true);
  };

  window.__openMetroMapModal = () => {
    const modal = document.getElementById('nbMetroMapModal');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
      document.body.classList.add('modal-open');
    }
  };

  window.__closeMetroMapModal = () => {
    const modal = document.getElementById('nbMetroMapModal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
  };

  window.__openTariffGuideModal = () => {
    const modal = document.getElementById('nbTariffGuideModal');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
      document.body.classList.add('modal-open');
    }
  };

  window.__closeTariffGuideModal = () => {
    const modal = document.getElementById('nbTariffGuideModal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
  };

  window.__triggerGoogleLoginForReport = () => {
    promptGoogleLogin(null, (loggedInUser) => {
      if (loggedInUser) {
        renderApp(true);
        setTimeout(() => {
          window.__openMetroReportModal();
        }, 100);
      }
    });
  };

  window.__openMetroReportModal = () => {
    const modal = document.getElementById('nbMetroReportModal');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
      document.body.classList.add('modal-open');
    }
  };

  window.__closeMetroReportModal = () => {
    const modal = document.getElementById('nbMetroReportModal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
  };

  window.__submitMetroCrowdReport = async (e) => {
    if (e) e.preventDefault();
    const user = getCurrentUser();
    if (!user) {
      promptGoogleLogin(null, () => {});
      return;
    }

    const line = document.getElementById('reportLineSelect')?.value || 'purple';
    const station = document.getElementById('reportStationInput')?.value || 'Majestic';
    const category = document.getElementById('reportCategorySelect')?.value || 'delay';
    const comment = document.getElementById('reportCommentInput')?.value || '';

    if (!comment.trim()) return;

    const categoryMap = {
      delay: { label: '⏱️ Train Delay (5-15 Mins)', badge: 'bg-warning text-dark', status: 'Active Disruption' },
      halted: { label: '🛑 Service Halted / Technical Snag', badge: 'bg-danger text-white', status: 'Service Halted' },
      crowd: { label: '🚨 Overcrowding / Long Queue', badge: 'bg-warning text-dark', status: 'Heavy Crowd' },
      outage: { label: '🚪 Lift / Escalator Outage', badge: 'bg-info text-white', status: 'Facility Outage' },
      normal: { label: '🟢 Service Running Normal', badge: 'bg-success text-white', status: 'Service Normal' }
    };

    const catObj = categoryMap[category] || categoryMap.delay;

    try {
      await submitMetroReport(user, {
        line: line,
        lineName: line === 'purple' ? 'Purple Line' : line === 'green' ? 'Green Line' : 'Yellow Line',
        station: station,
        category: category,
        categoryLabel: catObj.label,
        comment: comment.trim(),
        status: catObj.status,
        badgeClass: catObj.badge
      });

      window.__closeMetroReportModal();
      state.activeTab = 'crowd-reports';
      if (state.route === 'dept' && state.deptId) {
        window.location.hash = `#/dept/${state.deptId}/crowd-reports`;
      }
      renderApp(true);
    } catch (err) {
      alert(err.message || 'Failed to submit report. Please check your connection.');
    }
  };

  window.__upvoteMetroReport = (reportId) => {
    if (!state.metroCrowdReports) return;
    state.metroCrowdReports = state.metroCrowdReports.map(r => {
      if (r.id === reportId) {
        return { ...r, upvotes: r.upvotes + 1 };
      }
      return r;
    });
    localStorage.setItem('nb_metro_reports', JSON.stringify(state.metroCrowdReports));
    renderApp(true);
  };

  document.addEventListener('click', () => {
    if (state.dropdownOpen) {
      state.dropdownOpen = false;
      document.getElementById('deptDropdown')?.classList.remove('open');
    }
    const mobileTabMenu = document.getElementById('mobileTabMenu');
    if (mobileTabMenu && !mobileTabMenu.classList.contains('d-none')) {
      mobileTabMenu.classList.add('d-none');
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

  window.__toggleSidebarDepts = () => {
    const sublist = document.getElementById('sidebarDeptSublist');
    const chev = document.getElementById('sidebarDeptChevron');
    if (sublist) {
      const isHidden = window.getComputedStyle(sublist).display === 'none';
      sublist.style.setProperty('display', isHidden ? 'flex' : 'none', 'important');
      if (chev) chev.className = isHidden ? 'bi bi-chevron-down text-secondary' : 'bi bi-chevron-right text-secondary';
    }
  };

  window.__handleHomeSearch = (e) => {
    if (e.key === 'Enter') window.__triggerHomeSearch();
  };

  window.__triggerHomeSearch = () => {
    const query = document.getElementById('homeSearchInput')?.value?.toLowerCase().trim();
    if (!query) return;
    if (query.includes('bescom') || query.includes('power') || query.includes('electricity') || query.includes('light')) {
      navigate('#/dept/bescom');
    } else if (query.includes('bwssb') || query.includes('water') || query.includes('sewerage')) {
      navigate('#/dept/bwssb');
    } else if (query.includes('metro') || query.includes('train') || query.includes('bmtc')) {
      navigate('#/dept/bmtc');
    } else {
      navigate('#/dept/bescom');
    }
  };

  window.__service = (id) => {
    state.selectedServiceId = id;
    const c = document.getElementById('tabContent');
    if (c) {
      if (state.deptId === 'bwssb') c.innerHTML = renderBWSSBTab(state, getLang());
      else if (state.deptId === 'bescom') c.innerHTML = renderBESCOMTab(state, getLang());
      else if (state.deptId === 'bmrcl' || state.deptId === 'metro') {
        const depts = Array.isArray(deptData) ? deptData : (deptData.departments || []);
        const dept = depts.find(d => d.id === 'bmrcl' || d.id === 'metro') || { name: 'Namma Metro', fullName: 'Bengaluru Metro Rail Corporation Limited (BMRCL)' };
        c.innerHTML = renderMetroTab(state, getLang(), dept);
      }
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

    const SYSTEM = `You are "NammaBengaluru AI", the official AI guide for Bengaluru public utilities. Provide clear, accurate answers about BWSSB water tariffs (2026-27 telescopic slabs: 0-8 KL @ ₹9.53, 8-25 KL @ ₹14.97, 25-50 KL @ ₹35.39, >50 KL @ ₹51.64), BESCOM electricity tariffs (LT-2a: 0-50 units @ ₹4.75, 51-100 units @ ₹6.25, >100 units @ ₹7.80, with Gruha Jyothi free up to 200 units), apartment bulk billing, RWH non-compliance surcharge (+50%), borewell charges (+₹100/month), helplines (BWSSB: 1916, BESCOM: 1912), and RTI filing. Keep responses professional, helpful, concise, and formatted in HTML (use <strong>, <ul>, <li>, <br> tags instead of raw markdown).`;

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

  window.__openSearchModal = (initialQuery = '') => {
    state.searchModalOpen = true;
    state.searchQuery = initialQuery;
    renderApp(true);
    setTimeout(() => {
      const input = document.getElementById('modalSearchInput');
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }, 50);
  };

  window.__closeSearchModal = () => {
    state.searchModalOpen = false;
    renderApp(true);
  };

  window.__onSearchInput = (val) => {
    state.searchQuery = val;
    const container = document.getElementById('modalSearchResults');
    if (container) {
      container.innerHTML = renderSearchResultsHTML(val);
    }
  };

  window.__handleHeaderSearch = (e) => {
    const val = e.target?.value || '';
    if (val.trim().length > 0) {
      window.__openSearchModal(val);
    }
  };

  window.__triggerHomeSearch = () => {
    const input = document.getElementById('homeSearchInput');
    const val = input?.value || '';
    window.__openSearchModal(val);
  };

  window.__handleHomeSearch = (e) => {
    if (e.key === 'Enter') {
      window.__triggerHomeSearch();
    } else if ((e.target?.value || '').trim().length > 1) {
      window.__openSearchModal(e.target.value);
    }
  };
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

// ── Global Modal Close Handlers (ESC key & Backdrop / Outside Click) ──────
function closeAllModals() {
  let needsReRender = false;
  if (state.searchModalOpen) {
    state.searchModalOpen = false;
    needsReRender = true;
  }
  if (state.modalOpen) {
    state.modalOpen = false;
    needsReRender = true;
  }

  document.querySelectorAll('.modal').forEach(modal => {
    if (modal.classList.contains('show') || modal.style.display === 'block') {
      modal.classList.remove('show');
      modal.style.display = 'none';
    }
  });

  document.body.classList.remove('modal-open');
  if (needsReRender) {
    renderApp(true);
  }
}

window.__closeAllModals = closeAllModals;

window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (state.searchModalOpen) {
      window.__closeSearchModal();
    } else {
      window.__openSearchModal('');
    }
  } else if (e.key === 'Escape' || e.keyCode === 27) {
    closeAllModals();
  }
});

window.addEventListener('click', (e) => {
  if (e.target && e.target.classList && e.target.classList.contains('modal')) {
    closeAllModals();
  }
});

// ── Boot ───────────────────────────────────────────────────

subscribeToOutageReports('bescom', () => {
    // Re-render if widget is active
    if (window.__nbCurrentOutageTab === 'reports') router();
});
subscribeToOutageReports('bwssb', () => {
    if (window.__nbCurrentOutageTab === 'reports') router();
});

window.addEventListener('hashchange', router);
window.addEventListener('nb_auth_changed', () => {
  // Re-render the current route on login/logout
  router();
  
  // Try to preserve the active tab if we're on the outage widget
  if (window.__nbCurrentOutageTab === 'reports') {
      setTimeout(() => { if(window.__nbSwitchOutageTab) window.__nbSwitchOutageTab('reports'); }, 50);
  }
});
window.addEventListener('nb_outage_added', () => {
  // Re-render when an outage is successfully reported
  router();
  setTimeout(() => { if(window.__nbSwitchOutageTab) window.__nbSwitchOutageTab('reports'); }, 100);
});

router();
