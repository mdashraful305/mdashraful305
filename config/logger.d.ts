/**
 * Minimal structured logger. Kept dependency-free so the CLI has no
 * unnecessary runtime footprint. Respects the LOG_LEVEL env var
 * ("debug" | "info" | "warn" | "error"), defaulting to "info".
 */
export declare const logger: {
    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string, error?: unknown): void;
};
