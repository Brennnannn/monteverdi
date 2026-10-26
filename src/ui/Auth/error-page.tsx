import { Button, Card } from '@ui';
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

interface ErrorPageProps {
    error: string;
    link: string;
}

/**
 * Renders a centered error page with a message and a return button.
 * Displays the error text inside a styled card with a home icon link back to `link`.
 *
 * @param {string} error - The error message to display
 * @param {string} link - The URL path the return button navigates to
 *
 * @example
 * ```tsx
 * <ErrorPage error="Page not found" link="/" />
 * ```
 */
export function ErrorPage({ error, link }: ErrorPageProps) {
    return (
        <div className="flex items-center justify-center w-full">
            <Card className="flex flex-col items-center gap-2 p-4">
                <h1 className="text-lg text-error p-1 border border-error rounded-md">Oops!</h1>
                <p>{error}</p>
                <Link to={link}>
                    <Button>
                        <Home className="h-4 w-4 mr-1" />
                        Return
                    </Button>
                </Link>
            </Card>
        </div>
    )
}