"use strict";
/**
 * @file export.ts
 * @description Standalone SVG rendering of the current view, plus PNG/PDF/clipboard
 * helpers built on top of it. Browser-only helpers guard against server execution.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadBlob = downloadBlob;
exports.downloadFile = downloadFile;
exports.getSafeFilename = getSafeFilename;
exports.generateExportSVG = generateExportSVG;
exports.exportSVG = exportSVG;
exports.renderSVGToCanvas = renderSVGToCanvas;
exports.exportPNG = exportPNG;
exports.copyPNGToClipboard = copyPNGToClipboard;
exports.copySVGToClipboard = copySVGToClipboard;
exports.exportPDF = exportPDF;
const constants_1 = require("./constants");
const model_1 = require("./model");
const geometry_1 = require("./geometry");
const view_filters_1 = require("./view-filters");
const NODE_THEMES = {
    green: {
        bg1: '#ffffff',
        bg2: '#eaf5f0',
        border: '#b6d9ca',
        glyphBg: '#eaf5f0',
        glyphText: '#214c40',
        typeText: '#4a5c54',
        titleText: '#16201c',
        notesText: '#73847c',
        badgeBg: '#f0eee8',
        badgeText: '#4a5c54'
    },
    blue: {
        bg1: '#ffffff',
        bg2: '#eaf3ff',
        border: '#b8d4f8',
        glyphBg: '#eaf3ff',
        glyphText: '#1e4d7a',
        typeText: '#375b82',
        titleText: '#16201c',
        notesText: '#73847c',
        badgeBg: '#eaf3ff',
        badgeText: '#1e4d7a'
    },
    purple: {
        bg1: '#ffffff',
        bg2: '#f4efff',
        border: '#d5c4ff',
        glyphBg: '#f4efff',
        glyphText: '#5c3b99',
        typeText: '#5c4880',
        titleText: '#16201c',
        notesText: '#73847c',
        badgeBg: '#f4efff',
        badgeText: '#5c3b99'
    },
    dark: {
        bg1: '#2a473d',
        bg2: '#102c25',
        border: '#3e6859',
        glyphBg: 'rgba(255, 255, 255, 0.16)',
        glyphText: '#ffffff',
        typeText: '#a4c2b7',
        titleText: '#ffffff',
        notesText: '#c4d7cf',
        badgeBg: 'rgba(255, 255, 255, 0.14)',
        badgeText: '#ffffff'
    },
    amber: {
        bg1: '#ffffff',
        bg2: '#fff8eb',
        border: '#ebd09e',
        glyphBg: '#fff8eb',
        glyphText: '#8c5b16',
        typeText: '#78572b',
        titleText: '#16201c',
        notesText: '#73847c',
        badgeBg: '#fff8eb',
        badgeText: '#8c5b16'
    },
    ruby: {
        bg1: '#ffffff',
        bg2: '#fdf0f1',
        border: '#f0bec3',
        glyphBg: '#fdf0f1',
        glyphText: '#942b32',
        typeText: '#823b40',
        titleText: '#16201c',
        notesText: '#73847c',
        badgeBg: '#fdf0f1',
        badgeText: '#942b32'
    }
};
const GROUP_THEMES = {
    green: { bg: 'rgba(234, 245, 240, 0.48)', border: '#b6d9ca', text: '#214c40' },
    blue: { bg: 'rgba(234, 243, 255, 0.48)', border: '#b8d4f8', text: '#1e4d7a' },
    purple: { bg: 'rgba(244, 239, 255, 0.48)', border: '#d5c4ff', text: '#5c3b99' },
    dark: { bg: 'rgba(28, 43, 37, 0.08)', border: '#2a473d', text: '#16201c' },
    amber: { bg: 'rgba(255, 248, 235, 0.52)', border: '#ebd09e', text: '#8c5b16' },
    ruby: { bg: 'rgba(253, 240, 241, 0.52)', border: '#f0bec3', text: '#942b32' }
};
function downloadBlob(blob, filename) {
    if (typeof window === 'undefined')
        return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1200);
}
function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    downloadBlob(blob, filename);
}
function getSafeFilename(title, ext) {
    const safe = (title || 'corporate-structure')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_-]+/g, '-');
    return `${safe}.${ext}`;
}
function generateExportSVG(doc, options = {}) {
    const { background = 'paper', includeHeader = true, includeLegend = true } = options;
    const { entities, groups, activities, products, licences, preferences: prefs, chartTitle, chartSubtitle } = doc;
    const relationships = doc.relationships.filter(r => (0, view_filters_1.isEdgeVisible)(r, prefs));
    const cardWidth = prefs.cardWidth;
    const nodeHeights = (0, geometry_1.getCardHeights)(doc);
    const heightOf = (id) => nodeHeights.get(id) ?? 84;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of entities) {
        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x + cardWidth);
        maxY = Math.max(maxY, n.y + heightOf(n.id));
    }
    for (const g of groups) {
        minX = Math.min(minX, g.x);
        minY = Math.min(minY, g.y);
        maxX = Math.max(maxX, g.x + g.w);
        maxY = Math.max(maxY, g.y + g.h);
    }
    if (minX === Infinity) {
        minX = 0;
        minY = 0;
        maxX = 800;
        maxY = 600;
    }
    const boundsWidth = Math.max(640, maxX - minX);
    const boundsHeight = Math.max(420, maxY - minY);
    const padX = 64;
    const headerHeight = includeHeader ? 124 : 0;
    const legendHeight = includeLegend ? 70 : 0;
    const padYTop = 48 + headerHeight;
    const padYBottom = 48 + legendHeight;
    const width = Math.round(boundsWidth + padX * 2);
    const height = Math.round(boundsHeight + padYTop + padYBottom);
    const shiftX = Math.round(padX - minX);
    const shiftY = Math.round(padYTop - minY);
    const isDarkBg = background === 'dark';
    const bgFill = background === 'white' ? '#ffffff' : background === 'dark' ? '#111d19' : background === 'transparent' ? 'none' : '#f7f9f8';
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background:${bgFill}; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">\n`;
    svg += `  <defs>\n`;
    svg += `    <style>\n`;
    svg += `      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&amp;family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@500&amp;display=swap');\n`;
    svg += `    </style>\n`;
    svg += `    <filter id="card-shadow" x="-6%" y="-8%" width="116%" height="126%" filterUnits="userSpaceOnUse">\n`;
    svg += `      <feDropShadow dx="0" dy="2" stdDeviation="3.5" flood-color="#16201c" flood-opacity="0.06"/>\n`;
    svg += `    </filter>\n`;
    for (const [kind, def] of Object.entries(constants_1.RELATIONSHIP_KINDS)) {
        svg += `    <marker id="arrow-${kind}" markerWidth="9" markerHeight="9" refX="7.8" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,1 L8,4 L0,7 Z" fill="${def.color}"/></marker>\n`;
    }
    for (const [themeKey, t] of Object.entries(NODE_THEMES)) {
        svg += `    <linearGradient id="grad-${themeKey}" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0%" stop-color="${t.bg1}"/><stop offset="100%" stop-color="${t.bg2}"/></linearGradient>\n`;
    }
    if (background === 'paper') {
        svg += `    <pattern id="dot-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="0.9" fill="rgba(159, 179, 169, 0.45)"/></pattern>\n`;
    }
    svg += `  </defs>\n\n`;
    if (background !== 'transparent') {
        svg += `  <rect width="100%" height="100%" fill="${bgFill}"/>\n`;
        if (background === 'paper')
            svg += `  <rect width="100%" height="100%" fill="url(#dot-grid)"/>\n`;
    }
    // 1. Header
    if (includeHeader) {
        const titleColor = isDarkBg ? '#ffffff' : '#16201c';
        const subColor = isDarkBg ? '#a4c2b7' : '#4a5c54';
        const ruleColor = isDarkBg ? 'rgba(255, 255, 255, 0.12)' : 'rgba(22, 32, 28, 0.1)';
        const brandColor = '#214c40';
        const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        const statsStr = `${entities.length} entities · ${doc.relationships.length} relationships · ${activities.length} activities · ${products.length} products · ${licences.length} licences`;
        svg += `  <g transform="translate(48, 32)">\n`;
        svg += `    <rect x="0" y="0" width="7" height="7" rx="1.5" fill="${brandColor}"/><rect x="10" y="0" width="7" height="7" rx="1.5" fill="${brandColor}"/><rect x="0" y="10" width="7" height="7" rx="1.5" fill="${brandColor}"/><rect x="10" y="10" width="7" height="7" rx="1.5" fill="${brandColor}"/>\n`;
        svg += `    <text x="26" y="13" font-size="9.5" font-weight="700" fill="${brandColor}" letter-spacing="1.2">VIREX · CORPORATE ARCHITECTURE · ${(0, geometry_1.escapeHTML)(prefs.mode.toUpperCase())} VIEW</text>\n`;
        svg += `  </g>\n`;
        svg += `  <text x="48" y="78" font-family="'Fraunces', Georgia, serif" font-size="24" font-weight="700" fill="${titleColor}">${(0, geometry_1.escapeHTML)(chartTitle)}</text>\n`;
        if (chartSubtitle)
            svg += `  <text x="48" y="99" font-size="12.5" fill="${subColor}">${(0, geometry_1.escapeHTML)(chartSubtitle)}</text>\n`;
        svg += `  <text x="${width - 48}" y="76" font-size="11" font-weight="600" fill="${titleColor}" text-anchor="end">${statsStr}</text>\n`;
        svg += `  <text x="${width - 48}" y="97" font-family="'JetBrains Mono', monospace" font-size="10" fill="${subColor}" text-anchor="end">Exported ${dateStr}</text>\n`;
        svg += `  <line x1="48" y1="114" x2="${width - 48}" y2="114" stroke="${ruleColor}" stroke-width="1"/>\n\n`;
    }
    // 2. Groups
    for (const g of groups) {
        const gx = g.x + shiftX;
        const gy = g.y + shiftY;
        const gTheme = GROUP_THEMES[g.color || 'green'];
        svg += `  <rect x="${gx}" y="${gy}" width="${g.w}" height="${g.h}" rx="12" fill="${gTheme.bg}" stroke="${gTheme.border}" stroke-width="1.5" stroke-dasharray="5 4"/>\n`;
        svg += `  <text x="${gx + 14}" y="${gy + 22}" font-size="11" font-weight="700" fill="${gTheme.text}" letter-spacing="0.8">${(0, geometry_1.escapeHTML)(g.name).toUpperCase()}</text>\n`;
    }
    // 3. Edges
    const nodeMap = new Map(entities.map(n => [n.id, { ...n, x: n.x + shiftX, y: n.y + shiftY }]));
    const shifted = [...nodeMap.values()];
    const routeHints = (0, geometry_1.prepareEdgeRouting)(shifted, relationships, cardWidth, nodeHeights);
    const labels = [];
    for (const r of relationships) {
        const from = nodeMap.get(r.from);
        const to = nodeMap.get(r.to);
        if (!from || !to)
            continue;
        const path = (0, geometry_1.calculateEdgePath)(from, to, r, prefs.connectionStyle, cardWidth, heightOf(r.from), heightOf(r.to), routeHints.get(r.id) ?? null);
        const def = constants_1.RELATIONSHIP_KINDS[r.kind];
        const dash = def.dash ? `stroke-dasharray="${def.dash}"` : '';
        svg += `  <path d="${path.d}" fill="none" stroke="${def.color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#arrow-${r.kind})" ${dash}/>\n`;
        const text = (0, model_1.formatRelationshipLabel)(r);
        if (text)
            labels.push({ id: r.id, text, x: path.midX, y: path.midY, w: (0, geometry_1.estimateLabelWidth)(text) });
    }
    const labelPos = (0, geometry_1.resolveLabelPositions)(labels.map(l => ({ id: l.id, x: l.x, y: l.y, w: l.w, h: geometry_1.LABEL_HEIGHT })));
    for (const l of labels) {
        const p = labelPos.get(l.id) ?? l;
        svg += `  <rect x="${p.x - l.w / 2}" y="${p.y - geometry_1.LABEL_HEIGHT / 2}" width="${l.w}" height="${geometry_1.LABEL_HEIGHT}" rx="4" fill="#ffffff" stroke="#cbd8d1" stroke-width="1"/>\n`;
        svg += `  <text x="${p.x}" y="${p.y + 3.5}" font-size="11" font-weight="600" fill="#16201c" text-anchor="middle">${(0, geometry_1.escapeHTML)(l.text)}</text>\n`;
    }
    // 4. Entity cards
    for (const n of entities) {
        const x = n.x + shiftX;
        const y = n.y + shiftY;
        const cardHeight = heightOf(n.id);
        const theme = NODE_THEMES[n.color] ?? NODE_THEMES.green;
        const typeDef = (0, constants_1.getEntityType)(n.type);
        svg += `  <g transform="translate(${x}, ${y})">\n`;
        svg += `    <rect width="${cardWidth}" height="${cardHeight}" rx="9" fill="url(#grad-${n.color})" stroke="${theme.border}" stroke-width="1" filter="url(#card-shadow)"/>\n`;
        svg += `    <rect x="10" y="10" width="22" height="22" rx="4" fill="${theme.glyphBg}"/>\n`;
        svg += `    <text x="21" y="25" font-size="11.5" font-weight="700" fill="${theme.glyphText}" text-anchor="middle">${(0, geometry_1.escapeHTML)(typeDef.glyph)}</text>\n`;
        svg += `    <text x="38" y="22" font-size="9.5" font-weight="700" fill="${theme.typeText}" letter-spacing="0.6">${(0, geometry_1.escapeHTML)(typeDef.short).toUpperCase()}</text>\n`;
        if (n.jurisdiction) {
            const badgeX = cardWidth - 36;
            svg += `    <rect x="${badgeX}" y="10" width="26" height="15" rx="3" fill="${theme.badgeBg}" stroke="${theme.border}" stroke-width="0.8"/>\n`;
            svg += `    <text x="${badgeX + 13}" y="21" font-size="9" font-weight="700" fill="${theme.badgeText}" text-anchor="middle">${(0, geometry_1.escapeHTML)(n.jurisdiction.slice(0, 3).toUpperCase())}</text>\n`;
        }
        svg += `    <text x="12" y="50" font-size="12.5" font-weight="600" fill="${theme.titleText}">${(0, geometry_1.escapeHTML)(n.name || 'Untitled')}</text>\n`;
        const footer = n.regNumber ? `Reg. ${n.regNumber}` : n.status !== 'active' ? n.status.replace(/_/g, ' ') : '';
        if (footer)
            svg += `    <text x="12" y="72" font-family="'JetBrains Mono', monospace" font-size="9.5" fill="${theme.notesText}">${(0, geometry_1.escapeHTML)(footer)}</text>\n`;
        const links = (0, model_1.getEntityLinks)(doc, n.id);
        const rows = prefs.mode === 'activities'
            ? links.activities.map(({ activity, assignment }) => ({ marker: constants_1.ACTIVITY_ROLES[assignment.role].marker, text: activity.name, color: constants_1.ACTIVITY_STATUSES[activity.status].color }))
            : prefs.mode === 'products'
                ? links.products.map(({ product, assignment }) => ({ marker: constants_1.PRODUCT_ROLES[assignment.role].marker, text: product.name, color: constants_1.PRODUCT_STATUSES[product.status].color }))
                : [];
        let rowY = 84;
        if (rows.length > 0) {
            svg += `    <line x1="10" y1="${rowY}" x2="${cardWidth - 10}" y2="${rowY}" stroke="${theme.border}" stroke-width="0.8"/>\n`;
            rowY += 22;
            for (const row of rows.slice(0, geometry_1.CARD_MAX_ROWS)) {
                svg += `    <text x="12" y="${rowY}" font-size="9" fill="${row.color}">${row.marker}</text>\n`;
                svg += `    <text x="24" y="${rowY}" font-size="10" font-weight="500" fill="${theme.titleText}">${(0, geometry_1.escapeHTML)(row.text.slice(0, 28))}</text>\n`;
                rowY += 19;
            }
            if (rows.length > geometry_1.CARD_MAX_ROWS) {
                svg += `    <text x="24" y="${rowY - 3}" font-size="9" fill="${theme.notesText}">+${rows.length - geometry_1.CARD_MAX_ROWS} more</text>\n`;
                rowY += 16;
            }
        }
        if (prefs.mode === 'activities' && prefs.showLicenceBadges && links.licences.length > 0) {
            const granted = links.licences.filter(l => constants_1.LICENCE_STATUSES[l.status].inForce).length;
            svg += `    <text x="12" y="${cardHeight - 9}" font-size="9.5" font-weight="600" fill="${theme.typeText}">⚖ ${links.licences.length} licence${links.licences.length === 1 ? '' : 's'} · ${granted} granted</text>\n`;
        }
        svg += `  </g>\n`;
    }
    // 5. Legend
    if (includeLegend) {
        const legY = height - 28;
        const legColor = isDarkBg ? '#a4c2b7' : '#73847c';
        const rule = isDarkBg ? 'rgba(255, 255, 255, 0.12)' : 'rgba(22, 32, 28, 0.1)';
        const kinds = Array.from(new Set(relationships.map(r => r.kind)));
        svg += `  <line x1="48" y1="${height - 50}" x2="${width - 48}" y2="${height - 50}" stroke="${rule}" stroke-width="1"/>\n`;
        svg += `  <text x="48" y="${legY}" font-size="10" font-weight="700" fill="${legColor}" letter-spacing="0.5">LEGEND</text>\n`;
        let lx = 112;
        for (const kind of kinds) {
            const def = constants_1.RELATIONSHIP_KINDS[kind];
            svg += `  <line x1="${lx}" y1="${legY - 3.5}" x2="${lx + 22}" y2="${legY - 3.5}" stroke="${def.color}" stroke-width="1.8" ${def.dash ? `stroke-dasharray="${def.dash}"` : ''}/>\n`;
            svg += `  <text x="${lx + 28}" y="${legY}" font-size="9.5" fill="${legColor}">${(0, geometry_1.escapeHTML)(def.label)}</text>\n`;
            lx += 40 + def.label.length * 5.4;
        }
        if (prefs.mode === 'activities') {
            svg += `  <text x="${lx}" y="${legY}" font-size="9.5" fill="${legColor}">● performs   ○ supports</text>\n`;
        }
        else if (prefs.mode === 'products') {
            svg += `  <text x="${lx}" y="${legY}" font-size="9.5" fill="${legColor}">◆ provider   ◇ dependency</text>\n`;
        }
    }
    svg += `</svg>`;
    return svg;
}
function exportSVG(state, options = {}) {
    const svgStr = generateExportSVG(state, options);
    const filename = getSafeFilename(state.chartTitle, 'svg');
    downloadFile(filename, svgStr, 'image/svg+xml;charset=utf-8');
}
function renderSVGToCanvas(svgStr, scale, callback) {
    if (typeof window === 'undefined')
        return;
    const img = new Image();
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const URLObj = window.URL;
    const blobURL = URLObj.createObjectURL(svgBlob);
    img.onload = () => {
        const width = img.naturalWidth || 1200;
        const height = img.naturalHeight || 800;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0);
        }
        URLObj.revokeObjectURL(blobURL);
        callback(canvas);
    };
    img.onerror = (err) => {
        console.error('Error rasterizing SVG to canvas:', err);
        URLObj.revokeObjectURL(blobURL);
    };
    img.src = blobURL;
}
function exportPNG(state, options = {}) {
    const scale = Number(options.scale) || 2;
    const svgStr = generateExportSVG(state, options);
    const filename = getSafeFilename(state.chartTitle, 'png');
    renderSVGToCanvas(svgStr, scale, (canvas) => {
        canvas.toBlob((blob) => {
            if (blob)
                downloadBlob(blob, filename);
        }, 'image/png');
    });
}
async function copyPNGToClipboard(state, options = {}) {
    const scale = Number(options.scale) || 2;
    const svgStr = generateExportSVG(state, options);
    return new Promise((resolve) => {
        renderSVGToCanvas(svgStr, scale, (canvas) => {
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    resolve(false);
                    return;
                }
                if (typeof navigator !== 'undefined' && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
                    try {
                        await navigator.clipboard.write([
                            new ClipboardItem({ 'image/png': blob })
                        ]);
                        resolve(true);
                        return;
                    }
                    catch (err) {
                        console.warn('Clipboard write blocked, downloading instead:', err);
                    }
                }
                downloadBlob(blob, getSafeFilename(state.chartTitle, 'png'));
                resolve(false);
            }, 'image/png');
        });
    });
}
async function copySVGToClipboard(state, options = {}) {
    const svgStr = generateExportSVG(state, options);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
        try {
            await navigator.clipboard.writeText(svgStr);
            return true;
        }
        catch {
            downloadFile(getSafeFilename(state.chartTitle, 'svg'), svgStr, 'image/svg+xml');
            return false;
        }
    }
    downloadFile(getSafeFilename(state.chartTitle, 'svg'), svgStr, 'image/svg+xml');
    return false;
}
function exportPDF(state, options = {}) {
    if (typeof window === 'undefined')
        return;
    const pdfOptions = { ...options, background: 'white', includeHeader: true, includeLegend: true };
    const svgStr = generateExportSVG(state, pdfOptions);
    const title = (0, geometry_1.escapeHTML)(state.chartTitle || 'Corporate Structure');
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.top = '-9999px';
    printFrame.style.left = '-9999px';
    printFrame.style.width = '100vw';
    printFrame.style.height = '100vh';
    printFrame.style.border = 'none';
    document.body.appendChild(printFrame);
    const doc = printFrame.contentWindow?.document;
    if (!doc)
        return;
    doc.open();
    doc.write(`
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        @page { size: landscape; margin: 8mm; }
        body {
          margin: 0; padding: 0;
          display: flex; align-items: center; justify-content: center;
          background: #ffffff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        svg { width: 100%; height: auto; max-height: 96vh; }
      </style>
    </head>
    <body>
      ${svgStr}
      <script>
        window.onload = () => {
          setTimeout(() => {
            window.focus();
            window.print();
            setTimeout(() => {
              window.parent.document.body.removeChild(window.frameElement);
            }, 1000);
          }, 250);
        };
      <\/script>
    </body>
    </html>
  `);
    doc.close();
}
