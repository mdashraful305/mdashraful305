/**
 * Shared type definitions for GitHub contribution calendar data.
 */
/** A single day of contributions as returned by the GitHub GraphQL API. */
export interface ContributionDay {
    /** ISO-8601 date string, e.g. "2026-06-01". */
    date: string;
    /** Number of contributions made on this date. */
    count: number;
    /** GitHub's 0-4 relative intensity level for this date. */
    level: 0 | 1 | 2 | 3 | 4;
}
/** A full contribution calendar for a single GitHub account. */
export interface ContributionCalendar {
    /** The GitHub login this calendar belongs to. */
    username: string;
    /** Total number of contributions across the whole range. */
    totalContributions: number;
    /** Every day in the requested range, in chronological order. */
    days: ContributionDay[];
}
/** Inclusive date range used to query contributions. */
export interface DateRange {
    /** ISO-8601 start date, inclusive. */
    from: string;
    /** ISO-8601 end date, inclusive. */
    to: string;
}
