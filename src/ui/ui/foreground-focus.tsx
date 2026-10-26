interface ForegroundFocusProps {
    onClick?: () => void;
}

/**
 * A full-screen backdrop overlay with blur and gray tint effect.
 * Used to create focus on foreground elements by dimming the background.
 * 
 * @param {function} [onClick] - Optional click handler for closing the backdrop
 * 
 * @example
 * ```tsx
 * <ForegroundFocus onClick={() => setIsOpen(false)} />
 * ```
 */
export function ForegroundFocus({ onClick }: ForegroundFocusProps) {
    return (
        <div
            className="fixed inset-0 z-40 bg-gray-300 opacity-75 backdrop-blur-md"
            onClick={onClick}
        />
    )
}