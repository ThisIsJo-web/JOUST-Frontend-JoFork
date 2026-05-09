import React from "react";

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  className?: string;
  centered?: boolean;
}

/**
 * SectionHeader - A specialized header for home page sections.
 * Ensures visual consistency while remaining flexible.
 */
export default function SectionHeader({ 
  title, 
  subtitle, 
  className = "",
  centered = false 
}: SectionHeaderProps) {
  return (
    <div className={`mb-12 ${className} ${centered ? "text-center mx-auto" : ""}`}>
      <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-4 block font-poppins">
        {subtitle}
      </span>
      <h2 className="text-3xl md:text-7xl font-black uppercase tracking-tighter text-foreground mb-6 leading-none font-poppins break-words">
        {title}
      </h2>
    </div>
  );
}
