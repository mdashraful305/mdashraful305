/**
 * Minimal structured logger. Kept dependency-free so the CLI has no
 * unnecessary runtime footprint. Respects the LOG_LEVEL env var
 * ("debug" | "info" | "warn" | "error"), defaulting to "info".
 */
const LEVEL_WEIGHT = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40
};
function currentLevel() {
    const fromEnv = process.env.LOG_LEVEL;
    return fromEnv && fromEnv in LEVEL_WEIGHT ? fromEnv : 'info';
}
function shouldLog(level) {
    return LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[currentLevel()];
}
function format(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
}
export const logger = {
    debug(message) {
        if (shouldLog('debug'))
            console.debug(format('debug', message));
    },
    info(message) {
        if (shouldLog('info'))
            console.info(format('info', message));
    },
    warn(message) {
        if (shouldLog('warn'))
            console.warn(format('warn', message));
    },
    error(message, error) {
        if (shouldLog('error')) {
            console.error(format('error', message));
            if (error instanceof Error) {
                console.error(error.stack ?? error.message);
            }
            else if (error !== undefined) {
                console.error(error);
            }
        }
    }
};
//# sourceMappingURL=logger.js.map