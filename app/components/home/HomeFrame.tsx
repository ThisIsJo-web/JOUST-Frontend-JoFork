import React from "react";

interface HomeFrameProps {
  children: React.ReactNode;
  className?: string;
  showPattern?: boolean;
}

/**
 * HomeFrame - A specialized container for home page sections.
 * Implements the "Cyber-Acid-Brutalist" aesthetic.
 */
export default function HomeFrame({ 
  children, 
  className = "", 
  showPattern = true 
}: HomeFrameProps) {
  return (
    <div className={`relative w-full overflow-hidden border-t-4 border-primary/30 bg-background ${className}`}>
      {/* Background Technical Grid */}
      {showPattern && (
        <>
          <div className="absolute inset-0 z-0 opacity-[0.1] pointer-events-none overflow-hidden">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(var(--color-primary),0.5)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          {/* Subtle horizontal scanlines */}
          <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] pointer-events-none opacity-20" />
        </>
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
