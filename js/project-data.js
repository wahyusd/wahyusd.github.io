// =============================================================
// PROJECT-DATA.JS — Daftar portfolio project
// Edit file ini untuk nambah / ubah / hapus project.
//
// Cara tambah project baru:
//   1. Copy salah satu object { } di bawah
//   2. Isi data project kamu
//   3. Upload screenshot ke assets/images/portfolio/
//   4. Buat halaman detail di pages/projects/ (optional)
// =============================================================

portfolioData.portfolios = [
    {
        id: "ws-downloader",
        title: "WS Downloader",
        date: "2026-04-11",
        techStack: "Python, yt-dlp, Eel, Playwright",
        description: "A versatile multi-platform media downloader and automated image fetcher featuring real-time interception, integrated browser capabilities, and yt-dlp engine support for streamlined media archival.",
        githubLink: "https://github.com/wahyusd/ws-downloader",
        projectLink: null,
        pageLink: "/pages/projects/ws-downloader.html",
        mediaLink: "/assets/images/portfolio/ws-downloader/preview.jpeg",
        mediaType: "image"
    },
    {
        id: "ws-broll-assistant",
        title: "WS B-Roll Assistant",
        date: "2026-05-13",
        techStack: "Python, Eel, Faster-Whisper, Ollama, Tailwind CSS, Vanilla JS",
        description: "An AI-powered desktop companion for video editors that automates transcription, story segmentation, B-Roll recommendations, and YouTube chapter generation using both local and cloud-based LLMs.",
        githubLink: "https://github.com/wahyusd/ws-broll-assistant",
        projectLink: null,
        pageLink: "/pages/projects/ws-broll-assistant.html",
        mediaLink: "/assets/images/portfolio/ws-b-roll/preview.jpeg",
        mediaType: "image"
    },
    {
        id: "news-center",
        title: "News Center",
        date: "2026-5-13",
        techStack: "Tauri v2, Rust, Vite 6, JavaScript, Tailwind CSS 3.4, SQLite FTS5, HTML5",
        description: "A high-performance RSS news aggregator and article reader built with Tauri and Vite, featuring offline-first storage and smart deduplication for a clean, distraction-free reading experience.",
        githubLink: "https://github.com/wahyusd/news-center",
        projectLink: null,
        pageLink: "/pages/projects/news-center.html",
        mediaLink: "/assets/images/portfolio/news-center/preview.jpeg",
        mediaType: "image"
    },
    {
        id: "emotube-ws",
        title: "EmoTube WS",
        date: "2026-06-10",
        techStack: "React 19, TypeScript, FastAPI, PostgreSQL, scikit-learn, Docker, vis-network, TanStack Query, Tailwind CSS v4",
        description: "An advanced YouTube comment sentiment analyzer featuring a pure statistical NLP pipeline, topic clustering, and interactive word network graphs for deep audience insights.",
        githubLink: "https://github.com/wahyusd/emotube-ws",
        projectLink: null,
        pageLink: "/pages/projects/emotube-ws.html",
        mediaLink: "/assets/images/portfolio/emotube-ws/preview.jpeg",
        mediaType: "image"
    }
];
