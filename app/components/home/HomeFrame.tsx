import React from "react";

interface HomeFrameProps {
  children: React.ReactNode;
  className?: string;
  showPattern?: boolean;
}

/**
 * HomeFrame - A specialized container for home page sections.
 * Implements the "Modern Sleek Slight Abstraction" aesthetic.
 */
export default function HomeFrame({ 
  children, 
  className = "", 
  showPattern = true 
}: HomeFrameProps) {
  return (
    <div className={`relative w-full overflow-hidden border-b border-foreground/5 bg-[#0A0A0A] ${className}`}>
      {/* Background Abstraction Pattern */}
      {showPattern && (
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none overflow-hidden">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#666" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      )}
      
      {/* Vibrant Gradient Accent */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent z-10" />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
