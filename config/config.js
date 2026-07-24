import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import yaml from 'js-yaml';
const DEFAULT_PALETTE = {
    personal: '#39d353',
    office: '#58a6ff',
    both: '#a371f7',
    empty: '#161b22',
    snake: '#ffffff',
    snakeAccent: '#0d1117'
};
/** Resolves `${ENV_VAR}` style placeholders in a string against process.env. */
function resolveEnvPlaceholders(value) {
    return value.replace(/\$\{([A-Z0-9_]+)\}/gi, (_match, name) => {
        const resolved = process.env[name];
        if (resolved === undefined) {
            throw new Error(`Environment variable "${name}" referenced in config was not found.`);
        }
        return resolved;
    });
}
/**
 * A token value in the config file may be either a literal token, an
 * `${ENV_VAR}` placeholder, or the bare name of an environment variable
 * (as shown in the task's example config). This helper supports all three
 * so the config file never has to contain a raw secret in CI.
 */
function resolveToken(rawValue, envFallbackName) {
    if (!rawValue) {
        return process.env[envFallbackName] ?? '';
    }
    if (rawValue.includes('${')) {
        return resolveEnvPlaceholders(rawValue);
    }
    // If the raw value exactly matches the name of an existing env var
    // (e.g. `token1: PERSONAL_TOKEN`), treat it as a reference rather than
    // a literal secret, matching the example config in the spec.
    if (/^[A-Z0-9_]+$/.test(rawValue) && process.env[rawValue] !== undefined) {
        return process.env[rawValue];
    }
    return rawValue;
}
function assertString(value, field) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`Config field "${field}" must be a non-empty string.`);
    }
    return value;
}
/** Loads and validates the YAML configuration file at the given path. */
export function loadConfig(configPath) {
    const absolutePath = resolve(configPath);
    let raw;
    try {
        const fileContents = readFileSync(absolutePath, 'utf8');
        raw = yaml.load(fileContents) ?? {};
    }
    catch (error) {
        throw new Error(`Failed to read config file at "${absolutePath}": ${error instanceof Error ? error.message : String(error)}`);
    }
    const username1 = assertString(raw.username1, 'username1');
    const username2 = assertString(raw.username2, 'username2');
    const token1 = resolveToken(raw.token1, 'PERSONAL_TOKEN');
    const token2 = resolveToken(raw.token2, 'OFFICE_TOKEN');
    if (!token1) {
        throw new Error('No token resolved for username1. Set token1 in the config or the PERSONAL_TOKEN env var.');
    }
    if (!token2) {
        throw new Error('No token resolved for username2. Set token2 in the config or the OFFICE_TOKEN env var.');
    }
    const palette = { ...DEFAULT_PALETTE, ...(raw.palette ?? {}) };
    const output = raw.output ?? { light: 'dist/github-snake.svg' };
    if (!output.light && !output.dark) {
        throw new Error('Config "output" must define at least one of "light" or "dark".');
    }
    const dateRange = raw.dateRange?.from && raw.dateRange?.to
        ? { from: raw.dateRange.from, to: raw.dateRange.to }
        : undefined;
    const animation = {
        stepDuration: raw.animation?.stepDuration ?? 0.08,
        loop: raw.animation?.loop ?? true
    };
    return {
        username1,
        token1,
        username2,
        token2,
        palette,
        output,
        dateRange,
        animation
    };
}
/** Computes a default 365-day date range ending today, in UTC. */
export function defaultDateRange() {
    const to = new Date();
    const from = new Date(to);
    from.setUTCDate(from.getUTCDate() - 365);
    return {
        from: from.toISOString().slice(0, 10),
        to: to.toISOString().slice(0, 10)
    };
}
//# sourceMappingURL=config.js.map