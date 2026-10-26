import { inputValue } from "./form-fields";

export type validator = (value: inputValue) => string[] | undefined;

interface validationParams {
    value: inputValue;
    conditions: validator[];
}

export const validator = ({ value, conditions }: validationParams) => {
    let error: string[] | undefined = undefined;
    for (const condition of conditions) {
        const conditionError = condition(value);
        if (conditionError) {
            error = error ? [...error, ...conditionError] : conditionError;
            break;
        }
    }
    return error;
}

const hasInputData = (value: inputValue) => {
    return !!value && !(typeof value === "string" && value.trim() === "");
}

export const required = (value: inputValue) => {
    if (!hasInputData(value)) return ["This field is required"];
    return undefined;
}

export const minLength = (min: number): validator => {
    return (value: inputValue) => {
        if (!hasInputData(value)) return undefined;
        const text = String(value);
        if (text.length < min) return [`Must be at least ${min} characters`];
        return undefined;
    }
}

export const maxLength = (max: number): validator => {
    return (value: inputValue) => {
        if (!hasInputData(value)) return undefined;
        const text = String(value);
        if (text.length > max) return [`Must be ${max} characters or fewer`];
        return undefined;
    }
}

export const hasSpecialChar = (value: inputValue) => {
    if (!hasInputData(value)) return undefined;
    const text = String(value);
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(text)) return ["Must contain at least one special character"];
    return undefined;
}

export const hasNumber = (value: inputValue) => {
    if (!hasInputData(value)) return undefined;
    const text = String(value);
    if (!/[0-9]/.test(text)) return ["Must contain at least one number"];
    return undefined;
}

export const hasUpperCase = (value: inputValue) => {
    if (!hasInputData(value)) return undefined;
    const text = String(value);
    if (!/[A-Z]/.test(text)) return ["Must contain at least one uppercase letter"];
    return undefined;
}

export const hasLowerCase = (value: inputValue) => {
    if (!hasInputData(value)) return undefined;
    const text = String(value);
    if (!/[a-z]/.test(text)) return ["Must contain at least one lowercase letter"];
    return undefined;
}

export const matchesPattern = (pattern: RegExp, message: string): validator => {
    return (value: inputValue) => {
        if (!hasInputData(value)) return undefined;
        const text = String(value);
        if (!pattern.test(text)) return [message];
        return undefined;
    }
}

export const email = (value: inputValue) => {
    if (!hasInputData(value)) return undefined;
    const text = String(value);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(text)) return ["Please enter a valid email address"];
    return undefined;
}

export const phone = (value: inputValue) => {
    if (!hasInputData(value)) return undefined;
    const text = String(value);
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(text)) return ["Please enter a valid phone number"];
    return undefined;
}

export const url = (value: inputValue) => {
    if (!hasInputData(value)) return undefined;
    // At least one dot that is not the first or last character,
    // and only URL-safe characters.
    const text = String(value);
    const urlRegex = /^(?=.*\.)(?!.+\.$)(?!\.)[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]+$/;
    if (!urlRegex.test(text)) return ["Please enter a valid URL"];
    return undefined;
}


export const eq = (password: string): validator => {
    return (value: inputValue) => {
        if (!hasInputData(value)) return undefined;
        const text = String(value);
        if (text !== password) return ["Values do not match"];
        return undefined;
    }
}

export const pastDate = (value: inputValue) => {
    if (!hasInputData(value)) return undefined;
    const text = String(value);
    const today = new Date().toISOString().split('T')[0]!;
    if (text >= today) return ["Date must be in the past"];
    return undefined;
}