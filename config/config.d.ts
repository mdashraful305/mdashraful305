/** Color palette used to render the merged contribution grid and snake. */
export interface Palette {
    personal: string;
    office: string;
    both: string;
    empty: string;
    /** Optional snake body color; defaults to a neutral dark tone if omitted. */
    snake?: string;
    /** Optional dot/outline color for the snake's eyes; purely cosmetic. */
    snakeAccent?: string;
}
/** Output SVG file paths. At least one of `light` / `dark` must be set. */
export interface OutputConfig {
    light?: string;
    dark?: string;
}
/** Fully parsed and validated application configuration. */
export interface AppConfig {
    username1: string;
    token1: string;
    username2: string;
    token2: string;
    palette: Palette;
    output: OutputConfig;
    /** Optional explicit date range; defaults to the last 365 days. */
    dateRange?: {
        from: string;
        to: string;
    };
    /** Animation tuning options. */
    animation: {
        /** Duration in seconds for the snake to cross one cell. Default 0.08. */
        stepDuration: number;
        /** Whether the animation should loop indefinitely. Default true. */
        loop: boolean;
    };
}
/** Loads and validates the YAML configuration file at the given path. */
export declare function loadConfig(configPath: string): AppConfig;
/** Computes a default 365-day date range ending today, in UTC. */
export declare function defaultDateRange(): {
    from: string;
    to: string;
};
