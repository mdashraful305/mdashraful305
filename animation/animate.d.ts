import type { GridPoint } from '../snake/snakeSolver.js';
/** A single animated segment of the snake's body, expressed as SMIL keyframes. */
export interface SnakeSegmentKeyframes {
    /** x-values (in cell units) for each keyTime, in order. */
    xValues: number[];
    /** y-values (in cell units) for each keyTime, in order. */
    yValues: number[];
    /** Normalized [0,1] keyTimes, one per value, monotonically increasing. */
    keyTimes: number[];
    /** Total animation duration in seconds for this segment. */
    durationSeconds: number;
}
export interface SnakeAnimation {
    /** One set of keyframes per body segment, head first. */
    segments: SnakeSegmentKeyframes[];
    /** Total loop duration in seconds. */
    totalDurationSeconds: number;
    /** Frame at which each grid cell (by index in path) is first reached, used to time cell "eaten" fades. */
    cellArrivalTime: number[];
}
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
export declare function buildSnakeAnimation(path: GridPoint[], bodyLength: number, stepDuration: number): SnakeAnimation;
