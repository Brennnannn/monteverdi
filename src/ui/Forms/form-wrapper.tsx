import { createContext, useContext, useReducer, useState } from "react";
import { inputValue } from "./form-fields";
import { validator } from "./form-validations";

/** Values a path stops at: it never descends into these. */
type Leaf = string | number | boolean | bigint | symbol | null | undefined | Date | File | Blob
    | Map<unknown, unknown> | Set<unknown> | ((...args: never[]) => unknown);

/** How deep `Path` descends before stopping; keeps recursive shapes like `Json` finite. */
type MaxDepth = 6;

/**
 * Every dot-path into `T`, including array indexes: for `{ notes: { content: string }[] }` that's
 * `"notes" | `notes.${number}` | `notes.${number}.content``. An untyped form (`Record<string, unknown>`) gives `string`.
 */
export type Path<T, D extends 0[] = []> = D["length"] extends MaxDepth ? never
    : T extends Leaf ? never
    : T extends ReadonlyArray<infer U>
        ? `${number}` | `${number}.${Path<NonNullable<U>, [...D, 0]>}`
        : {
            [K in keyof T & string]: K | `${K}.${Path<NonNullable<T[K]>, [...D, 0]>}`
        }[keyof T & string];

/** Adds `undefined` when `T` may be missing, since a path through it reads `undefined`. */
type Missing<T> = [Extract<T, null | undefined>] extends [never] ? never : undefined;

/** The value at dot-path `P` in `T` (see `Path`). */
export type PathValue<T, P extends string> =
    T extends ReadonlyArray<infer U>
        ? P extends `${number}.${infer R}` ? PathValue<NonNullable<U>, R> | Missing<U>
        : P extends `${number}` ? U
        : never
    : P extends `${infer K}.${infer R}`
        ? K extends keyof T ? PathValue<NonNullable<T[K]>, R> | Missing<T[K]> : never
    : P extends keyof T ? T[P]
    : never;

/** The item type of the array at a path; `unknown` for an untyped form. */
type ArrayItem<V> = NonNullable<V> extends ReadonlyArray<infer U> ? U : unknown extends V ? unknown : never;

/** Per-field binding handed to `FormField`/`SelectField` by `FormContext`. */
export type FormContextType = {
    field: inputValue;
    setField: (value: inputValue) => void;
    errors?: string[];
    setErrors: (params: SetErrorParams) => void;
};

export type SetErrorParams = {
    errors: validator[];
    messages?: string[];
};

/** Full form access returned by `useFormFull<TForm>()`, typed by the form's fields type. */
export type FormFullContextType<TForm extends object = Record<string, unknown>> = {
    form: TForm;
    dispatch: React.Dispatch<FormAction>;
    getFormField: <P extends Path<TForm>>(field: P) => PathValue<TForm, P>;
    setFormField: <P extends Path<TForm>>(field: P, value: PathValue<TForm, P>) => void;
    insertArrayItem: <P extends Path<TForm>>(field: P, value: ArrayItem<PathValue<TForm, P>>, index?: number) => void;
    removeArrayItem: (field: Path<TForm>, index: number) => void;
    validate: () => boolean;
};

export const FormContext = createContext<((field: string) => FormContextType) | null>(null);  //Create a context to provide our form state and dispatch function to child components
/** What the provider actually holds: paths and values unchecked. `useFormFull<TForm>()` types it. */
type FormFullStore = {
    form: object;
    dispatch: React.Dispatch<FormAction>;
    getFormField: (field: string) => unknown;
    setFormField: (field: string, value: unknown) => void;
    insertArrayItem: (field: string, value: unknown, index?: number) => void;
    removeArrayItem: (field: string, index: number) => void;
    validate: () => boolean;
};

const FormFullContext = createContext<FormFullStore | null>(null);

export type FormAction =
    | { kind: "set"; type: string; value: unknown }
    | { kind: "reset"; value: object }
    | { kind: "array-insert"; type: string; value: unknown; index?: number }
    | { kind: "array-remove"; type: string; index: number };

/**
 * Full access to the enclosing `FormWrapper`'s state, typed by the form's fields type. Pass the same
 * type the `FormWrapper` was given; paths and values passed to `setFormField`/`getFormField` are checked against it.
 *
 * @example
 * ```tsx
 * const { form, setFormField } = useFormFull<ClientFields>();
 * setFormField(`notes.${index}.content`, value);
 * ```
 */
export function useFormFull<TForm extends object>(): FormFullContextType<TForm> {
    const context = useContext(FormFullContext);
    if (!context) {
        throw new Error("useFormFull must be used within a FormWrapper");
    }
    // The context can't carry the wrapper's generic; the caller names the type the wrapper was given
    return context as unknown as FormFullContextType<TForm>;
}

/** An object or array viewed as string-keyed, for path walking. */
type Indexable = Record<string, unknown>;

const isArrayIndex = (segment: string) => /^\d+$/.test(segment);

const getByPath = (obj: unknown, path: string): unknown => {
    return path.split(".").reduce<unknown>((acc, key) => (acc == null ? undefined : (acc as Indexable)[key]), obj);
}

const setByPath = <T,>(obj: T, path: string, value: unknown): T => {
    const keys = path.split(".");
    const root = (Array.isArray(obj) ? [...obj] : { ...obj }) as Indexable;
    let cursor = root;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]!;
        const nextKey = keys[i + 1]!;
        const current = cursor[key];
        cursor[key] = Array.isArray(current)
            ? [...current]
            : (current && typeof current === "object")
                ? { ...current }
                : isArrayIndex(nextKey)
                    ? []
                    : {};
        cursor = cursor[key] as Indexable;
    }

    const lastKey = keys[keys.length - 1]!;
    cursor[lastKey] = value;
    return root as T;
}

