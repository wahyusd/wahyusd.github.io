/* ===================================================================
 * MAIN.JS — Logic utama website
 * File ini mengatur animasi, interaksi, dan mounting Vue.
 * 
 * Untuk update konten (nama, project, sosmed), edit DATA.JS saja.
 * File ini hanya perlu diedit jika ingin mengubah perilaku/animasi.
 * =================================================================== */


// =================================================================
// PRELOADER
// Spinner loading di awal halaman.
// Disembunyikan secepat mungkin agar halaman langsung terlihat.
// =================================================================

function dismissPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;
    preloader.style.opacity = '0';
    preloader.style.visibility = 'hidden';
}

// Failsafe: paksa sembunyikan preloader setelah 3 detik
// jika ada script yang gagal load (misal CDN timeout)
window.addEventListener('load', () => {
    setTimeout(dismissPreloader, 3000);
});


// =================================================================
// INISIALISASI UTAMA
// Semua fungsi dipanggil setelah DOM siap dan Vue selesai mount.
// =================================================================

document.addEventListener('DOMContentLoaded', () => {

    // Sembunyikan preloader 400ms setelah DOM siap
    setTimeout(dismissPreloader, 400);

    // Mount Vue 3 — menghubungkan data dari data.js ke HTML
    const { createApp } = Vue;

    const app = createApp({
        data() {
            // Ambil semua data dari portfolioData di data.js
            return {
                profile:    portfolioData.profile,
                socials:    portfolioData.socials,
                portfolios: [...(portfolioData.portfolios || [])].sort((a, b) => new Date(b.date) - new Date(a.date)),
                learningPosts: portfolioData.learningPosts || []
            };
        },
        computed: {
            sortedLearningPosts() {
                return [...(this.learningPosts || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
            }
        },
        methods: {
            formatDate(dateStr) {
                if (!dateStr) return '';
                const d = new Date(dateStr);
                if (isNaN(d.getTime())) return dateStr;
                return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            },
            getYouTubeId(url) {
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
            },
            getPostThumbnail(post) {
                if (post.thumbnail) return post.thumbnail;
                const ytid = this.getYouTubeId(post.youtubeLink);
                if (ytid) return `https://img.youtube.com/vi/${ytid}/maxresdefault.jpg`;
                return '';
            }
        },
        mounted() {
            // mounted() dipanggil setelah Vue selesai render DOM
            // Semua fungsi init dipanggil di sini agar elemen HTML sudah ada

            // Animasi typewriter logo di pojok kiri atas
            initLogoTypewriter();

            // Rotasi quote di hero section
            initQuoteRotator(portfolioData.profile.quotes);

            // Animasi typewriter role title di profile card
            // — mengambil array titles dari data.js
            initTitleTypewriter(portfolioData.profile.titles);

            // Header sticky saat scroll
            initHeaderScroll();

            // Toggle mobile menu (hamburger)
            initMobileMenu();

            // Highlight nav item aktif saat scroll
            initScrollSpy();

            // Animasi entrance (Anime.js) — dibungkus try/catch
            // Jika CDN Anime.js gagal load, halaman tetap berfungsi normal
            try {
                initAnimeAnimations();
                triggerEntranceAnimations();
                createFloatingParticles();
            } catch (e) {
                // Fallback: tampilkan semua elemen tanpa animasi
                document.querySelectorAll(
                    '.hero-content > *, .hero-profile-card, .header-logo, .header-nav-list li, .header-nav .btn'
                ).forEach(el => {
                    el.style.opacity = '1';
                    el.style.transform = 'none';
                });
            }
        }
    });

    app.mount('#app');
});


// =================================================================
// TYPEWRITER — ROLE TITLE (profile card)
// Mengetik dan menghapus judul satu per satu secara berulang.
// Daftar judul diambil dari profile.titles di data.js.
// =================================================================

function initTitleTypewriter(titles) {
    const el = document.getElementById('profile-title-typewriter');
    if (!el || !titles || titles.length === 0) return;

    let titleIndex = 0; // index judul yang sedang aktif
    let charIndex  = 0; // posisi karakter yang sedang diketik/dihapus
    let isDeleting = false;

    // --- Konfigurasi kecepatan & timing ---
    const TYPE_SPEED   = 80;    // ms antar karakter saat mengetik
    const DELETE_SPEED = 40;    // ms antar karakter saat menghapus (lebih cepat)
    const PAUSE_AFTER  = 10000; // ms diam setelah selesai mengetik (10 detik)
    const PAUSE_BEFORE = 600;   // ms jeda sebelum mulai mengetik judul berikutnya

    function tick() {
        const current = titles[titleIndex];

        if (!isDeleting) {
            // Mode mengetik: tambah satu karakter
            charIndex++;
            el.textContent = current.slice(0, charIndex);

            if (charIndex === current.length) {
                // Selesai mengetik — pause lalu mulai hapus
                isDeleting = true;
                setTimeout(tick, PAUSE_AFTER);
                return;
            }
            setTimeout(tick, TYPE_SPEED);

        } else {
            // Mode menghapus: kurangi satu karakter
            charIndex--;
            el.textContent = current.slice(0, charIndex);

            if (charIndex === 0) {
                // Selesai menghapus — pindah ke judul berikutnya
                isDeleting = false;
                titleIndex = (titleIndex + 1) % titles.length; // loop kembali ke awal
                setTimeout(tick, PAUSE_BEFORE);
                return;
            }
            setTimeout(tick, DELETE_SPEED);
        }
    }

    // Delay awal sebelum mulai animasi pertama
    setTimeout(tick, 800);
}


// =================================================================
// HERO QUOTE ROTATOR
// Mengganti quote secara berkala dengan fade crossfade.
// Quotes diambil dari profile.quotes di data.js.
// Untuk ubah jeda: edit DISPLAY_DURATION di bawah.
// =================================================================

function initQuoteRotator(quotes) {
    const el = document.getElementById('hero-quote-rotator');
    if (!el || !quotes || quotes.length === 0) return;

    const DISPLAY_DURATION = 20000; // ms tampil per quote (20 detik)
    const FADE_DURATION    = 800;   // ms fade — harus sama dengan CSS transition

    let index = 0;

    function showQuote(i) {
        el.classList.add('fade-out');
        setTimeout(() => {
            el.textContent = quotes[i];
            el.classList.remove('fade-out');
        }, FADE_DURATION);
    }

    // Tampilkan quote pertama langsung tanpa animasi
    el.textContent = quotes[0];

    // Rotasi setiap DISPLAY_DURATION ms
    setInterval(() => {
        index = (index + 1) % quotes.length;
        showQuote(index);
    }, DISPLAY_DURATION);
}


// =================================================================
// TYPEWRITER — LOGO (pojok kiri atas navbar)
// Mengetik "Wahyusd", diam 1 menit, hapus, lalu ulangi.
// Untuk ganti teks logo, update variabel `text` di bawah.
// =================================================================

function initLogoTypewriter() {
    const el = document.getElementById('logo-typewriter-text');
    if (!el) return;

    const text = 'Wahyusd'; // ← ganti teks logo di sini jika diperlukan

    let charIndex  = 0;
    let isDeleting = false;

    // --- Konfigurasi kecepatan & timing ---
    const TYPE_SPEED   = 110;   // sedikit lebih lambat dari role title — beda karakter
    const DELETE_SPEED = 60;
    const PAUSE_AFTER  = 60000; // diam 1 menit sebelum hapus — tidak mengganggu
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

    // Delay awal — sedikit lebih cepat dari role title
    setTimeout(tick, 600);
}


// =================================================================
// HEADER — Sticky & Back To Top
// Header jadi semi-transparan saat scroll.
// Tombol "back to top" muncul setelah scroll 700px.
// =================================================================

function initHeaderScroll() {
    const header = document.querySelector('.s-header');
    const goTop  = document.querySelector('.ss-go-top');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // Tambah class 'sticky' saat scroll — CSS yang handle tampilannya
        if (scrollY > 50) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }

        // Tampilkan tombol back-to-top saat sudah scroll cukup jauh
        if (scrollY > 700) {
            goTop.classList.add('link-is-visible');
        } else {
            goTop.classList.remove('link-is-visible');
        }
    });
}


