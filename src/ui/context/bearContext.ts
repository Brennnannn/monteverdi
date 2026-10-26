import { createContext, createElement, useContext, useEffect, useState } from 'react'
import type { Context, ReactNode } from 'react'
import { BREAKPOINTS, SIZE } from '../constants'

type ScreenSizeValue = {
    size: number;
}

type BearProviderProps<TContextValue> = {
    value: TContextValue;
    children?: ReactNode;
    context: Context<TContextValue | null>;
}

type BearSizeProviderProps = {
    size: number;
    children: ReactNode;
}

type BearHeaderBumpProviderProps = {
    headerBump: string;
    children: ReactNode;
}

const screenSizeContext = createContext<ScreenSizeValue | null>(null)
const headerBumpContext = createContext<string | null>(null)

/**
 * Generic context wrapper — mounts `context.Provider` with `value`. Use the specialized
 * `BearSizeProvider` and `BearHeaderBumpProvider` helpers instead of this directly in most cases.
 *
 * @param {TContextValue} value - Value to publish into the context
 * @param {React.ReactNode} children - Components that consume the context
 * @param {Context<TContextValue | null>} context - The context to provide
 *
 * @example
 * ```tsx
 * <BearProvider value={42} context={myContext}>
 *   <App />
 * </BearProvider>
 * ```
 */
function BearProvider<TContextValue>({
    value,
    children,
    context,
}: BearProviderProps<TContextValue>) {
    return createElement(context.Provider, { value }, children)
}

/**
 * Computes the current screen-size tier (`SIZE.BASE`..`SIZE.XXL`) from `window.innerWidth`,
 * updating on resize. Single shared implementation — mount its result into `BearSizeProvider`.
 *
 * @example
 * ```tsx
 * const screenSize = useScreenSize();
 * <BearSizeProvider size={screenSize}>
 *   <App />
 * </BearSizeProvider>
 * ```
 */
export function useScreenSize(): number {
    const [size, setSize] = useState<number>(SIZE.XXL)

    useEffect(() => {
        function handleResize() {
            const width = window.innerWidth
            if (width < BREAKPOINTS.sm) setSize(SIZE.BASE)
            else if (width < BREAKPOINTS.md) setSize(SIZE.SM)
            else if (width < BREAKPOINTS.lg) setSize(SIZE.MD)
            else if (width < BREAKPOINTS.xl) setSize(SIZE.LG)
            else if (width < BREAKPOINTS['2xl']) setSize(SIZE.XL)
            else setSize(SIZE.XXL)
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return size
}

/**
 * Publishes the current screen size breakpoint as `{ size: number }` to `useScreenSizeCtx()` consumers.
 *
 * @param {number} size - Breakpoint value (0 = mobile, 1 = sm, 2 = md, etc.)
 * @param {React.ReactNode} children - Components that call `useScreenSizeCtx()`
 *
 * @example
 * ```tsx
 * <BearSizeProvider size={screenSize}>
 *   <App />
 * </BearSizeProvider>
 * ```
 */
export function BearSizeProvider({ size, children }: BearSizeProviderProps) {
    return createElement(BearProvider<ScreenSizeValue>, {
        value: { size },
        context: screenSizeContext,
    }, children)
}

/**
 * Publishes a CSS margin class string (e.g. `"ml-14"`) used to offset content below a fixed header.
 * Consumed by `useHeaderBumpCtx()`.
 *
 * @param {string} headerBump - Tailwind margin class to apply below the fixed header (e.g. `"ml-14"`)
 * @param {React.ReactNode} children - Components that call `useHeaderBumpCtx()`
 *
 * @example
 * ```tsx
 * <BearHeaderBumpProvider headerBump="ml-14">
 *   <App />
 * </BearHeaderBumpProvider>
 * ```
 */
export function BearHeaderBumpProvider({ headerBump, children }: BearHeaderBumpProviderProps) {
    return createElement(BearProvider<string>, {
        value: headerBump,
        context: headerBumpContext,
    }, children)
}

function useBearCtx<TValue>(
    context: Context<TValue | null>,
    errorMessage: string,
    optional = false,
    fallbackValue?: TValue,
) {
    const value = useContext(context)

    if (value === null) {
        if (optional) {
            return fallbackValue as TValue
        }

        throw new Error(errorMessage)
    }

    return value
}

/**
 * Returns the current screen size as `{ size: number }` from context.
 * Throws if called outside a `BearSizeProvider`.
 *
 * @example
 * ```ts
 * const { size } = useScreenSizeCtx(); // 0 = mobile, 1 = sm, 2+ = larger
 * ```
 */
export function useScreenSizeCtx() {
    return useBearCtx(screenSizeContext, 'Component requires screen size context')
}

/**
 * Returns the header bump margin class string from context (e.g. `"ml-14"`).
 * Pass `optional = true` to return `""` instead of throwing when no provider is present.
 *
 * @param {boolean} [optional=false] - When true, returns `""` instead of throwing outside a provider
 *
 * @example
 * ```ts
 * const bump = useHeaderBumpCtx(true); // "" if no provider
 * ```
 */
export function useHeaderBumpCtx(optional = false) {
    return useBearCtx(headerBumpContext, 'Component requires header bump context', optional, '')
}
