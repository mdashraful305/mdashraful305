/**
 * Computes 0-4 intensity levels for every day using percentile thresholds
 * derived from the calendar's own non-zero counts, rather than a single
 * count/maxCount ratio.
 *
 * A max-relative ratio breaks down badly on real contribution data: a
 * single busy day (e.g. 26 commits pushed at once) becomes the max, and
 * every ordinary day (1-6 contributions) computes a ratio under 0.25 and
 * gets dumped into the same "level 1" bucket -- so 80%+ of active days end
 * up visually identical no matter how the color ramp is tuned. Percentile
 * bucketing instead asks "how does this day compare to other active days,"
 * which spreads levels out across the actual data and keeps a handful of
 * outliers from flattening everything else.
 */
function computeLevels(counts) {
    const nonZeroSorted = counts.filter((c) => c > 0).sort((a, b) => a - b);
    const levelByCount = new Map();
    if (nonZeroSorted.length === 0)
        return levelByCount;
    const percentile = (p) => {
        const index = Math.min(nonZeroSorted.length - 1, Math.floor(p * (nonZeroSorted.length - 1)));
        return nonZeroSorted[index];
    };
    const p25 = percentile(0.25);
    const p50 = percentile(0.5);
    const p75 = percentile(0.75);
    for (const count of counts) {
        if (count <= 0) {
            levelByCount.set(count, 0);
            continue;
        }
        let level;
        if (count <= p25)
            level = 1;
        else if (count <= p50)
            level = 2;
        else if (count <= p75)
            level = 3;
        else
            level = 4;
        levelByCount.set(count, level);
    }
    return levelByCount;
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
export function mergeCalendars(personal, office) {
    const officeByDate = new Map(office.days.map((d) => [d.date, d]));
    const personalByDate = new Map(personal.days.map((d) => [d.date, d]));
    // Union of every date seen in either calendar, so no day is ever dropped.
    const allDates = new Set([...personalByDate.keys(), ...officeByDate.keys()]);
    const sortedDates = [...allDates].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    const rawDays = sortedDates.map((date) => {
        const personalCount = personalByDate.get(date)?.count ?? 0;
        const officeCount = officeByDate.get(date)?.count ?? 0;
        let source;
        if (personalCount > 0 && officeCount > 0) {
            source = 'both';
        }
        else if (personalCount > 0) {
            source = 'personal';
        }
        else if (officeCount > 0) {
            source = 'office';
        }
        else {
            source = 'none';
        }
        return {
            date,
            count: personalCount + officeCount,
            source,
            personalCount,
            officeCount
        };
    });
    const levelByCount = computeLevels(rawDays.map((d) => d.count));
    const days = rawDays.map((d) => ({
        ...d,
        level: levelByCount.get(d.count) ?? 0
    }));
    const totalContributions = days.reduce((sum, d) => sum + d.count, 0);
    return {
        personalUsername: personal.username,
        officeUsername: office.username,
        totalContributions,
        days
    };
}
//# sourceMappingURL=mergeCalendars.js.map