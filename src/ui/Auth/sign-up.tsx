import { useRef, useState } from "react";
import { AuthBase } from "./auth-base";
import { Button } from '@ui';
import { FormWrapper, useFormFull } from "../Forms/form-wrapper";
import { FormField } from "../Forms/form-fields";
import { email, eq, minLength, required, validator } from "../Forms/form-validations";
import { authPageProps } from "./authPageInterface";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

export type signUpFormShape = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

type SignUpProps = Omit<authPageProps, "supabase"> & {
    onSubmit: (data: signUpFormShape, captchaToken?: string) => Promise<{ error?: string }>;
    onSuccess?: () => void;
    captchaSiteKey?: string;
}

type SignUpFieldsProps = Partial<Omit<authPageProps, "supabase">> & {
    error?: string;
    captcha?: React.ReactNode;
}

/**
 * Renders a registration form collecting name, email, password, and confirmation.
 * Calls `onSubmit` with the validated form data, displays any returned error,
 * and calls `onSuccess` on successful registration.
 *
 * @param onSubmit Handler that creates the account and returns `{ error? }`.
 * @param onSuccess Optional callback fired after successful sign-up.
 * @param captchaSiteKey Optional Turnstile site key; its token is passed to `onSubmit`.
 *
 * @example
 * ```tsx
 * <SignUp
 *   onSubmit={(form) => handleSignUp(supabase, form)}
 *   onSuccess={() => navigate('/sign-in')}
 * />
 * ```
 */
export function SignUp({ onSubmit, onSuccess, forgotPassword = true, signIn = true, captchaSiteKey }: SignUpProps) {
    const [errorMsg, setErrorMsg] = useState<string | undefined>();
    const [captchaToken, setCaptchaToken] = useState<string | undefined>();
    const captchaRef = useRef<TurnstileInstance>(undefined);

    const form: signUpFormShape = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    };

    async function handleSubmit(data: signUpFormShape) {
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
            onSuccess?.();
        }
    }

    return (
        <FormWrapper onSubmit={handleSubmit} initial={form}>
            <SignUpFields
                forgotPassword={forgotPassword}
                signIn={signIn}
                error={errorMsg}
                captcha={captchaSiteKey && (
                    <Turnstile
                        ref={captchaRef}
                        siteKey={captchaSiteKey}
                        onSuccess={setCaptchaToken}
                        onExpire={() => setCaptchaToken(undefined)}
                        className="flex justify-center"
                    />
                )}
            />
        </FormWrapper>
    )
}

function SignUpFields({ forgotPassword = true, signIn = true, error, captcha }: SignUpFieldsProps) {
    const { form } = useFormFull<signUpFormShape>();
    const password = form.password;

    return (
        <AuthBase title="Create Account" forgotPassword={forgotPassword} signUp={false} signIn={signIn} error={error}>
            <div className="flex flex-col sm:flex-row sm:gap-2">
                <FormField fieldName="firstName" label="First Name" validation={required} />
                <FormField fieldName="lastName" label="Last Name" validation={required} />
            </div>

            <FormField fieldName="email" label="Email" type="email" validation={email} />

            <div className="flex flex-col sm:flex-row sm:gap-2">
                <FormField
                    fieldName="password"
                    label="Password"
                    type="password"
                    validation={(value) => validator({ value, conditions: [minLength(8)] })} />

                <FormField
                    fieldName="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    validation={(value) => validator({ value, conditions: [eq(password)] })}
                />
            </div>

            {captcha}

            <div className="flex gap-4 w-full justify-center">
                <Button
                    className="px-6"
                    scheme='primary'
                    type="submit"
                >
                    Sign Up
                </Button>
            </div>
        </AuthBase>
    )
}
