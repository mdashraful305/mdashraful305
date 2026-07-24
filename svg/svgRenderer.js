// ── Grid cell metrics ─────────────────────────────────────────────────────────
const CELL_SIZE = 11;
const CELL_GAP = 3;
const CELL_PITCH = CELL_SIZE + CELL_GAP; // 14 px per step
const CELL_RADIUS = 2;
// ── Layout ───────────────────────────────────────────────────────────────────
const CARD_PAD_H = 16; // left / right card padding
const CARD_PAD_V = 14; // top / bottom card padding
const MONTH_H = 20; // height above grid reserved for month-name labels
const WDAY_W = 30; // width to the left of grid for Mon/Wed/Fri labels
const LEGEND_GAP = 14; // gap between grid bottom and legend rows
const LEGEND_H = 72; // total legend section height (three rows)
/** Top-left corner of the contribution grid within the SVG coordinate space. */
const GRID_X = CARD_PAD_H + WDAY_W;
const GRID_Y = CARD_PAD_V + MONTH_H;
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** Weekday rows to annotate: 1 = Mon, 3 = Wed, 5 = Fri. */
const WEEKDAY_ROWS = [
    { row: 1, text: 'Mon' },
    { row: 3, text: 'Wed' },
    { row: 5, text: 'Fri' },
];
// ── Colour helpers ────────────────────────────────────────────────────────────
/** Colors used for each of the 4 GitHub-style intensity levels, per source. */
function colorForCell(source, level, palette) {
    if (source === 'none' || level === 0)
        return palette.empty;
    const base = source === 'both' ? palette.both
        : source === 'office' ? palette.office
            : palette.personal;
    return mixColor(base, palette.empty, [0.5, 0.7, 0.85, 1][level - 1] ?? 1);
}
/** Linearly interpolates two hex colours; `ratio` = 1 returns `foreground`. */
function mixColor(foreground, background, ratio) {
    const fg = hexToRgb(foreground);
    const bg = hexToRgb(background);
    const r = Math.round(bg.r + (fg.r - bg.r) * ratio);
    const g = Math.round(bg.g + (fg.g - bg.g) * ratio);
    const b = Math.round(bg.b + (fg.b - bg.b) * ratio);
    return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}
function hexToRgb(hex) {
    const n = hex.replace('#', '');
    const v = n.length === 3 ? n.split('').map((c) => c + c).join('') : n;
    const x = parseInt(v, 16);
    return { r: (x >> 16) & 255, g: (x >> 8) & 255, b: x & 255 };
}
/** Perceived luminance (0–255). Values below ~100 are considered "dark". */
function luminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    return 0.299 * r + 0.587 * g + 0.114 * b;
}
function escapeXml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
/**
 * Renders the merged contribution grid as a static, self-contained SVG.
 *
 * Output includes:
 *   • Rounded card background (auto dark / light from palette).
 *   • Month-name labels above each calendar-month column boundary.
 *   • Weekday labels (Mon / Wed / Fri) along the left edge.
 *   • Fully static contribution cells — no animation, no snake.
 *   • Three-row colour legend: source swatches + personal + office intensity ramps.
 */
