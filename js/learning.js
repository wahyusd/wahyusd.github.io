(function () {
    'use strict';

    const gridEl = document.getElementById('learning-grid');
    const listSection = document.getElementById('learning-list');
    const viewerEl = document.getElementById('learning-viewer');
    const viewerContent = document.getElementById('viewer-content');
    const viewerDate = document.getElementById('viewer-date');
    const viewerYoutube = document.getElementById('viewer-youtube');
    const backBtn = document.getElementById('viewer-back');

    if (!gridEl || !viewerEl) return;

    let posts = [];

    function loadPosts() {
        posts = (typeof portfolioData !== 'undefined' && portfolioData.learningPosts)
            ? [...portfolioData.learningPosts]
            : [];
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    function getYouTubeId(url) {
        if (!url) return null;
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /^([a-zA-Z0-9_-]{11})$/
        ];
        for (const p of patterns) {
            const m = url.match(p);
            if (m) return m[1];
        }
        return null;
    }

    function getThumbnail(post) {
        if (post.thumbnail) return post.thumbnail;
        const ytid = getYouTubeId(post.youtubeLink);
        if (ytid) return `https://img.youtube.com/vi/${ytid}/maxresdefault.jpg`;
        return null;
    }

    function renderGrid() {
        if (posts.length === 0) {
            gridEl.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <p>No posts yet. Add a .md file to pages/learning/ and an entry to js/learning-data.js.</p>
                </div>
            `;
            return;
        }

        gridEl.innerHTML = '';
        posts.forEach((post, i) => {
            const card = document.createElement('article');
            card.className = 'project-card';
            card.style.transitionDelay = (i * 0.1) + 's';
            card.setAttribute('data-slug', post.slug || '');

            const tagsHtml = post.tags && post.tags.length
                ? post.tags.map(t => `<span class="tech-tag">${t}</span>`).join('')
                : '';

            const dateStr = formatDate(post.date);
            const ytText = post.youtubeLink
                ? '<i class="fab fa-youtube" style="color:#ff4444;font-size:1.4rem;"></i> Watch on YouTube'
                : '';

            const thumb = getThumbnail(post);
            let thumbHtml;
            if (thumb) {
                thumbHtml = `<img src="${thumb}" alt="${post.title}" loading="lazy">`;
            } else {
                thumbHtml = `<div class="learning-card-thumb-placeholder"><i class="fas fa-book-open"></i></div>`;
            }

            card.innerHTML = `
                <div class="learning-card-horizontal">
                    <div class="learning-card-thumb">
                        ${thumbHtml}
                        <div class="learning-card-thumb-overlay"></div>
                    </div>
                    <div class="project-content" style="cursor:pointer;">
                        <div class="learning-card-date">${dateStr}</div>
                        <h3 class="project-title">${post.title}</h3>
                        <p class="project-desc">${post.description || ''}</p>
                        ${tagsHtml ? `<div class="learning-card-tags">${tagsHtml}</div>` : ''}
                        <div class="project-links">
                            ${ytText ? `<a href="${post.youtubeLink}" target="_blank" rel="noopener" class="project-link" title="Watch on YouTube">${ytText}</a>` : ''}
                        </div>
                    </div>
                    <span class="project-read-more">Read <i class="fas fa-arrow-right"></i></span>
                </div>
            `;

            card.addEventListener('click', () => openPost(post.slug || ''));
            gridEl.appendChild(card);
        });

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('aos-animate');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            document.querySelectorAll('.project-card').forEach(el => observer.observe(el));
        } else {
            document.querySelectorAll('.project-card').forEach(el => el.classList.add('aos-animate'));
        }
    }

    function openPost(slug) {
        const post = posts.find(p => (p.slug || '') === slug);
        if (!post) return;

        listSection.style.display = 'none';
        viewerEl.classList.remove('closing');
        viewerEl.classList.add('active');
        viewerEl.style.display = 'block';

        // Update breadcrumb
        const bcLink = document.getElementById('breadcrumb-learning-link');
        const bcSep = document.getElementById('breadcrumb-post-sep');
        const bcTitle = document.getElementById('breadcrumb-post-title');
        if (bcLink) bcLink.style.display = 'inline';
        if (bcSep) bcSep.style.display = 'inline';
        if (bcTitle) { bcTitle.style.display = 'inline'; bcTitle.textContent = post.title; }

        // Update hero section
        const heroTitle = document.querySelector('[data-render="learning-hero-title"]');
        const heroDesc = document.querySelector('[data-render="learning-hero-desc"]');
        const heroTags = document.querySelector('[data-render="learning-hero-tags"]');
        if (heroTitle) {
            const words = post.title.split(' ');
            const last = words.pop();
            heroTitle.innerHTML = words.join(' ') + ' <span>' + last + '</span>';
        }
        if (heroDesc && post.description) heroDesc.textContent = post.description;
        if (heroTags && post.tags && post.tags.length) {
            heroTags.innerHTML = post.tags.map(t => '<span class="page-tag">' + t + '</span>').join('');
        }

        // Update page title & meta
        document.title = post.title + ' \u2014 Learning \u2014 Wahyusd';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && post.description) metaDesc.setAttribute('content', post.description);

        viewerDate.textContent = formatDate(post.date);

        if (post.youtubeLink) {
            viewerYoutube.href = post.youtubeLink;
            viewerYoutube.style.display = 'inline-flex';
        } else {
            viewerYoutube.style.display = 'none';
        }

        viewerContent.innerHTML = '<p style="color:var(--text-dim)"><i class="fas fa-spinner fa-spin"></i> Loading...</p>';

        fetch(post.mdFile)
            .then(res => {
                if (!res.ok) throw new Error('Not found');
                return res.text();
            })
            .then(md => {
                const cleanMd = md.replace(/^---[\s\S]*?---\n*/, '');
                if (typeof marked !== 'undefined' && marked.parse) {
                    viewerContent.innerHTML = marked.parse(cleanMd, { gfm: true });
                } else {
                    viewerContent.innerHTML = '<pre style="white-space:pre-wrap">' + escapeHtml(cleanMd) + '</pre>';
                }
                addCopyButtons();
                initMermaid();
                applyContentEntrance();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            })
            .catch(() => {
                viewerContent.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Could not load the post.</p>
                    </div>
                `;
            });

        if (history.pushState) {
            history.pushState({ slug }, '', '#' + slug);
        }
    }

    function applyContentEntrance() {
        const children = viewerContent.children;
        if (!children.length) return;
        Array.from(children).forEach(el => el.classList.add('animate-on-scroll'));
        requestAnimationFrame(() => {
            Array.from(children).forEach(el => el.classList.add('aos-animate'));
        });
    }

    function initMermaid() {
        if (typeof mermaid === 'undefined' || !viewerContent) return;
        const codeBlocks = viewerContent.querySelectorAll('code.language-mermaid');
        if (!codeBlocks.length) return;
        codeBlocks.forEach(block => {
            const pre = document.createElement('pre');
            pre.className = 'mermaid';
            pre.textContent = block.textContent;
            block.parentElement.replaceWith(pre);
        });
        mermaid.run().catch(() => {});
    }

    function addCopyButtons() {
        viewerContent.querySelectorAll('pre code').forEach(block => {
            const btn = document.createElement('button');
            btn.className = 'copy-btn';
            btn.innerHTML = '<i class="fas fa-copy"></i>';
            btn.title = 'Copy code';
            btn.setAttribute('aria-label', 'Copy code');
            const parent = block.closest('pre');
            if (parent) {
                parent.style.position = 'relative';
                parent.appendChild(btn);
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    try {
                        await navigator.clipboard.writeText(block.textContent);
                        btn.innerHTML = '<i class="fas fa-check"></i>';
                        btn.classList.add('copied');
                        setTimeout(() => {
                            btn.innerHTML = '<i class="fas fa-copy"></i>';
                            btn.classList.remove('copied');
                        }, 2000);
                    } catch {
                        const ta = document.createElement('textarea');
                        ta.value = block.textContent;
                        ta.style.cssText = 'position:fixed;opacity:0';
                        document.body.appendChild(ta);
                        ta.select();
                        document.execCommand('copy');
                        document.body.removeChild(ta);
                        btn.innerHTML = '<i class="fas fa-check"></i>';
                        setTimeout(() => btn.innerHTML = '<i class="fas fa-copy"></i>', 2000);
                    }
                });
            }
        });
    }

    function closeViewer() {
        viewerEl.classList.add('closing');
        setTimeout(() => {
            viewerEl.classList.remove('active', 'closing');
            viewerEl.style.display = 'none';
            listSection.style.display = '';
            // Reset breadcrumb
            const bcLink = document.getElementById('breadcrumb-learning-link');
            const bcSep = document.getElementById('breadcrumb-post-sep');
            const bcTitle = document.getElementById('breadcrumb-post-title');
            if (bcLink) bcLink.style.display = '';
            if (bcSep) bcSep.style.display = 'none';
            if (bcTitle) { bcTitle.style.display = 'none'; bcTitle.textContent = ''; }
            // Reset hero section
            const heroTitle = document.querySelector('[data-render="learning-hero-title"]');
            const heroDesc = document.querySelector('[data-render="learning-hero-desc"]');
            const heroTags = document.querySelector('[data-render="learning-hero-tags"]');
            if (heroTitle) heroTitle.innerHTML = "What I've <span>Learned</span>";
            if (heroDesc) heroDesc.textContent = 'Notes, tutorials, and documentation from my experiments. Every project teaches me something new \u2014 I write it down here.';
            if (heroTags) heroTags.innerHTML = '';
            // Reset page title & meta
            document.title = "What I've Learned \u2014 Wahyusd";
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.setAttribute('content', 'Learning notes and documentation by Dian Wahyu Saputra \u2014 what I learn from building projects.');
            if (history.pushState) {
                history.pushState(null, '', '.');
            }
        }, 250);
    }

    function checkHash() {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            const post = posts.find(p => (p.slug || '') === hash);
            if (post) {
                setTimeout(() => openPost(hash), 100);
                return true;
            }
        }
        return false;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    loadPosts();
    renderGrid();

    // Search filter
    window._searchFilter = function(query) {
        const q = query.toLowerCase().trim();
        document.querySelectorAll('#learning-grid .project-card').forEach(card => {
            const title = card.querySelector('.project-title').textContent.toLowerCase();
            const tags = [...card.querySelectorAll('.tech-tag')].map(t => t.textContent.toLowerCase());
            const match = !q || title.includes(q) || tags.some(t => t.includes(q));
            card.style.display = match ? '' : 'none';
        });
    };

    if (checkHash()) {
        listSection.style.display = 'none';
        viewerEl.style.display = 'block';
        viewerEl.classList.add('active');
    }

    backBtn.addEventListener('click', closeViewer);
    window.addEventListener('popstate', () => {
        if (window.location.hash) {
            checkHash();
        } else {
            closeViewer();
        }
    });
})();
