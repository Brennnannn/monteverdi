import { useRef, useState } from "react";
import { AuthBase } from "./auth-base";
import { Button } from '@ui';
import { FormWrapper } from "../Forms/form-wrapper";
import { FormField } from "../Forms/form-fields";
import { email, required, validator } from "../Forms/form-validations";
import { authPageProps } from "./authPageInterface";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

type formShape = {
    email: string;
}

type ForgotPasswordProps = authPageProps & {
    onSubmit: (data: formShape, captchaToken?: string) => Promise<{ error?: string; message?: string }>;
    onSuccess?: () => void;
    captchaSiteKey?: string;
}

const DEFAULT_SUCCESS_MESSAGE = 'Recovery email sent. Check your inbox — if you don\'t see it, check spam and wait a few minutes.';

/**
 * Renders a form for requesting a password reset email.
 * Displays the returned `message` on success (falling back to a default),
 * or the returned `error` on failure.
 *
 * @param onSubmit Handler that sends the reset email and returns `{ error?, message? }`.
 * @param onSuccess Optional callback fired after a successful submission.
 * @param captchaSiteKey Optional Turnstile site key; its token is passed to `onSubmit`.
 *
 * @example
 * ```tsx
 * <ForgotPassword
 *   onSubmit={(form) => handleForgotPassword(supabase, form, `${window.location.origin}/reset-password`)}
 * />
 * ```
 */
export function ForgotPassword({ signIn = false, signUp = true, onSubmit, onSuccess, captchaSiteKey }: ForgotPasswordProps) {

    const form: formShape = { email: '' };

    const [errorMsg, setErrorMsg] = useState<string | undefined>();
    const [successMsg, setSuccessMsg] = useState<string | undefined>();
    const [captchaToken, setCaptchaToken] = useState<string | undefined>();
    const captchaRef = useRef<TurnstileInstance>(undefined);

    async function handleSubmit(data: formShape) {
        setErrorMsg(undefined);
        if (captchaSiteKey && !captchaToken) {
            setErrorMsg("Please complete the verification check.");
            return;
        }
        const result = await onSubmit(data, captchaToken);
        captchaRef.current?.reset();
        setCaptchaToken(undefined);
        if (result.error) {
            setErrorMsg(result.error);
        } else {
            setSuccessMsg(result.message ?? DEFAULT_SUCCESS_MESSAGE);
            onSuccess?.();
        }
    }

    if (successMsg) {
        return (
            <AuthBase title="Send Recovery Email" forgotPassword={false} signIn={signIn} signUp={signUp}>
                <p className="text-text-muted text-center py-2">{successMsg}</p>
            </AuthBase>
        );
    }

    return (
        <FormWrapper onSubmit={handleSubmit} initial={form}>
            <AuthBase title="Send Recovery Email" forgotPassword={false} signIn={signIn} signUp={signUp} error={errorMsg}>
                <FormField
                    fieldName="email"
                    label="Email"
                    type="email"
                    validation={(value) => validator({ value, conditions: [required, email] })}
                />
                {captchaSiteKey && (
                    <Turnstile
                        ref={captchaRef}
                        siteKey={captchaSiteKey}
                        onSuccess={setCaptchaToken}
                        onExpire={() => setCaptchaToken(undefined)}
                        className="flex justify-center"
                    />
                )}
                <div className="flex gap-4 w-full justify-center">
                    <Button
                        scheme='primary'
                        type="submit"
                    >
                        Send Recovery Email
                    </Button>
                </div>
            </AuthBase>
        </FormWrapper>
    )
}