export function renderSnakeSvg(grid, options) {
    const p = options.palette;
    // ── Theme detection ─────────────────────────────────────────────────────────
    const dark = luminance(p.empty) < 100;
    const cardBg = dark ? '#161b22' : '#ffffff';
    const cardBorder = dark ? '#30363d' : '#d0d7de';
    const labelColor = dark ? '#8b949e' : '#57606a';
    const swatchStroke = dark ? '#484f58' : '#d0d7de';
    // ── Dimensions ──────────────────────────────────────────────────────────────
    const gridW = grid.columns * CELL_PITCH;
    const gridH = 7 * CELL_PITCH;
    const svgW = CARD_PAD_H + WDAY_W + gridW + CARD_PAD_H;
    const svgH = CARD_PAD_V + MONTH_H + gridH + LEGEND_GAP + LEGEND_H + CARD_PAD_V;
    // ── Month-name labels ────────────────────────────────────────────────────────
    const monthFirstCol = new Map();
    for (const cell of grid.cells) {
        const ym = cell.day.date.slice(0, 7);
        const cur = monthFirstCol.get(ym);
        if (cur === undefined || cell.x < cur)
            monthFirstCol.set(ym, cell.x);
    }
    const monthLabelEls = [...monthFirstCol.entries()]
        .sort((a, b) => a[1] - b[1])
        .map(([ym, col]) => {
        const month = MONTHS_SHORT[(parseInt(ym.slice(5, 7), 10) - 1) % 12] ?? '';
        const lx = GRID_X + col * CELL_PITCH;
        const ly = CARD_PAD_V + MONTH_H - 6;
        return `<text x="${lx}" y="${ly}" font-size="10" fill="${labelColor}" font-family="sans-serif">${month}</text>`;
    })
        .join('\n  ');
    // ── Weekday labels ───────────────────────────────────────────────────────────
    const weekdayLabelEls = WEEKDAY_ROWS.map(({ row, text }) => {
        const ly = GRID_Y + row * CELL_PITCH + Math.round(CELL_SIZE / 2) + 3;
        return `<text x="${GRID_X - 4}" y="${ly}" font-size="9" fill="${labelColor}" text-anchor="end" font-family="sans-serif">${text}</text>`;
    }).join('\n  ');
    // ── Contribution cells (static — no animation) ───────────────────────────────
    const cellRects = grid.cells
        .map((cell) => {
        const color = colorForCell(cell.day.source, cell.day.level, p);
        const cx = GRID_X + cell.x * CELL_PITCH;
        const cy = GRID_Y + cell.y * CELL_PITCH;
        const title = `${escapeXml(cell.day.date)}: ${cell.day.count} contribution(s) (${cell.day.source})`;
        return [
            `<rect x="${cx}" y="${cy}" width="${CELL_SIZE}" height="${CELL_SIZE}" rx="${CELL_RADIUS}" ry="${CELL_RADIUS}" fill="${color}">`,
            `<title>${title}</title>`,
            `</rect>`,
        ].join('');
    })
        .join('\n    ');
    // ── Legend ───────────────────────────────────────────────────────────────────
    // Row 1: source-colour swatches (Personal / Office / Both / None)
    // Row 2: personal (green)  Less ▢▢▢▢ More
    // Row 3: office   (blue)   Less ▢▢▢▢ More
    const legendY = GRID_Y + gridH + LEGEND_GAP;
    const row2Y = legendY + CELL_SIZE + 10;
    const row3Y = row2Y + CELL_SIZE + 8;
    const sourceItems = [
        { color: p.personal, label: 'Personal' },
        { color: p.office, label: 'Office' },
        { color: p.both, label: 'Both' },
        { color: p.empty, label: 'None' },
    ];
    let cx = GRID_X;
    const sourceEls = sourceItems.map(({ color, label }) => {
        const sx = cx;
        const lx = sx + CELL_SIZE + 4;
        cx += CELL_SIZE + 4 + label.length * 6 + 12;
        return [
            `<rect x="${sx}" y="${legendY}" width="${CELL_SIZE}" height="${CELL_SIZE}" rx="2" fill="${color}" stroke="${swatchStroke}" stroke-width="0.6"/>`,
            `<text x="${lx}" y="${legendY + CELL_SIZE - 1}" font-size="9" fill="${labelColor}" font-family="sans-serif">${label}</text>`,
        ].join('');
    }).join('');
    const personalIntensity = [1, 2, 3, 4].map((lvl) => mixColor(p.personal, p.empty, [0.5, 0.7, 0.85, 1][lvl - 1] ?? 1));
    const officeIntensity = [1, 2, 3, 4].map((lvl) => mixColor(p.office, p.empty, [0.5, 0.7, 0.85, 1][lvl - 1] ?? 1));
    function intensityRow(colors, y, rowLabel) {
        const labelEl = `<text x="${GRID_X}" y="${y + CELL_SIZE - 1}" font-size="9" fill="${labelColor}" font-family="sans-serif">${rowLabel}</text>`;
        const lessEl = `<text x="${GRID_X + rowLabel.length * 5 + 4}" y="${y + CELL_SIZE - 1}" font-size="9" fill="${labelColor}" font-family="sans-serif">Less</text>`;
        let swatchX = GRID_X + rowLabel.length * 5 + 4 + 26;
        const swatchEls = colors.map((color) => {
            const sx = swatchX;
            swatchX += CELL_SIZE + 3;
            return `<rect x="${sx}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" rx="2" fill="${color}" stroke="${swatchStroke}" stroke-width="0.6"/>`;
        }).join('');
        const moreEl = `<text x="${swatchX + 3}" y="${y + CELL_SIZE - 1}" font-size="9" fill="${labelColor}" font-family="sans-serif">More</text>`;
        return labelEl + lessEl + swatchEls + moreEl;
    }
    const legendEls = [
        sourceEls,
        intensityRow(personalIntensity, row2Y, 'Personal:'),
        intensityRow(officeIntensity, row3Y, 'Office:  '),
    ].join('\n  ');
    // ── Assemble ─────────────────────────────────────────────────────────────────
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}" font-family="sans-serif">
  <desc>Merged dual-account GitHub contribution grid.</desc>
  <rect width="${svgW}" height="${svgH}" rx="8" ry="8" fill="${cardBg}" stroke="${cardBorder}" stroke-width="1"/>
  <g id="month-labels">
  ${monthLabelEls}
  </g>
  <g id="weekday-labels">
  ${weekdayLabelEls}
  </g>
  <g id="grid">
    ${cellRects}
  </g>
  <g id="legend">
  ${legendEls}
  </g>
</svg>
`;
}
//# sourceMappingURL=svgRenderer.js.map