"use client";

import { useEffect } from "react";

/**
 * This component runs on the client side and removes specific attributes 
 * injected by browser extensions (like bis_skin_checked) that cause hydration mismatches.
 */
export function HydrationSanitizer() {
    useEffect(() => {
        // Function to clean attributes
        const cleanAttributes = () => {
            const elements = document.querySelectorAll('[bis_skin_checked]');
            elements.forEach(el => {
                el.removeAttribute('bis_skin_checked');
            });
        };

        // Run immediately on mount
        cleanAttributes();

        // Optional: Run on mutation if needed, but usually on mount is enough 
        // for the initial hydration mismatch warning. 
        // If the extension injects after hydration, React won't complain anyway.
    }, []);

    return null; // This component renders nothing
}
