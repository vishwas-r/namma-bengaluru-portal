// ── SEO & Meta Tag Management Engine ────────────────────────────────
import deptData from '../data/departments.json';

export function updatePageMeta({ title, description, image, keywords, author, url }) {
  // 1. Page Title
  if (title) document.title = title;

  // Helper to set or create meta tags dynamically
  const setMeta = (selector, attrName, attrVal, content) => {
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  const setLink = (rel, href) => {
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
    }
    el.setAttribute('href', href);
  };

  const defaultDesc = "Free, open-source citizen services portal for Bengaluru. Access BWSSB water tariffs, BESCOM power outages, Namma Metro route pathfinder, official circulars, and RTI assistance.";
  const defaultImage = "https://nammabengaluru.online/assets/images/logo.png";
  const defaultAuthor = "Namma Bengaluru Open Source Community";
  const defaultKeywords = "Namma Bengaluru, Bengaluru citizen portal, BWSSB, BESCOM, Namma Metro, BMRCL, BBMP, civic services Bengaluru";

  const metaDesc = description || defaultDesc;
  const metaImg = image || defaultImage;
  const metaAuth = author || defaultAuthor;
  const metaKeys = keywords || defaultKeywords;
  const metaUrl = url || window.location.href;

  setMeta('meta[name="description"]', 'name', 'description', metaDesc);
  setMeta('meta[name="keywords"]', 'name', 'keywords', metaKeys);
  setMeta('meta[name="author"]', 'name', 'author', metaAuth);

  // Open Graph / Facebook / WhatsApp
  setMeta('meta[property="og:title"]', 'property', 'og:title', title || 'Namma Bengaluru — Citizen Services Portal');
  setMeta('meta[property="og:description"]', 'property', 'og:description', metaDesc);
  setMeta('meta[property="og:image"]', 'property', 'og:image', metaImg);
  setMeta('meta[property="og:image:secure_url"]', 'property', 'og:image:secure_url', metaImg);
  setMeta('meta[property="og:url"]', 'property', 'og:url', metaUrl);

  // Twitter Card
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title || 'Namma Bengaluru — Citizen Services Portal');
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', metaDesc);
  setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', metaImg);

  // Canonical Link
  setLink('canonical', metaUrl);
}

export function updateMetaForRoute(route, deptId, state = {}) {
  if (route === 'home' || route === '' || !route) {
    updatePageMeta({
      title: 'Namma Bengaluru — Citizen Services Portal | BWSSB, BESCOM & Namma Metro',
      description: 'Unified open-source public utilities and citizen services portal for Bengaluru. Access BWSSB water tariffs, BESCOM power outages, Namma Metro route pathfinder, and official circulars.',
      keywords: 'Namma Bengaluru, Bengaluru citizen portal, BWSSB, BESCOM, Namma Metro, BMRCL, BBMP, civic services Bengaluru',
      image: 'https://nammabengaluru.online/assets/images/logo.png'
    });
  } else if (route === 'departments') {
    updatePageMeta({
      title: 'Bengaluru Public Utilities Directory — All Government Departments | Namma Bengaluru',
      description: 'Official directory of all public utility boards, transport corporations, municipal authorities, and development agencies serving Namma Bengaluru.',
      keywords: 'Bengaluru departments, BWSSB, BESCOM, BMRCL, BBMP, BMTC, BDA, public utilities Bengaluru',
      image: 'https://nammabengaluru.online/assets/images/logo.png'
    });
  } else if (route === 'about') {
    updatePageMeta({
      title: 'About Namma Bengaluru Portal — Open Source Civic Platform',
      description: 'Learn about Namma Bengaluru Portal — a free, open-source civic platform empowering citizens with transparent utility calculators, circulars, and RTI assistance.',
      keywords: 'About Namma Bengaluru, open source civic platform, Bengaluru public utilities, Vishwas R',
      image: 'https://nammabengaluru.online/assets/images/logo.png'
    });
  } else if (route === 'dept' && deptId) {
    const dept = deptData.find(d => d.id === deptId);
    if (dept) {
      const activeTab = state.activeTab || 'overview';
      const tabNames = {
        overview: 'Overview',
        calculator: 'Bill & Fare Calculator',
        tariff: 'Tariff & Rates',
        notices: 'Official Circulars & Notices',
        services: 'Services & Guides',
        complaint: 'Complaint Guide',
        outages: 'Outage Tracker',
        'planned-outages': 'Official Announcements',
        'crowd-reports': 'Live Crowd Reports',
        'live-stations': 'Station Directory & Google Maps'
      };
      const tabLabel = tabNames[activeTab] ? ` - ${tabNames[activeTab]}` : '';
      
      const deptImages = {
        bwssb: 'https://nammabengaluru.online/assets/images/bwssb-header.png',
        bescom: 'https://nammabengaluru.online/assets/images/bescom-header.png',
        bmrcl: 'https://nammabengaluru.online/assets/images/namma-metro-header.png',
        metro: 'https://nammabengaluru.online/assets/images/namma-metro-header.png'
      };

      const featuredImage = deptImages[dept.id] || 'https://nammabengaluru.online/assets/images/logo.png';

      updatePageMeta({
        title: `${dept.fullName} (${dept.name})${tabLabel} | Namma Bengaluru Portal`,
        description: `Official portal for ${dept.fullName}. ${dept.description}. Check tariffs, calculate bills, read regulations, and access services.`,
        keywords: `${dept.name}, ${dept.fullName}, ${dept.name} Bengaluru, ${dept.name} helpline, ${dept.name} tariffs`,
        image: featuredImage,
        author: `${dept.fullName} & Namma Bengaluru Open Source Community`
      });
    }
  }
}
