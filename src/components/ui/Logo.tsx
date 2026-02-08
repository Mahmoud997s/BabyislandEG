"use client";

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showSlogan?: boolean;
}

export function Logo({ className, showSlogan = true }: LogoProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return (
    <div className={cn("flex items-center gap-3 group shrink-0", className)}>
      <div className={cn(
        "flex flex-col items-center justify-center gap-0 text-center",
        isRtl ? "order-1" : "order-2"
      )}>
        <span className="text-2xl font-black transition-all duration-300 group-hover:tracking-wide drop-shadow-sm leading-tight font-baskervville-sc">
          <span className="text-[#0EA5E9]">Babyisland</span>
          <span className="text-[#F97316]">EG</span>
        </span>
        {showSlogan && (
          <span 
            className="text-[10px] font-bold text-[#F97316] tracking-wider uppercase -mt-1" 
            style={{ fontFamily: "'Cairo', sans-serif" }} 
            suppressHydrationWarning
          >
            {t("header.slogan")}
          </span>
        )}
      </div>
      <img
        src="/babyisland_logo_exact.png"
        alt="BabyislandEG"
        className={cn(
          "w-12 h-12 rounded-full object-cover transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg ring-2 ring-white/50",
          isRtl ? "order-2" : "order-1"
        )}
      />
    </div>
  );
}
