/* ===================================================================
 * INCLUDE.JS — Inject reusable navbar & footer into sub-pages
 * Usage: <div data-include="navbar" data-active="learning"></div>
 *        <div data-include="footer"></div>
 * =================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    const includes = document.querySelectorAll('[data-include]');
    if (!includes.length) return;

    for (const el of includes) {
        const file = el.getAttribute('data-include');
        try {
            const res = await fetch(`/pages/utils/${file}.html`);
            if (!res.ok) throw new Error('Not found');
            el.innerHTML = await res.text();
        } catch (e) {
            console.warn(`Include failed: ${file}`);
        }
    }

    // --- Set active nav link ---
    const active = document.querySelector('[data-include="navbar"]');
    if (active) {
        const nav = active.getAttribute('data-active') || 'home';
        const link = active.querySelector(`[data-nav="${nav}"]`);
        if (link) link.classList.add('active-link');
    }

    // --- Init typewriter logo on sub-pages ---
    initLogoTypewriterSub();

    // --- Init hamburger menu on sub-pages ---
    initMobileMenuSub();

    // --- Init footer: dynamic year & social rotator ---
    initFooterSub();

    // --- Init search (navbar button connects to search bar) ---
    if (typeof initPageSearch === 'function') initPageSearch();

    // --- Disable search on non-list pages ---
    const path = window.location.pathname.replace(/(\/index\.html|\/)$/, '');
    const searchPages = ['/pages/projects', '/pages/learning'];
    if (!searchPages.includes(path)) {
        const btn = document.getElementById('nav-search-btn');
        const bar = document.getElementById('page-search-bar');
        if (btn) btn.closest('.nav-search-item').style.display = 'none';
        if (bar) bar.style.display = 'none';
    }
});

/* ===================================================================
 * TYPEWRITER — LOGO (sub-pages)
 * Mengetik "Wahyusd", diam, hapus, ulangi.
 * =================================================================== */

function initLogoTypewriterSub() {
    const el = document.getElementById('logo-typewriter-sub');
    if (!el) return;

    const text = 'Wahyusd';
    let charIndex = 0;
    let isDeleting = false;
    const TYPE_SPEED = 110;
    const DELETE_SPEED = 60;
    const PAUSE_AFTER = 60000;
    const PAUSE_BEFORE = 800;

    function tick() {
        if (!isDeleting) {
            charIndex++;
            el.textContent = text.slice(0, charIndex);
            if (charIndex === text.length) {
                isDeleting = true;
                setTimeout(tick, PAUSE_AFTER);
                return;
            }
            setTimeout(tick, TYPE_SPEED);
        } else {
            charIndex--;
            el.textContent = text.slice(0, charIndex);
            if (charIndex === 0) {
                isDeleting = false;
                setTimeout(tick, PAUSE_BEFORE);
                return;
            }
            setTimeout(tick, DELETE_SPEED);
        }
    }

    setTimeout(tick, 600);
}

/* ===================================================================
 * MOBILE MENU — sub-pages hamburger toggle
 * =================================================================== */

function initMobileMenuSub() {
    const toggle = document.getElementById('btn-menu-toggle-sub');
    const nav = document.getElementById('page-header-nav-sub');
    if (!toggle) return;

    function closeMenu() {
        toggle.classList.remove('is-clicked');
        nav.classList.remove('nav-open');
        document.body.classList.remove('menu-is-open-sub');
    }

    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle.classList.toggle('is-clicked');
        nav.classList.toggle('nav-open');
        document.body.classList.toggle('menu-is-open-sub');
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('nav-open')) closeMenu();
        });
    });

    document.addEventListener('click', (e) => {
        if (!nav.classList.contains('nav-open')) return;
        if (!nav.contains(e.target) && !toggle.contains(e.target)) closeMenu();
    });
}

/* ===================================================================
 * FOOTER — Dynamic year + social media rotator
 * =================================================================== */

function initFooterSub() {
    const yearEl = document.getElementById('footer-year-sub');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const rotator = document.getElementById('footer-social-rotator');
    const socials = typeof portfolioData !== 'undefined' ? portfolioData.socials : null;
    if (!rotator || !socials || !socials.length) return;

    let index = 0;
    const ROTATE_INTERVAL = 30000;

    function renderSocial(i) {
        const s = socials[i];
        let html;
        if (s.svg) {
            html = s.svg;
        } else {
            html = `<i class="${s.iconClass}"></i>`;
        }
        rotator.classList.add('fade-out');
        setTimeout(() => {
            rotator.innerHTML = `<a href="${s.url}" target="_blank" rel="noopener" title="${s.platform}">${html} ${s.handle || s.platform}</a>`;
            rotator.classList.remove('fade-out');
        }, 300);
    }

    renderSocial(0);
    setInterval(() => {
        index = (index + 1) % socials.length;
        renderSocial(index);
    }, ROTATE_INTERVAL);
}
