/**
 * Lays merged contribution days out onto a GitHub-style grid: each column is
 * a week, each row is a day-of-week (0 = Sunday .. 6 = Saturday). The first
 * calendar day is placed according to its actual weekday so the grid lines
 * up the same way GitHub's own contribution graph does.
 */
export function buildContributionGrid(days) {
    if (days.length === 0) {
        return { cells: [], columns: 0, rows: 7 };
    }
    const firstDate = new Date(`${days[0].date}T00:00:00Z`);
    const firstWeekday = firstDate.getUTCDay(); // 0 = Sunday
    const cells = days.map((day, index) => {
        const offset = firstWeekday + index;
        const x = Math.floor(offset / 7);
        const y = offset % 7;
        return { x, y, day };
    });
    const columns = Math.max(...cells.map((c) => c.x)) + 1;
    return { cells, columns, rows: 7 };
}
//# sourceMappingURL=grid.js.map