// =================================================================
// MOBILE MENU
// Toggle sidebar navigasi di layar kecil (< 900px).
// Menu juga tutup otomatis jika klik di luar sidebar.
// =================================================================

function initMobileMenu() {
    const toggleButton = document.querySelector('.header-menu-toggle');
    const headerNav    = document.querySelector('.header-nav');
    const body         = document.body;

    function closeMenu() {
        toggleButton.classList.remove('is-clicked');
        body.classList.remove('menu-is-open');
    }

    if (toggleButton) {
        toggleButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // cegah event langsung ter-trigger close
            toggleButton.classList.toggle('is-clicked');
            body.classList.toggle('menu-is-open');
        });
    }

    // Tutup menu saat klik salah satu link navigasi
    const navLinks = document.querySelectorAll('.header-nav-list a, .header-nav .btn');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (body.classList.contains('menu-is-open')) closeMenu();
        });
    });

    // Tutup menu saat klik di luar sidebar
    document.addEventListener('click', (e) => {
        if (!body.classList.contains('menu-is-open')) return;
        const clickedInsideNav = headerNav    && headerNav.contains(e.target);
        const clickedToggle    = toggleButton && toggleButton.contains(e.target);
        if (!clickedInsideNav && !clickedToggle) closeMenu();
    });
}


// =================================================================
// SCROLL SPY
// Highlight item navigasi yang sesuai dengan section yang sedang dilihat.
// Bekerja otomatis — tidak perlu konfigurasi tambahan.
// =================================================================

