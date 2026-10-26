export const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

/**
 * Named, ordered screen-size tiers. Backed by plain numbers, so every existing
 * `<`/`<=`/`>`/`>=` comparison against `size` keeps working unchanged — this just
 * gives the magic numbers a readable name instead of introducing new comparison logic.
 *
 * @example
 * ```ts
 * const { size } = useScreenSizeCtx();
 * if (size < SIZE.SM) { ... } // below sm breakpoint
 * ```
 */
export const SIZE = {
    BASE: 0,
    SM: 1,
    MD: 2,
    LG: 3,
    XL: 4,
    XXL: 5,
} as const;
