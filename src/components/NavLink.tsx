"use client";

import { LocaleLink } from "@/components/LocaleLink";
import { usePathname } from "next/navigation";
import { forwardRef, ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps extends ComponentPropsWithoutRef<typeof LocaleLink> {
  to?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, pendingClassName, to, href, ...props }, ref) => {
    const pathname = usePathname();

    // Support both 'to' (React Router style) and 'href' (Next.js style)
    const linkHref = to || (typeof href === 'string' ? href : href?.pathname) || '/';

    // Check if current path matches
    const isActive = pathname === linkHref || pathname?.startsWith(linkHref + '/');

    return (
      <LocaleLink
        ref={ref}
        href={linkHref}
        className={cn(className, isActive && activeClassName)}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };

