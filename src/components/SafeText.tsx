import React from "react";

interface SafeTextProps {
    children: React.ReactNode;
    className?: string;
    as?: React.ElementType;
}

export const SafeText = ({ children, className, as: Component = "span" }: SafeTextProps) => {
    return (
        <Component suppressHydrationWarning className={className}>
            {children}
        </Component>
    );
};
