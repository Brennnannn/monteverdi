import { createContext, useContext, useEffect } from "react";
import { FormField } from "./form-fields";
import { useFormFull } from "./form-wrapper";
import { Button } from "../ui/button";
import { X } from "lucide-react";

type ArrayFieldContextValue = {
    getFieldPath: (fieldName: string) => string;
};

const ArrayFieldContext = createContext<ArrayFieldContextValue | null>(null);

type FormArrayProps<TItem extends object> = {
    fieldName: string;
    children: React.ReactNode;
    createItem: () => TItem;
    minimumItems?: number;
    className?: string;
    itemClassName?: string;
    itemHeader?: (index: number) => React.ReactNode;
    addLabel?: string;
    removeLabel?: string;
};

/**
 * Renders a dynamic list of repeated form item groups backed by an array field in `FormWrapper`.
 * Each item is wrapped in an `ArrayFieldContext` so nested `ArrayField` components resolve paths automatically.
 * Enforces `minimumItems` by pre-populating the array on mount.
 *
 * @param {string} fieldName - Dot-path key on the form state that holds the array
 * @param {React.ReactNode} children - Field components (use `ArrayField` inside to get scoped paths)
 * @param {() => TItem} createItem - Factory that returns a fresh blank item object
 * @param {number} [minimumItems=1] - Minimum number of items to keep; remove button is hidden when at this count
 * @param {string} [className] - Class override for the outer container (default: `flex flex-col gap-4`)
 * @param {string} [itemClassName] - Class override for each item card
 * @param {(index: number) => React.ReactNode} [itemHeader] - Optional render function for per-item headings
 * @param {string} [addLabel="Add"] - Label for the add button
 *
 * @example
 * ```tsx
 * <FormArray fieldName="contacts" createItem={() => ({ name: '', phone: '' })}>
 *   <ArrayField fieldName="name" label="Name" />
 *   <ArrayField fieldName="phone" label="Phone" />
 * </FormArray>
 * ```
 */
export function FormArray<TItem extends object>({
    fieldName,
    children,
    createItem,
    minimumItems = 1,
    className,
    itemClassName,
    itemHeader,
    addLabel = "Add",
}: FormArrayProps<TItem>) {
    const { getFormField, insertArrayItem, removeArrayItem } = useFormFull<Record<string, unknown>>();

    const items = getFormField(fieldName) as TItem[] | undefined;
    const normalizedItems = Array.isArray(items) ? items : [];

    useEffect(() => {
        if (minimumItems < 1) return;
        if (normalizedItems.length >= minimumItems) return;

        for (let i = normalizedItems.length; i < minimumItems; i++) {
            insertArrayItem(fieldName, createItem());
        }
    }, [createItem, fieldName, insertArrayItem, minimumItems, normalizedItems.length]);

    return (
        <div className={className ?? "flex flex-col gap-4"}>
            {normalizedItems.map((_, index) => (
                <ArrayFieldContext.Provider
                    key={index}
                    value={{ getFieldPath: (childFieldName: string) => `${fieldName}.${index}.${childFieldName}` }}
                >
                    <div className={itemClassName ?? "border border-trim rounded-xl p-4 flex flex-col gap-2"}>
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-sm">{itemHeader ? itemHeader(index) : `Item ${index + 1}`}</h3>
                            {normalizedItems.length > minimumItems && (
                                <X
                                    className="h-4 w-4 text-error cursor-pointer"
                                    onClick={() => removeArrayItem(fieldName, index)}
                                />
                            )}
                        </div>
                        {children}
                    </div>
                </ArrayFieldContext.Provider>
            ))}

            <Button
                className="self-start"
                onClick={() => insertArrayItem(fieldName, createItem())}>
                {addLabel}
            </Button>
        </div>
    )
}

type ArrayFieldProps = Omit<React.ComponentProps<typeof FormField<Record<string, unknown>>>, "fieldName"> & {
    fieldName: string;
};

/**
 * A `FormField` variant for use inside a `FormArray` item.
 * Automatically prefixes `fieldName` with the parent array path and index,
 * so you pass only the leaf key (e.g. `"name"` not `"contacts.0.name"`).
 *
 * @param {string} fieldName - Leaf field key within the current array item
 * @param {string} [label] - Display label for the input
 * @param {(value: inputValue) => string[] | undefined} [validation] - Optional validation function
 *
 * @example
 * ```tsx
 * <FormArray fieldName="contacts" createItem={() => ({ name: '' })}>
 *   <ArrayField fieldName="name" label="Name" validation={required} />
 * </FormArray>
 * ```
 */
export function ArrayField({ fieldName, ...props }: ArrayFieldProps) {
    const context = useContext(ArrayFieldContext);

    if (!context) {
        throw new Error("ArrayField must be used within a FormArray item");
    }

    return <FormField fieldName={context.getFieldPath(fieldName)} {...props} />;
}