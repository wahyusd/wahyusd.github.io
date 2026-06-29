/* ===================================================================
 * PAGE.JS — Shared functionality for all sub-pages
 * Copy buttons, entrance animations, smooth scroll
 * =================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- Render project detail page from project-data.js ---
    const main = document.querySelector('main');
    const projectId = main ? main.getAttribute('data-project') : null;
    if (projectId && typeof portfolioData !== 'undefined' && portfolioData.portfolios) {
        const project = portfolioData.portfolios.find(p => p.id === projectId);
        if (!project) return;

        // --- Title & meta ---
        document.title = project.title + ' \u2014 Wahyusd';

        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && project.description) {
            metaDesc.setAttribute('content', project.description);
        }

        // --- Breadcrumb ---
        const breadcrumbEl = document.querySelector('[data-render="breadcrumb-title"]');
        if (breadcrumbEl) breadcrumbEl.textContent = project.title;

        // --- Hero title (last word wrapped in <span>) ---
        const heroTitle = document.querySelector('[data-render="hero-title"]');
        if (heroTitle) {
            const words = project.title.split(' ');
            const last = words.pop();
            heroTitle.innerHTML = words.join(' ') + ' <span>' + last + '</span>';
        }

        // --- Hero description ---
        const heroDesc = document.querySelector('[data-render="hero-desc"]');
        if (heroDesc && project.description) heroDesc.textContent = project.description;

        // --- Tech badges ---
        if (project.techStack) {
            const techs = project.techStack.split(',').map(s => s.trim()).filter(Boolean);
            const heroTags = document.querySelector('[data-render="hero-tags"]');
            if (heroTags) heroTags.innerHTML = techs.map(t => '<span class="page-tag">' + t + '</span>').join('');
            const techGrid = document.querySelector('[data-render="tech-grid"]');
            if (techGrid) techGrid.innerHTML = techs.map(t => '<span class="tech-badge">' + t + '</span>').join('');
        }

        // --- GitHub link ---
        const githubLink = document.querySelector('[data-render="github-link"]');
        if (githubLink && project.githubLink) githubLink.setAttribute('href', project.githubLink);

        // --- Media image ---
        const mediaImg = document.querySelector('[data-render="media-src"]');
        if (mediaImg && project.mediaLink) {
            mediaImg.setAttribute('src', project.mediaLink);
            mediaImg.setAttribute('alt', project.title + ' Screenshot');
        }

        // --- Media caption ---
        const mediaCaption = document.querySelector('[data-render="media-caption"]');
        if (mediaCaption) mediaCaption.textContent = project.title + ' \u2014 Main Interface';
    }

    // --- Copy Code Button ---
    document.querySelectorAll('.code-block').forEach(block => {
        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.innerHTML = '<i class="fas fa-copy"></i>';
        btn.title = 'Copy to clipboard';
        btn.setAttribute('aria-label', 'Copy code to clipboard');
        block.appendChild(btn);

        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const code = block.querySelector('pre').textContent;
            try {
                await navigator.clipboard.writeText(code);
                showCopied(btn);
            } catch {
                const ta = document.createElement('textarea');
                ta.value = code;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                showCopied(btn);
            }
        });
    });

    function showCopied(btn) {
        btn.innerHTML = '<i class="fas fa-check"></i>';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-copy"></i>';
            btn.classList.remove('copied');
        }, 2000);
    }

    // --- Entrance Animation: all at once from the top ---
    const animateEls = document.querySelectorAll('.page-section, .page-media');
    requestAnimationFrame(() => {
        animateEls.forEach(el => el.classList.add('aos-animate'));
    });

    // --- Smooth Scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});

/* ===================================================================
 * SEARCH — Init search toggle (called from include.js after navbar injection)
 * =================================================================== */

function initPageSearch() {
    const navBtn = document.getElementById('nav-search-btn');
    const bar = document.getElementById('page-search-bar');
    const input = document.getElementById('page-search-input');
    const close = document.getElementById('page-search-close');
    if (!navBtn || !bar) return;

    navBtn.addEventListener('click', () => {
        const nav = document.getElementById('page-header-nav-sub');
        const toggle = document.getElementById('btn-menu-toggle-sub');
        if (nav && nav.classList.contains('nav-open')) {
            nav.classList.remove('nav-open');
            if (toggle) toggle.classList.remove('is-clicked');
            document.body.classList.remove('menu-is-open-sub');
        }
        bar.classList.add('active');
        setTimeout(() => input.focus(), 100);
    });

    function closeSearch() {
        bar.classList.remove('active');
        input.value = '';
        if (typeof window._searchFilter === 'function') window._searchFilter('');
    }

    close.addEventListener('click', closeSearch);

    input.addEventListener('input', () => {
        if (typeof window._searchFilter === 'function') window._searchFilter(input.value);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSearch();
    });

    document.addEventListener('click', (e) => {
        if (bar.classList.contains('active') && !e.target.closest('#page-search-bar') && !e.target.closest('#nav-search-btn')) {
            closeSearch();
        }
    });
}