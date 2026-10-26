import { InputHTMLAttributes, SelectHTMLAttributes, useContext, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Path, FormContext } from "./form-wrapper";
import { required } from "./form-validations";
import { Info } from "lucide-react";

export type inputValue = InputHTMLAttributes<HTMLInputElement>["value"];

const inputStyle = `px-1 block w-full rounded-lg
                border border-trim bg-background
                text-text placeholder-text-muted
                focus:border-primary focus:ring-primary`;

/**
 * Internal binding shared by every field component (`FormField`, `SelectField`, ...): reads the
 * current value and setter from `FormContext`, and wires up the "validate after first touch, then
 * on every change" behavior. Not exported; field components are the only intended consumers.
 */
function useFieldBinding(fieldName: string, validation?: (value: inputValue) => string[] | undefined) {
    const [touched, setTouched] = useState(false);
    const fieldContext = useContext(FormContext);
    if (!fieldContext) {
        throw new Error("Form fields must be used within a FormWrapper");
    }
    const { field, setField, errors, setErrors } = fieldContext(fieldName);

    const validationRef = useRef(validation);
    const setErrorsRef = useRef(setErrors);
    const validationRunnerRef = useRef((value: inputValue) => validationRef.current?.(value));

    useEffect(() => {
        validationRef.current = validation;
    }, [validation]);

    useEffect(() => {
        setErrorsRef.current = setErrors;
    }, [setErrors]);

    useEffect(() => {   //Instantiate validate for use by wrapper
        if (validationRef.current) {
            setErrorsRef.current({ errors: [validationRunnerRef.current] });
        }
    }, []);

    useEffect(() => {   //Run validation on change after field has been touched
        if (touched && validationRef.current) {
            const messages = validationRunnerRef.current(field);
            setErrorsRef.current({ errors: [validationRunnerRef.current], messages });
        }
    }, [field, touched]);

    return { field, setField, errors, onBlur: () => setTouched(true) };
}

type FieldLabelProps = {
    fieldNameString: string;
    label?: string;
    info?: string;
    required?: boolean;
};

/** Internal label + optional info-icon row shared by every field component. Not exported. */
function FieldLabel({ fieldNameString, label, info, required }: FieldLabelProps) {
    if (!label && !info) return null;
    return (
        <div className="flex flex-row gap-1 items-center" >
            {label && <label htmlFor={fieldNameString} className="text-sm font-medium text-text">
                {label}{required ? "*" : ""}
            </label>}
            {info && (
                <div title={info}>
                    <Info className="h-3 w-3 text-text-muted cursor-pointer" />
                </div>
            )}
        </div>
    );
}

type FormFieldProps<TForm extends object = Record<string, unknown>> = InputHTMLAttributes<HTMLInputElement> & {
    fieldName: Path<TForm>;
    label?: string;
    info?: string;

    validation?: (value: inputValue) => string[] | undefined;
};

/**
 * A controlled input field that syncs with `FormWrapper` state.
 * Supports text, password, email, and textarea (via `type="textarea"`).
 * Runs validation after the field is first touched and on every subsequent change.
 * Renders a label with a required indicator (`*`) when a validation function is provided.
 *
 * @param {Path<TForm>} fieldName - Dot-path key on the form state to bind to
 * @param {string} [label] - Display label; auto-derived from camelCase fieldName if omitted
 * @param {string} [info] - Tooltip text shown as an info icon next to the label
 * @param {(value: inputValue) => string[] | undefined} [validation] - Validation function; return error strings or undefined
 * @param {string} [type] - Input type; use `"textarea"` to render a `<textarea>` instead
 * @param {string} [className] - Additional classes merged onto the input element
 *
 * @example
 * ```tsx
 * <FormField fieldName="email" label="Email" type="email" validation={email} />
 * <FormField fieldName="notes" label="Notes" type="textarea" />
 * ```
 */
