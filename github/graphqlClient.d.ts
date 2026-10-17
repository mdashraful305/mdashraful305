import type { ContributionCalendar, DateRange } from './types.js';
/**
 * Fetches a single GitHub user's contribution calendar for a given date range,
 * using a dedicated personal access token for authentication.
 *
 * @param username GitHub login to fetch contributions for.
 * @param token GitHub Personal Access Token with `read:user` scope.
 * @param range Inclusive date range to query. GitHub caps a single query at 1 year.
 */
export declare function fetchContributionCalendar(username: string, token: string, range: DateRange): Promise<ContributionCalendar>;
/**
 * Fetches contribution calendars for two GitHub accounts in parallel.
 */
export declare function fetchDualContributionCalendars(account1: {
    username: string;
    token: string;
}, account2: {
    username: string;
    token: string;
}, range: DateRange): Promise<[ContributionCalendar, ContributionCalendar]>;
