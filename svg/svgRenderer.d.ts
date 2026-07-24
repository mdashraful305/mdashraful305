import type { Palette } from '../config/config.js';
import type { ContributionGrid } from './grid.js';
export interface RenderOptions {
    palette: Palette;
    /** Unused — kept for API compatibility. */
    stepDuration: number;
    /** Unused — kept for API compatibility. */
    loop: boolean;
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
export declare function renderSnakeSvg(grid: ContributionGrid, options: RenderOptions): string;
