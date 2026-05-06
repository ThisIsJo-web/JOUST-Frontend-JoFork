"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

interface ButtonConfig {
  text: string;
  link: string;
}

interface HeroProps {
  slides?: string[];
  logo?: string;
  description?: string;
  buttons?: ButtonConfig[];
}

export default function Hero({ 
  slides = ["/placeholder-hero.jpg"], 
  logo = "/placeholder-logo.png", 
  description = "Experience the next level of hobby gaming with Hobby+. Tournaments, Community, and the best gear, all in one place.",
  buttons = [
    { text: "Join Tournament", link: "/tournaments" },
    { text: "Explore Shop", link: "/shop" }
  ]
}: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative h-[90vh] min-h-[600px] w-full overflow-hidden">
      {/* Slideshow Background */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0 bg-black/60 z-10" />
            <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-neutral-800 text-8xl font-black">
               {/* Fallback if no image */}
               PHOTO_{idx + 1}
            </div>
            {/* Real image would go here: 
            <Image src={slide} fill className="object-cover" alt={`Slide ${idx + 1}`} /> 
            */}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-8 flex flex-col items-center justify-center text-center space-y-12">
        <div className="animate-in fade-in zoom-in duration-1000">
          <Image 
            src="/hpluslogo.png" 
            width={240} 
            height={240} 
            alt="Hobby+ Logo" 
            className="mx-auto"
          />
        </div>

        <div className="space-y-6 max-w-2xl animate-in slide-in-from-bottom-8 duration-700 delay-300">
          <p className="text-lg md:text-xl text-neutral-300 font-medium leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 animate-in slide-in-from-bottom-8 duration-700 delay-500">
          {buttons.map((btn, idx) => (
            <a
              key={idx}
              href={btn.link}
              className={`px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 ${
                idx === 0 
                ? "bg-primary text-background hover:brightness-110" 
                : "border border-white/20 text-white hover:bg-white/10"
              }`}
            >
              {btn.text}
            </a>
          ))}
        </div>
      </div>

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1 transition-all duration-500 ${
                idx === currentSlide ? "w-12 bg-primary" : "w-6 bg-white/20"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
