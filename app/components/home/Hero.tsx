"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import BrandButton from "./BrandButton";

interface Slide {
  image: string;
  title?: string;
  subtitle?: string;
  photoDesc?: string;
}

interface StoreButtonConfig {
  text: string;
  href: string;
  color: string;
  icon?: React.ReactNode;
}

interface HeroProps {
  slides?: Slide[];
  logo?: string;
  description?: string;
  storeButtons?: StoreButtonConfig[];
}

/**
 * Hero - The flagship introductory section of the home page.
 * Optimized for performance with Next.js and high-end visuals.
 */
export default function Hero({ 
  slides = [
    { image: "/hero-bg-1.jpg", title: "MASTER YOUR CRAFT", photoDesc: "COLLECTORS EDITION — SERIES 01" },
    { image: "/hero-bg-2.jpg", title: "JOIN THE COMPETITION", photoDesc: "TOURNAMENT ARENA — LIVE EVENT" }
  ], 
  logo = "/hpluslogo.png", 
  description = "Experience the next level of hobby gaming. Tournaments, community, and the best gear, all in one place.",
  storeButtons = [
    { 
      text: "Shopee", 
      href: "https://shopee.ph/hobbyplusshop", 
      color: "#EE4D2D",
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 6.5h-1.28c-.47-2.31-2.49-4-4.88-4s-4.41 1.69-4.88 4H6.68c-.93 0-1.68.75-1.68 1.68V18c0 .93.75 1.68 1.68 1.68h10.64c.93 0 1.68-.75 1.68-1.68V8.18c0-.93-.75-1.68-1.68-1.68zM12.84 4.5c1.33 0 2.45.86 2.81 2H10.03c.36-1.14 1.48-2 2.81-2z" />
        </svg>
      )
    },
    { 
      text: "Lazada", 
      href: "https://www.lazada.com.ph/shop/hobby-plus-shop", 
      color: "#00008F",
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.12 3.32C11.58 3.58 11.14 4.1 10.86 4.78 10.46 5.76 10.28 7.32 10.28 8.44L10.28 9.32 9.4 9.32C8.38 9.32 6.8 9.5 5.82 9.88 5.14 10.16 4.62 10.6 4.36 11.14 4.1 11.68 4.1 12.32 4.36 12.86 4.62 13.4 5.14 13.84 5.82 14.12 6.8 14.5 8.38 14.68 9.4 14.68L10.28 14.68 10.28 15.56C10.28 16.68 10.46 18.24 10.86 19.22 11.14 19.9 11.58 20.42 12.12 20.68 12.66 20.94 13.3 20.94 13.84 20.68 14.38 20.42 14.82 19.9 15.1 19.22 15.5 18.24 15.68 16.68 15.68 15.56L15.68 14.68 16.56 14.68C17.68 14.68 19.24 14.5 20.22 14.12 20.9 13.84 21.42 10.6 20.22 9.88 19.24 9.5 17.68 9.32 16.56 9.32L15.68 9.32 15.68 8.44C15.68 7.32 15.5 5.76 15.12 4.78 14.84 4.1 14.4 3.58 13.86 3.32 13.32 3.06 12.66 3.06 12.12 3.32Z" />
        </svg>
      )
    }
  ]
}: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [skipAnimation, setSkipAnimation] = useState(true);

  useEffect(() => {
    // Check if this is the first load of the session
    const hasVisited = sessionStorage.getItem("joust_visited");
    if (hasVisited) {
      setSkipAnimation(false);
    } else {
      sessionStorage.setItem("joust_visited", "true");
      setSkipAnimation(true);
    }

    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const animationClass = skipAnimation ? "" : "animate-slide-up";

  return (
    <section className="relative h-[80vh] md:h-[90vh] min-h-[500px] md:min-h-[700px] w-full overflow-hidden bg-background font-questrial">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
              idx === currentSlide ? "opacity-100 scale-105" : "opacity-0 scale-100"
            }`}
            style={{ transitionProperty: "opacity, transform" }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black z-10" />
            <div className="relative w-full h-full bg-neutral-900" />
          </div>
        ))}
      </div>

      {/* Main Content Overlay */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-8 flex flex-col items-start justify-center text-left">
        {/* Animated Logo */}
        <div className={`mb-8 ${skipAnimation ? "" : "animate-in fade-in zoom-in duration-1000"}`}>
          <Image 
            src={logo} 
            width={240} 
            height={240} 
            alt="Hobby+ Logo" 
            priority
            className="w-48 md:w-80 drop-shadow-[0_0_30px_rgba(82,185,70,0.2)]"
            style={{ height: 'auto' }}
          />
        </div>

        {/* Content Block */}
        <div className={`max-w-2xl space-y-10 ${animationClass}`}>
          <p className="text-foreground/60 text-lg md:text-2xl font-medium tracking-tight leading-relaxed font-questrial max-w-lg md:max-w-2xl">
            {description}
          </p>

          {/* Customizable Storefront Buttons */}
          <div className="flex flex-wrap items-center gap-4 font-poppins">
            {storeButtons.map((btn, idx) => (
              <BrandButton 
                key={idx}
                text={btn.text}
                href={btn.href}
                bgColor={btn.color}
                icon={btn.icon}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-16 left-8 z-30 flex items-center gap-4">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className="group py-4 px-2"
              aria-label={`Go to slide ${idx + 1}`}
            >
              <div className={`h-[2px] transition-all duration-700 ${
                idx === currentSlide ? "w-16 bg-primary" : "w-8 bg-foreground/20 group-hover:bg-foreground/40"
              }`} />
            </button>
          ))}
        </div>
      )}

      {/* Side Label - Photo Description */}
      <div className="absolute right-8 bottom-24 hidden lg:block z-20">
        <div className="rotate-90 origin-right text-[10px] font-black uppercase tracking-[0.8em] text-foreground/20 whitespace-nowrap transition-all duration-1000 font-poppins">
          {slides[currentSlide].photoDesc || "HOBBY PLUS — PHOTO ARCHIVE"}
        </div>
      </div>
    </section>
  );
}
