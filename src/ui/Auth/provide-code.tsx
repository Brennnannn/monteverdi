import { AuthBase } from "./auth-base";
import { Button } from '@ui';
import { FormWrapper } from "../Forms/form-wrapper";
import { FormField } from "../Forms/form-fields";
import { required } from "../Forms/form-validations";
import { useState } from "react";

type formShape = {
    code: string;
}

type ProvideCodeProps = {
    onSubmit: (data: formShape) => Promise<{ error?: string }>;
    onSuccess?: () => void;
    onSignOut?: () => void;
}

/**
 * Renders a verification-code form for the login-time MFA challenge. Calls `onSubmit` with the
 * entered code and displays any returned error; calls `onSuccess` once verified. An optional
 * `onSignOut` renders as a plain link, so a user who can't complete the challenge isn't stuck here.
 *
 * @param onSubmit Handler that verifies the code and returns `{ error? }`.
 * @param onSuccess Optional callback fired after successful verification.
 * @param onSignOut Optional callback rendered as a "Sign out" link.
 *
 * @example
 * ```tsx
 * <ProvideCode onSubmit={(form) => handleProvideCode(supabase, form)} onSuccess={() => navigate('/')} />
 * ```
 */
export function ProvideCode({ onSubmit, onSuccess, onSignOut }: ProvideCodeProps) {

    const form: formShape = {
        code: ''
    };

    const [errorMsg, setErrorMsg] = useState<string | undefined>();

    async function handleSubmit(data: formShape) {
        const result = await onSubmit(data);
        if (result.error) {
            setErrorMsg(result.error);
        } else {
            onSuccess?.();
        }
    }

    return (
        <FormWrapper onSubmit={handleSubmit} initial={form}>
            <AuthBase title="Verification Code" forgotPassword={false} signUp={false} signIn={false} error={errorMsg}>
                <p className="text-sm text-text-muted text-center">
                    Enter the 6-digit code from your authenticator app.
                </p>
                <FormField fieldName="code" label="Verification Code" placeholder="6-digit code" validation={required} />
                <div className="flex gap-4 w-full justify-center">
                    <Button
                        className="px-6"
                        scheme='primary'
                        type="submit"
                    >
                        Verify
                    </Button>
                </div>
                {onSignOut && (
                    <p
                        className="text-center underline cursor-pointer text-text-muted"
                        onClick={onSignOut}
                    >
                        Sign out
                    </p>
                )}
            </AuthBase>
        </FormWrapper>
    )
}
