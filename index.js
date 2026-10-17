#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { loadConfig, defaultDateRange } from './config/config.js';
import { logger } from './config/logger.js';
import { fetchDualContributionCalendars } from './github/graphqlClient.js';
import { mergeCalendars } from './merge/mergeCalendars.js';
import { buildContributionGrid } from './svg/grid.js';
import { renderSnakeSvg } from './svg/svgRenderer.js';
/** A slightly darker palette used automatically for the "dark" output variant. */
function darkenPaletteBackground(palette) {
    return { ...palette, empty: '#0d1117' };
}
function writeSvg(path, svg) {
    const absolute = resolve(path);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, svg, 'utf8');
    logger.info(`Wrote SVG to ${absolute}`);
}
async function main() {
    const argv = (await yargs(hideBin(process.argv))
        .option('config', {
        type: 'string',
        default: 'github-snake.config.yml',
        describe: 'Path to the YAML config file'
    })
        .help()
        .parseAsync());
    logger.info(`Loading config from ${argv.config}`);
    const config = loadConfig(argv.config);
    const range = config.dateRange ?? defaultDateRange();
    const [personalCalendar, officeCalendar] = await fetchDualContributionCalendars({ username: config.username1, token: config.token1 }, { username: config.username2, token: config.token2 }, range);
    const merged = mergeCalendars(personalCalendar, officeCalendar);
    logger.info(`Merged calendar: ${merged.days.length} days, ${merged.totalContributions} total contributions ` +
        `(${merged.personalUsername} + ${merged.officeUsername})`);
    const grid = buildContributionGrid(merged.days);
    if (config.output.light) {
        const svg = renderSnakeSvg(grid, {
            palette: config.palette,
            stepDuration: config.animation.stepDuration,
            loop: config.animation.loop
        });
        writeSvg(config.output.light, svg);
    }
    if (config.output.dark) {
        const svg = renderSnakeSvg(grid, {
            palette: darkenPaletteBackground(config.palette),
            stepDuration: config.animation.stepDuration,
            loop: config.animation.loop
        });
        writeSvg(config.output.dark, svg);
    }
    logger.info('Done.');
}
main().catch((error) => {
    logger.error('Fatal error while generating the dual contribution snake', error);
    process.exitCode = 1;
});
//# sourceMappingURL=index.js.map