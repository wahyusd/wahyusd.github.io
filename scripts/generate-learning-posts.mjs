/**
 * GENERATE LEARNING POSTS
 * HOW TO RUN:
 * 
 * Scans pages/learning/*.md for front matter and auto-updates
 * js/learning-data.js with the generated array.
 *
 * Usage: node scripts/generate-learning-posts.mjs
 *
 * Each .md file should start with front matter:
 * ---
 * title: "Post Title"
 * date: 2026-06-28
 * description: "Short description."
 * tags: [Tag1, Tag2]
 * youtubeLink: https://youtu.be/xxx   # optional
 * thumbnail: https://...              # optional, auto-derived from youtubeLink if omitted
 * ---
 *
 * The slug is derived from the filename (without .md).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const learningDir = path.resolve(__dirname, '..', 'pages', 'learning');
const outputPath = path.resolve(__dirname, '..', 'js', 'learning-data.js');

function parseFrontMatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n/);
    if (!match) return {};
    const raw = match[1];
    const meta = {};
    for (const line of raw.split('\n')) {
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) continue;
        const key = line.slice(0, colonIdx).trim();
        let val = line.slice(colonIdx + 1).trim();
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
        } else if (val.startsWith('[') && val.endsWith(']')) {
            val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^"(.*)"$/, '$1'));
        } else if (val === '' || val.toLowerCase() === 'null') {
            val = null;
        }
        meta[key] = val;
    }
    return meta;
}

function buildEntry(filename, meta) {
    const slug = path.basename(filename, '.md');
    const title = meta.title || slug;
    const date = meta.date || '';
    const description = meta.description || '';
    const tags = Array.isArray(meta.tags) ? meta.tags : [];
    const youtubeLink = meta.youtubeLink || null;
    const thumbnail = meta.thumbnail || null;
    const mdFile = `/pages/learning/${filename}`;

    return { title, slug, date, description, tags, youtubeLink, thumbnail, mdFile };
}

function formatEntry(e, indent) {
    const i = ' '.repeat(indent);
    const ii = ' '.repeat(indent + 4);
    const tags = e.tags.length
        ? `[${e.tags.map(t => `"${t}"`).join(', ')}]`
        : '[]';
    const yt = e.youtubeLink ? `"${e.youtubeLink}"` : 'null';
    const thumb = e.thumbnail ? `"${e.thumbnail}"` : 'null';

    return [
        `${i}{`,
        `${ii}title: "${e.title}",`,
        `${ii}slug: "${e.slug}",`,
        `${ii}date: "${e.date}",`,
        `${ii}description: "${e.description}",`,
        `${ii}tags: ${tags},`,
        `${ii}youtubeLink: ${yt},`,
        `${ii}thumbnail: ${thumb},`,
        `${ii}mdFile: "${e.mdFile}"`,
        `${i}}`,
    ].join('\n');
}

function main() {
    const files = fs.readdirSync(learningDir)
        .filter(f => f.endsWith('.md'))
        .sort();

    if (files.length === 0) {
        console.log('No .md files found in pages/learning/');
        return;
    }

    const entries = files.map(f => {
        const content = fs.readFileSync(path.join(learningDir, f), 'utf-8');
        const meta = parseFrontMatter(content);
        return buildEntry(f, meta);
    });

    entries.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date) - new Date(a.date);
    });

    const arrayContent = '[\n' + entries.map(e => formatEntry(e, 4)).join(',\n') + '\n    ]';

    const fileContent = `// =============================================================
// LEARNING-DATA.JS — Daftar learning posts
// Dihasilkan otomatis oleh scripts/generate-learning-posts.mjs
// Jangan edit langsung — edit .md di pages/learning/ lalu jalankan:
//   node scripts/generate-learning-posts.mjs
// =============================================================

portfolioData.learningPosts = ${arrayContent};
`;

    fs.writeFileSync(outputPath, fileContent, 'utf-8');
    console.log(`✓ Generated ${entries.length} post(s) → js/learning-data.js`);
}

main();
