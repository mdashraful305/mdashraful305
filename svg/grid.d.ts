import type { MergedDay } from '../merge/mergeCalendars.js';
/** A cell in the rendered grid, positioned by (week column, weekday row). */
export interface GridCell {
    x: number;
    y: number;
    day: MergedDay;
}
export interface ContributionGrid {
    cells: GridCell[];
    /** Number of week columns in the grid. */
    columns: number;
    /** Always 7 (Sunday..Saturday), kept explicit for clarity in consumers. */
    rows: number;
}
/**
 * Lays merged contribution days out onto a GitHub-style grid: each column is
 * a week, each row is a day-of-week (0 = Sunday .. 6 = Saturday). The first
 * calendar day is placed according to its actual weekday so the grid lines
 * up the same way GitHub's own contribution graph does.
 */
export declare function buildContributionGrid(days: MergedDay[]): ContributionGrid;
