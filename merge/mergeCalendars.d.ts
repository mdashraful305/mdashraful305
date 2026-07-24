import type { ContributionCalendar } from '../github/types.js';
/** Which account(s) contributed on a given day of the merged calendar. */
export type ContributionSource = 'personal' | 'office' | 'both' | 'none';
/** A single day in the merged, dual-account contribution calendar. */
export interface MergedDay {
    date: string;
    /** Combined contribution count for the day. */
    count: number;
    /** Which account(s) the contributions on this day came from. */
    source: ContributionSource;
    /** Original per-account counts, kept for tooltips / debugging / tests. */
    personalCount: number;
    officeCount: number;
    /** 0-4 relative intensity level recomputed against the merged max. */
    level: 0 | 1 | 2 | 3 | 4;
}
export interface MergedCalendar {
    personalUsername: string;
    officeUsername: string;
    totalContributions: number;
    days: MergedDay[];
}
/**
 * Merges two single-account contribution calendars into one combined
 * calendar, preserving every date present in either source calendar.
 *
 * Merge rules:
 *  - Only account 1 contributed on a date  -> source = "personal"
 *  - Only account 2 contributed on a date  -> source = "office"
 *  - Both accounts contributed on a date   -> source = "both", counts summed
 *  - Neither contributed                   -> source = "none"
 */
export declare function mergeCalendars(personal: ContributionCalendar, office: ContributionCalendar): MergedCalendar;
