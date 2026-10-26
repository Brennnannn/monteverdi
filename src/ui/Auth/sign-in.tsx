import { AuthBase } from "./auth-base";
import { Button } from '@ui';
import { FormWrapper } from "../Forms/form-wrapper";
import { FormField } from "../Forms/form-fields";
import { required } from "../Forms/form-validations";
import { useRef, useState } from "react";
import { authPageProps } from "./authPageInterface";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

type formShape = {
    email: string;
    password: string;
}

type SignInProps = authPageProps & {
    onSubmit: (data: formShape, captchaToken?: string) => Promise<{ error?: string }>;
    onSuccess?: () => void;
    captchaSiteKey?: string;
}

/**
 * Renders a sign-in form. Calls `onSubmit` with email/password and displays
 * any returned error; calls `onSuccess` on successful authentication.
 *
 * @param onSubmit Handler that performs authentication and returns `{ error? }`.
 * @param onSuccess Optional callback fired after successful sign-in.
 * @param captchaSiteKey Optional Turnstile site key; its token is passed to `onSubmit`.
 *
 * @example
 * ```tsx
 * <SignIn onSubmit={(form) => handleSignIn(supabase, form)} onSuccess={() => navigate('/')} />
 * ```
 */
export function SignIn({ forgotPassword = true, signUp = true, onSubmit, onSuccess, captchaSiteKey }: SignInProps) {

    const form: formShape = {
        email: '',
        password: ''
    };

    const [errorMsg, setErrorMsg] = useState<string | undefined>();
    const [captchaToken, setCaptchaToken] = useState<string | undefined>();
    const captchaRef = useRef<TurnstileInstance>(undefined);

    async function handleSubmit(data: formShape) {
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
            onSuccess?.();
        }
    }

    return (
        <FormWrapper onSubmit={handleSubmit} initial={form}>
            <AuthBase title="Sign In" forgotPassword={forgotPassword} signUp={signUp} signIn={false} error={errorMsg}>
                <FormField fieldName="email" label="Email" type="email" validation={required} />
                <FormField fieldName="password" label="Password" type="password" validation={required} />
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
                        className="px-6"
                        scheme='primary'
                        type="submit"
                    >
                        Sign In
                    </Button>
                </div>
            </AuthBase>
        </FormWrapper>
    )
}
