/**
 * Safe localStorage helpers with defensive parsing
 */

const get = <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;

    try {
        const item = localStorage.getItem(key);
        if (!item) return null;
        return JSON.parse(item) as T;
    } catch {
        // Corrupt data - remove it
        localStorage.removeItem(key);
        return null;
    }
};

const set = <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Storage full or other error - fail silently
        console.warn(`Failed to save to localStorage: ${key}`);
    }
};

const remove = (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
};

const getArray = <T>(key: string): T[] => {
    const data = get<T[]>(key);
    return Array.isArray(data) ? data : [];
};

export const storage = {
    get,
    set,
    remove,
    getArray,
};
