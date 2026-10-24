/**
 * Builds SMIL-ready keyframe data for an animated snake of a given body
 * length following `path`. Each body segment lags behind the head by one
 * step, so segment `i` replays the head's keyframes shifted later in time
 * by `i` steps.
 *
 * @param path Sequence of grid points the snake's head visits, in order.
 * @param bodyLength Number of visible circles/segments making up the snake.
 * @param stepDuration Seconds it takes to move one grid cell.
 */
export function buildSnakeAnimation(path, bodyLength, stepDuration) {
    if (path.length === 0) {
        return { segments: [], totalDurationSeconds: 0, cellArrivalTime: [] };
    }
    // Pad the front of the path with repeated first points so every segment
    // has a defined position from t=0, even before the head has moved far
    // enough for the tail segments to "exist" on the real path.
    const padding = Array.from({ length: bodyLength - 1 }, () => path[0]);
    const paddedPath = [...padding, ...path];
    const totalSteps = paddedPath.length - 1;
    const totalDurationSeconds = totalSteps * stepDuration;
    const segments = [];
    for (let segmentIndex = 0; segmentIndex < bodyLength; segmentIndex++) {
        // Segment 0 is the head and reads the path directly; each subsequent
        // segment reads the same path delayed by `segmentIndex` steps, i.e. it
        // trails behind by that many cells.
        const offsetPath = paddedPath.slice(0, paddedPath.length - segmentIndex);
        // Pad the tail so all segments share the same array length / keyTimes.
        const trailingPad = Array.from({ length: paddedPath.length - offsetPath.length }, () => offsetPath[0]);
        const fullOffsetPath = [...trailingPad, ...offsetPath];
        const xValues = fullOffsetPath.map((p) => p.x);
        const yValues = fullOffsetPath.map((p) => p.y);
        const keyTimes = fullOffsetPath.map((_, i) => i / (fullOffsetPath.length - 1 || 1));
        segments.push({ xValues, yValues, keyTimes, durationSeconds: totalDurationSeconds });
    }
    // First arrival time (in seconds) of the head at each real path index,
    // used by the SVG renderer to time each cell's "eaten" opacity fade.
    const cellArrivalTime = path.map((_, index) => (index + padding.length) * stepDuration);
    return { segments, totalDurationSeconds, cellArrivalTime };
}
//# sourceMappingURL=animate.js.map