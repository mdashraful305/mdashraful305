/**
 * Computes the full path the snake travels across the grid.
 *
 * The traversal is a classic boustrophedon ("as the ox plows") sweep:
 * it walks straight down column 0, moves one step right into column 1,
 * walks straight up column 1, moves right again, and so on. This
 * guarantees two properties that the renderer depends on:
 *
 *   1. Every step moves exactly one grid cell (up/down/left/right),
 *      which keeps the SVG motion smooth and collision-free.
 *   2. Every cell in the grid -- including empty ones -- is visited
 *      exactly once, so every contribution square gets eaten.
 *
 * Note: this is a deterministic, always-valid coverage path. It is
 * simpler than Platane/snk's optimized solver (which uses weighted
 * shortest-path search to minimize travel and prioritize high-value
 * cells first), trading a small amount of visual "cleverness" for a
 * solver that is easy to verify, test, and reason about.
 */
export function computeSnakePath(grid) {
    const path = [];
    for (let x = 0; x < grid.columns; x++) {
        const goingDown = x % 2 === 0;
        const rows = goingDown
            ? Array.from({ length: grid.rows }, (_, i) => i)
            : Array.from({ length: grid.rows }, (_, i) => grid.rows - 1 - i);
        for (const y of rows) {
            path.push({ x, y });
        }
    }
    return path;
}
/**
 * Validates that a path only ever takes unit steps (one cell at a time,
 * horizontally or vertically, never diagonally or jumping). Used by tests
 * and as a runtime safety check before rendering.
 */
export function isValidUnitStepPath(path) {
    for (let i = 1; i < path.length; i++) {
        const prev = path[i - 1];
        const curr = path[i];
        const dx = Math.abs(curr.x - prev.x);
        const dy = Math.abs(curr.y - prev.y);
        const isUnitStep = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
        if (!isUnitStep)
            return false;
    }
    return true;
}
//# sourceMappingURL=snakeSolver.js.map