export function FormField<TForm extends object = Record<string, unknown>>({ fieldName, label, validation, info, ...inputProps }: FormFieldProps<TForm>) {
    const fieldNameString = String(fieldName);
    const { field, setField, errors, onBlur } = useFieldBinding(fieldNameString, validation);

    const displayLabel = label ?? fieldNameString.replace(/([A-Z])/g, ' $1').trim();

    return (
        <div className="flex flex-col flex-1">
            <FieldLabel fieldNameString={fieldNameString} label={displayLabel} info={info} required={validation != undefined} />

            {inputProps.type == 'textarea' ?
                <textarea
                    id={fieldNameString}
                    placeholder={inputProps.placeholder}
                    className={twMerge(inputStyle, inputProps.className)}
                    rows={5}
                    value={field ?? ''}
                    onChange={e => setField(e.target.value)}
                    onBlur={onBlur}
                />

                : <input
                    {...inputProps}
                    id={fieldNameString}
                    type={inputProps.type ?? "text"}
                    placeholder={inputProps.placeholder}
                    className={twMerge(inputStyle, inputProps.className)}
                    value={field ?? ''}
                    onChange={e => setField(e.target.value)}
                    onBlur={onBlur}
                />}
            <ErrorHandler messages={errors} />
        </div>
    )
}

type ErrorHandlerProps = {
    messages?: string[];
};

function ErrorHandler({ messages }: ErrorHandlerProps) {
    if (!messages || messages.length === 0) return null;
    return (
        <div className="mt-1 text-sm text-error">
            {messages.map((msg, idx) => (
                <div key={idx}>{msg}</div>
            ))}
        </div>
    )
}

/**
 * A `FormField` pre-configured with `label="Title"` and `required` validation.
 * Accepts all other `FormField` props; `label` and `validation` are fixed.
 *
 * @param {Path<TForm>} fieldName - Dot-path key on the form state for the title field
 *
 * @example
 * ```tsx
 * <TitleField fieldName="title" />
 * ```
 */
export function TitleField<TForm extends object = Record<string, unknown>>({ ...props }: FormFieldProps<TForm>) {

    return (
        <FormField
            {...props}
            label="Title"
            validation={required}
        />
    )
}

/** A single choice rendered by `SelectField`. */
export type SelectOption = {
    label: string;
    value: string;
};

type SelectFieldProps<TForm extends object = Record<string, unknown>> = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
    fieldName: Path<TForm>;
    label?: string;
    info?: string;
    options: SelectOption[];
    placeholder?: string;

    validation?: (value: inputValue) => string[] | undefined;
};

/**
 * A controlled dropdown field that syncs with `FormWrapper` state, matching `FormField`'s
 * validation and error-display behavior (validates after first touch, then on every change).
 * Renders a label with a required indicator (`*`) when a validation function is provided.
 *
 * @param {Path<TForm>} fieldName - Dot-path key on the form state to bind to
 * @param {SelectOption[]} options - Choices rendered as `<option>` elements
 * @param {string} [label] - Display label; auto-derived from camelCase fieldName if omitted
 * @param {string} [info] - Tooltip text shown as an info icon next to the label
 * @param {string} [placeholder] - Disabled placeholder option shown when no value is selected
 * @param {(value: inputValue) => string[] | undefined} [validation] - Validation function; return error strings or undefined
 * @param {string} [className] - Additional classes merged onto the select element
 *
 * @example
 * ```tsx
 * <SelectField
 *   fieldName="interval"
 *   label="Interval"
 *   options={[{ label: 'Month', value: 'month' }, { label: 'Year', value: 'year' }]}
 *   validation={required}
 * />
 * ```
 */
export function SelectField<TForm extends object = Record<string, unknown>>({ fieldName, label, validation, info, options, placeholder, ...selectProps }: SelectFieldProps<TForm>) {
    const fieldNameString = String(fieldName);
    const { field, setField, errors, onBlur } = useFieldBinding(fieldNameString, validation);

    const displayLabel = label ?? fieldNameString.replace(/([A-Z])/g, ' $1').trim();

    return (
        <div className="flex flex-col flex-1">
            <FieldLabel fieldNameString={fieldNameString} label={displayLabel} info={info} required={validation != undefined} />

            <select
                {...selectProps}
                id={fieldNameString}
                className={twMerge(inputStyle, selectProps.className)}
                value={field ?? ''}
                onChange={e => setField(e.target.value)}
                onBlur={onBlur}
            >
                {placeholder && <option value="" disabled>{placeholder}</option>}
                {options.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
            <ErrorHandler messages={errors} />
        </div>
    )
}
