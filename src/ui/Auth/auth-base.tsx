import { Link } from "react-router-dom";
import { PrivacyFooter } from "./privacy-footer";
import { TextLogoSVG, Card } from '@ui';

interface AuthBaseProps {
    children: React.ReactNode;
    title?: string;
    error?: string;
    forgotPassword?: boolean;
    signUp?: boolean;
    signIn?: boolean;
}

/**
 * Renders the shared layout shell for all authentication pages.
 * Displays the app logo, a card containing children and optional title,
 * navigation links for sign-in / sign-up / forgot-password, and an optional error message.
 *
 * @param {React.ReactNode} children - Form content rendered inside the card
 * @param {string} [title] - Optional heading shown at the top of the card
 * @param {string} [error] - Optional error message rendered below the card in error color
 * @param {boolean} [forgotPassword=true] - Whether to render the forgot-password link
 * @param {boolean} [signUp=true] - Whether to render the sign-up link
 * @param {boolean} [signIn=true] - Whether to render the sign-in link
 *
 * @example
 * ```tsx
 * <AuthBase title="Sign In" error={errorMsg} forgotPassword signUp={false}>
 *   <MyForm />
 * </AuthBase>
 * ```
 */
export function AuthBase({
    children,
    title,
    error,
    forgotPassword = true,
    signUp = true,
    signIn = true
}: AuthBaseProps) {
    const links = [
        forgotPassword ? { to: "/forgot-password", text: "Forgot password" } : null,
        signUp ? { to: "/sign-up", text: "Sign up" } : null,
        signIn ? { to: "/sign-in", text: "Sign in" } : null,
    ].filter((link): link is { to: string; text: string } => Boolean(link));

    return (
        <div className="flex w-screen h-screen flex-col items-center p-16 bg-background">
            <div className="max-w-xl w-full h-auto mb-10 hover:cursor-pointer">
                <Link to="/">
                    <TextLogoSVG className=" text-primary" />
                </Link>
            </div>
            <Card className="flex flex-col w-full max-w-lg py-4 px-8 gap-4 mb-2">
                {title && <h1 className="mx-auto font-bold">{title}</h1>}
                {children}
                {links.length > 0 && (
                    <div className="flex flex-row divide-x divide-trim justify-center">
                        {links.map((link) => (
                            <LinkBase key={link.to} to={link.to} text={link.text} />
                        ))}
                    </div>
                )}
            </Card>
            <p className="text-error">
                {error}
            </p>
            <PrivacyFooter />
        </div>
    )
}

interface LinkBaseProps {
    to: string;
    text: string;
}

function LinkBase({ to, text }: LinkBaseProps) {
    return (
        <Link to={to}>
            <p className="underline cursor-pointer text-text-muted px-2">{text}</p>
        </Link>
    )
}
