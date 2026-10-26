import { createContext, createElement, useContext, useEffect, useState } from 'react'
import type { Context, ReactNode } from 'react'
import { BREAKPOINTS, SIZE } from '../constants'

type ScreenSizeValue = {
    size: number;
}

type ContextProviderProps<TContextValue> = {
    value: TContextValue;
    children?: ReactNode;
    context: Context<TContextValue | null>;
}

type ScreenSizeProviderProps = {
    size: number;
    children: ReactNode;
}

type HeaderBumpProviderProps = {
    headerBump: string;
    children: ReactNode;
}

const screenSizeContext = createContext<ScreenSizeValue | null>(null)
const headerBumpContext = createContext<string | null>(null)

/**
 * Generic context wrapper — mounts `context.Provider` with `value`. Use the specialized
 * `ScreenSizeProvider` and `HeaderBumpProvider` helpers instead of this directly in most cases.
 *
 * @param {TContextValue} value - Value to publish into the context
 * @param {React.ReactNode} children - Components that consume the context
 * @param {Context<TContextValue | null>} context - The context to provide
 *
 * @example
 * ```tsx
 * <ContextProvider value={42} context={myContext}>
 *   <App />
 * </ContextProvider>
 * ```
 */
function ContextProvider<TContextValue>({
    value,
    children,
    context,
}: ContextProviderProps<TContextValue>) {
    return createElement(context.Provider, { value }, children)
}

/**
 * Computes the current screen-size tier (`SIZE.BASE`..`SIZE.XXL`) from `window.innerWidth`,
 * updating on resize. Single shared implementation — mount its result into `ScreenSizeProvider`.
 *
 * @example
 * ```tsx
 * const screenSize = useScreenSize();
 * <ScreenSizeProvider size={screenSize}>
 *   <App />
 * </ScreenSizeProvider>
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
 * <ScreenSizeProvider size={screenSize}>
 *   <App />
 * </ScreenSizeProvider>
 * ```
 */
export function ScreenSizeProvider({ size, children }: ScreenSizeProviderProps) {
    return createElement(ContextProvider<ScreenSizeValue>, {
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
 * <HeaderBumpProvider headerBump="ml-14">
 *   <App />
 * </HeaderBumpProvider>
 * ```
 */
export function HeaderBumpProvider({ headerBump, children }: HeaderBumpProviderProps) {
    return createElement(ContextProvider<string>, {
        value: headerBump,
        context: headerBumpContext,
    }, children)
}

function useContextValue<TValue>(
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
 * Throws if called outside a `ScreenSizeProvider`.
 *
 * @example
 * ```ts
 * const { size } = useScreenSizeCtx(); // 0 = mobile, 1 = sm, 2+ = larger
 * ```
 */
export function useScreenSizeCtx() {
    return useContextValue(screenSizeContext, 'Component requires screen size context')
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
    return useContextValue(headerBumpContext, 'Component requires header bump context', optional, '')
}
