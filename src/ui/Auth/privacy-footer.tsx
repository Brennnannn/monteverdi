const PRIVACY_URL = "https://pwnesfoisberxdeovfez.supabase.co/storage/v1/object/public/documents/BEAR_Privacy_Policy.pdf";

/**
 * Renders a footer component displaying the company name and a link to the privacy policy.
 * The footer is positioned at the bottom of the page with muted text styling.
 *
 * @example
 * ```tsx
 * <PrivacyFooter />
 * ```
 */
export function PrivacyFooter() {
    return (
        <footer
            className="w-full text-center py-3 text-text-muted"
            style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                zIndex: 10,
            }}
            data-testid="site-footer"
        >
            BEAR ltd. |{' '}
            <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="underline">
                Privacy Policy
            </a>
        </footer>
    );
}