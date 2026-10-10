import { GraphQLClient, gql } from 'graphql-request';
import { logger } from '../config/logger.js';
const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';
const CONTRIBUTIONS_QUERY = gql `
  query ContributionsForUser($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;
/** Maps GitHub's textual contribution level to the numeric 0-4 scale used internally. */
function levelToNumber(level) {
    switch (level) {
        case 'NONE':
            return 0;
        case 'FIRST_QUARTILE':
            return 1;
        case 'SECOND_QUARTILE':
            return 2;
        case 'THIRD_QUARTILE':
            return 3;
        case 'FOURTH_QUARTILE':
            return 4;
        default:
            return 0;
    }
}
/**
 * Fetches a single GitHub user's contribution calendar for a given date range,
 * using a dedicated personal access token for authentication.
 *
 * @param username GitHub login to fetch contributions for.
 * @param token GitHub Personal Access Token with `read:user` scope.
 * @param range Inclusive date range to query. GitHub caps a single query at 1 year.
 */
export async function fetchContributionCalendar(username, token, range) {
    if (!token) {
        throw new Error(`Missing GitHub token for user "${username}". Set it in your config or env.`);
    }
    const client = new GraphQLClient(GITHUB_GRAPHQL_ENDPOINT, {
        headers: {
            Authorization: `Bearer ${token}`,
            'User-Agent': 'github-dual-snake'
        }
    });
    logger.info(`Fetching contributions for "${username}" (${range.from} -> ${range.to})`);
    let response;
    try {
        response = await client.request(CONTRIBUTIONS_QUERY, {
            login: username,
            from: new Date(range.from).toISOString(),
            to: new Date(range.to).toISOString()
        });
    }
    catch (error) {
        throw new Error(`Failed to fetch contributions for "${username}": ${error instanceof Error ? error.message : String(error)}`);
    }
    if (!response.user) {
        throw new Error(`GitHub user "${username}" was not found or the token lacks access.`);
    }
    const calendar = response.user.contributionsCollection.contributionCalendar;
    const days = calendar.weeks.flatMap((week) => week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: levelToNumber(day.contributionLevel)
    })));
    logger.info(`Fetched ${days.length} days (${calendar.totalContributions} total) for "${username}"`);
    return {
        username,
        totalContributions: calendar.totalContributions,
        days
    };
}
/**
 * Fetches contribution calendars for two GitHub accounts in parallel.
 */
export async function fetchDualContributionCalendars(account1, account2, range) {
    return Promise.all([
        fetchContributionCalendar(account1.username, account1.token, range),
        fetchContributionCalendar(account2.username, account2.token, range)
    ]);
}
//# sourceMappingURL=graphqlClient.js.map