import { useState } from "react";
import { AuthBase } from "./auth-base";
import { Button } from '@ui';
import { FormWrapper, useFormFull } from "../Forms/form-wrapper";
import { FormField } from "../Forms/form-fields";
import { eq, required, validator } from "../Forms/form-validations";

type ResetPasswordProps = {
    requirements: validator[];
    onSubmit: (data: { password: string; confirm: string }) => Promise<{ error?: string }>;
    onSuccess?: () => void;
}

type ResetPasswordFieldsProps = {
    error?: string;
    requirements?: validator[];
}

/**
 * Renders a form for setting a new password after following a reset link.
 * Validates that both entries match before calling `onSubmit`.
 * Calls `onSuccess` on success.
 *
 * @param requirements Additional validation rules for the new password (e.g. `minLength(8)`).
 * @param onSubmit Handler that updates the password and returns `{ error? }`.
 * @param onSuccess Optional callback fired after a successful password update.
 *
 * @example
 * ```tsx
 * <ResetPassword
 *   requirements={[minLength(8)]}
 *   onSubmit={(form) => handleResetPassword(supabase, form)}
 *   onSuccess={() => navigate('/')}
 * />
 * ```
 */
export function ResetPassword({ requirements, onSubmit, onSuccess }: ResetPasswordProps) {
    const [error, setError] = useState<string | undefined>();

    const form = { password: '', confirm: '' };

    async function handleSubmit(data: { password: string; confirm: string }) {
        setError(undefined);
        const result = await onSubmit(data);
        if (result.error) {
            setError(result.error);
        } else {
            onSuccess?.();
        }
    }

    return (
        <FormWrapper onSubmit={handleSubmit} initial={form}>
            <ResetPasswordFields error={error} requirements={requirements} />
        </FormWrapper>
    )
}

function ResetPasswordFields({ error, requirements }: ResetPasswordFieldsProps) {
    const { form } = useFormFull<{ password: string; confirm: string }>();
    const password = form.password;

    return (
        <AuthBase title="Update Password" error={error} forgotPassword={false} signUp={false}>
            <FormField
                fieldName="password"
                label="New Password"
                type="password"
                validation={(value) => validator({ value, conditions: [required, ...requirements || []] })}
            />
            <FormField
                fieldName="confirm"
                label="Confirm New Password"
                type="password"
                validation={(value) => validator({ value, conditions: [required, eq(password)] })}
            />
            <div className="flex gap-4 w-full justify-center">
                <Button
                    scheme='primary'
                    type="submit"
                >
                    Update password
                </Button>
            </div>
        </AuthBase>
    )
}
