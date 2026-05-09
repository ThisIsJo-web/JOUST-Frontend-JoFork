"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * TransitionProvider - Handles the "Modern Sleek" page transitions.
 * When navigating, the content fades out to a "blank page with background" 
 * before the new content arrives.
 */
export default function TransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    if (pathname !== window.location.pathname) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setDisplayChildren(children);
      }, 300); // Fast transition for a snappy feel
      return () => clearTimeout(timer);
    } else {
      setDisplayChildren(children);
    }
  }, [pathname, children]);

  return (
    <main className={`flex-grow transition-all duration-500 ease-in-out ${
      isTransitioning ? "opacity-0 scale-[0.98] blur-sm" : "opacity-100 scale-100 blur-0"
    }`}>
      {displayChildren}
    </main>
  );
}