const insertByPath = <T,>(obj: T, path: string, value: unknown, index?: number): T => {
    const current = getByPath(obj, path);
    const array: unknown[] = Array.isArray(current) ? [...current] : [];
    const safeIndex = index === undefined
        ? array.length
        : Math.max(0, Math.min(index, array.length));
    array.splice(safeIndex, 0, value);
    return setByPath(obj, path, array);
}

const removeByPath = <T,>(obj: T, path: string, index: number): T => {
    const current = getByPath(obj, path);
    const array: unknown[] = Array.isArray(current) ? [...current] : [];
    if (index < 0 || index >= array.length) return obj;
    array.splice(index, 1);
    return setByPath(obj, path, array);
}

type FormWrapperProps<TForm extends object> = {
    initial: TForm;
    children: React.ReactNode;
    className?: string;
    onSubmit?: (form: TForm) => void;
};

/**
 * Manages form state for a typed form object and exposes two contexts:
 * - `FormContext` (per-field binding used by `FormField`)
 * - the full form, read with `useFormFull<TForm>()` (used by `FormArray` and custom consumers)
 *
 * Runs all registered field validators on submit and blocks the `onSubmit` callback if any fail.
 * Resets form state and clears errors when `initial` reference changes.
 *
 * @param {TForm} initial - Initial form values; must be a stable reference to avoid reset loops
 * @param {React.ReactNode} children - Form field components (`FormField`, `FormArray`, etc.)
 * @param {string} [className] - Class applied to the underlying `<form>` element
 * @param {(form: TForm) => void} [onSubmit] - Callback invoked with the validated form; not called on validation failure
 *
 * @example
 * ```tsx
 * <FormWrapper initial={{ name: '', email: '' }} onSubmit={handleSave}>
 *   <FormField fieldName="name" label="Name" validation={required} />
 *   <FormField fieldName="email" label="Email" type="email" validation={email} />
 *   <Button type="submit">Save</Button>
 * </FormWrapper>
 * ```
 */
export function FormWrapper<TForm extends object>({ initial, children, className, onSubmit }: FormWrapperProps<TForm>) {

    type FieldError = {  //Error payload, keyed by field in reducer action
        messages?: string[];
        validation: validator;
    }

    type ErrorState = Record<string, FieldError | null>;
    type ErrorAction = {
        type?: string;
        value?: FieldError | null;
        reset?: boolean;
    };

    const [initialized, setInitialized] = useState<TForm>(initial);

    const [form, dispatch] = useReducer(
        (state: TForm, action: FormAction) => {
            if (action.kind === "reset") {
                return action.value as TForm;
            }
            if (action.kind === "array-insert") {
                return insertByPath(state, action.type, action.value, action.index);
            }
            if (action.kind === "array-remove") {
                return removeByPath(state, action.type, action.index);
            }
            return setByPath(state, action.type, action.value);
        },
        initial
    );  //Use useReducer to manage our form state, initialized with the provided initial values

    const [errors, dispatchErrors] = useReducer(
        (state: ErrorState, action: ErrorAction) => {
            if (action.reset) {
                return {} as ErrorState;
            }
            if (action.type) {
                return { ...state, [action.type]: action.value ?? null };
            }
            return state;
        },
        {} as ErrorState
    );  //State to hold validation errors for our form fields

    // A new `initial` resets the form and its errors, adjusted during render (no extra pass through an effect)
    if (initialized !== initial) {
        dispatchErrors({ reset: true })
        dispatch({ kind: "reset", value: initial })
        setInitialized(initial);
    }

    const scopedContext = (fieldName: string): FormContextType => {
        return {
            field: getByPath(form, fieldName) as inputValue, //Get the value of the specified field
            setField: (input: inputValue) => dispatch({ kind: "set", type: fieldName, value: input }), //dispatch the specified field
            errors: errors[fieldName]?.messages, //Get the error message for the specified field
            setErrors: ({ errors, messages }: SetErrorParams) => {  //Function to set validation errors for the specified field
                const newError: FieldError = {
                    messages,
                    validation: (value) => validator({ value, conditions: errors })
                };
                dispatchErrors({ type: fieldName, value: newError });
            }
        };
    }

    const validate = (): boolean => {
        let hasErrors = false;
        for (const field in errors) {
            const error = errors[field];
            if (error) {
                const validationError = error.validation(getByPath(form, field) as inputValue);
                if (validationError) {
                    hasErrors = true;
                    dispatchErrors({ type: field, value: { ...error, messages: validationError } });
                }
            }
        }
        return !hasErrors;
    }

    const attemptSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (validate()) onSubmit?.(form);
    }

    // Stored untyped: `useFormFull<TForm>()` restores the type on the way out
    const full: FormFullStore = {
        form,
        dispatch,
        getFormField: (field) => getByPath(form, field),
        setFormField: (field, value) => dispatch({ kind: "set", type: field, value }),
        insertArrayItem: (field, value, index) => dispatch({ kind: "array-insert", type: field, value, index }),
        removeArrayItem: (field, index) => dispatch({ kind: "array-remove", type: field, index }),
        validate
    };

    return (
        <FormFullContext.Provider value={full}>
            <FormContext.Provider value={scopedContext}>
                <form className={className}
                    onSubmit={e => attemptSubmit(e)}
                >
                    {children}
                </form>
            </FormContext.Provider>
        </FormFullContext.Provider>

    )
}