function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop    = current.offsetTop - 100;
            const sectionId     = current.getAttribute('id');
            const navLink       = document.querySelector(`.header-nav-list a[href*=${sectionId}]`);

            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLink.classList.add('active-link');
                } else {
                    navLink.classList.remove('active-link');
                }
            }
        });
    });
}


// =================================================================
// ANIME.JS — ANIMASI ENTRANCE
// Animasi muncul pertama kali saat halaman dibuka.
// initAnimeAnimations: set opacity 0 dulu agar tidak flash
// triggerEntranceAnimations: jalankan animasi masuk
// =================================================================

function initAnimeAnimations() {
    // Sembunyikan elemen sebelum animasi berjalan
    anime.set('.anime-fade-in', { opacity: 0 });
    anime.set('.header-logo, .header-nav-list li, .header-nav .btn', { opacity: 0 });
}

function triggerEntranceAnimations() {
    // 1. Header — logo slide dari kiri, nav items turun satu per satu
    const tl = anime.timeline({ easing: 'easeOutExpo' });

    tl.add({
        targets: '.header-logo',
        translateX: [-30, 0],
        opacity: [0, 1],
        duration: 1000
    })
    .add({
        targets: '.header-nav-list li',
        translateY: [-20, 0],
        opacity: [0, 1],
        delay: anime.stagger(100), // tiap item delay 100ms dari sebelumnya
        duration: 800
    }, '-=800')
    .add({
        targets: '.header-nav .btn',
        scale: [0.9, 1],
        opacity: [0, 1],
        duration: 600
    }, '-=600');

    // 2. Hero content — setiap child element muncul bergantian dari bawah
    anime({
        targets: '.hero-content > *',
        translateY: [40, 0],
        opacity: [0, 1],
        delay: anime.stagger(120, { start: 300 }),
        duration: 1200,
        easing: 'easeOutExpo'
    });

    // 3. Profile card — muncul dari bawah dengan efek elastic (sedikit bounce)
    anime({
        targets: '.hero-profile-card',
        scale: [0.95, 1],
        translateY: [50, 0],
        opacity: [0, 1],
        delay: 500,
        duration: 1500,
        easing: 'easeOutElastic(1, 0.85)'
    });

    // 4. Glow di belakang avatar foto profil
    anime({
        targets: '.profile-avatar-glow',
        opacity: [0, 0.5],
        scale: [0.8, 1],
        delay: 1000,
        duration: 1500,
        easing: 'easeOutExpo'
    });
}


// =================================================================
// FLOATING PARTICLES
// Partikel kecil yang melayang di hero section sebagai dekorasi.
// Untuk ubah jumlah partikel: ganti angka 12 di loop for
// Untuk ubah warna: edit bagian backgroundColor di bawah
// =================================================================

function createFloatingParticles() {
    const heroSection = document.querySelector('.s-hero');
    if (!heroSection) return;

    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.classList.add('floating-particle');

        const size = anime.random(4, 14);
        particle.style.width        = `${size}px`;
        particle.style.height       = `${size}px`;
        particle.style.borderRadius = '50%';
        particle.style.top          = `${anime.random(5, 95)}%`;
        particle.style.left         = `${anime.random(2, 98)}%`;
        particle.style.opacity      = (anime.random(5, 25) / 100).toString();

        // 3 variasi warna partikel: violet terang, ungu dalam, putih redup
        if (i % 3 === 0) {
            particle.style.backgroundColor = '#c084fc';
            particle.style.boxShadow       = '0 0 12px rgba(192, 132, 252, 0.6)';
        } else if (i % 3 === 1) {
            particle.style.backgroundColor = '#a855f7';
            particle.style.boxShadow       = '0 0 12px rgba(168, 85, 247, 0.6)';
        } else {
            particle.style.backgroundColor = 'rgba(200,190,220,0.25)';
            particle.style.boxShadow       = 'none';
        }

        heroSection.appendChild(particle);
    }

    // Animasi melayang — bergerak random, bolak-balik, loop selamanya
    anime({
        targets:     '.s-hero .floating-particle',
        translateX:  () => anime.random(-60, 60),
        translateY:  () => anime.random(-60, 60),
        opacity:     () => anime.random(0.03, 0.25),
        scale:       () => [anime.random(0.7, 1.3)],
        duration:    () => anime.random(5000, 10000),
        delay:       () => anime.random(0, 3000),
        easing:      'easeInOutSine',
        direction:   'alternate',
        loop:        true
    });
}


// =================================================================
// SMOOTH SCROLL
// Klik link dengan class .smoothscroll akan scroll halus ke target.
// Dipasang di document level agar bekerja untuk elemen Vue juga.
// =================================================================

document.addEventListener('click', (e) => {
    const link = e.target.closest('a.smoothscroll');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    if (href === '#top' || href === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            // Offset 80px untuk kompensasi tinggi header yang fixed
            const offsetTop = target.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
    }
});
