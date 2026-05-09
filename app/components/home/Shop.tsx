"use client";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import HomeFrame from "./HomeFrame";
import SectionHeader from "./SectionHeader";

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  link: string;
  category?: string;
}

interface ShopProps {
  products?: Product[];
}

/**
 * Shop - A high-fidelity showcase for the gear shop.
 * Designed as a flexible skeleton ready for admin customization.
 */
export default function Shop({ 
  products = [
    { id: "1", name: "Premium Board Game", price: "$59.99", image: "/p1.jpg", link: "#", category: "COLLECTIBLES" },
    { id: "2", name: "Miniature Starter Set", price: "$45.00", image: "/p2.jpg", link: "#", category: "HOBBY" },
    { id: "3", name: "Limited Edition Cards", price: "$12.99", image: "/p3.jpg", link: "#", category: "CARDS" },
    { id: "4", name: "Gamer Accessories", price: "$25.00", image: "/p4.jpg", link: "#", category: "GEAR" },
    { id: "5", name: "Hobby Supplies Pack", price: "$30.00", image: "/p5.jpg", link: "#", category: "SUPPLIES" },
  ] 
}: ShopProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const { current } = scrollRef;
    const scrollAmount = 450;
    current.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
  };

  return (
    <HomeFrame className="py-24">
      <div className="max-w-7xl mx-auto px-8 mb-16 flex items-end justify-between">
        <SectionHeader 
          title="Marketplace" 
          subtitle="A curated showcase of premium gear and collectibles. Explore the latest additions to our external collections." 
          accent="COLLECTIONS"
        />

        <div className="flex gap-4 mb-4 font-poppins">
          <button 
            onClick={() => scroll("left")}
            className="w-14 h-14 border border-foreground/10 flex items-center justify-center hover:bg-foreground/5 transition-all active:scale-90"
            aria-label="Scroll Left"
          >
            ←
          </button>
          <button 
            onClick={() => scroll("right")}
            className="w-14 h-14 border border-foreground/10 flex items-center justify-center hover:bg-foreground/5 transition-all active:scale-90"
            aria-label="Scroll Right"
          >
            →
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-10 overflow-x-auto px-8 pb-12 no-scrollbar snap-x snap-mandatory"
      >
        {products.map((product) => (
          <a 
            key={product.id}
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-none w-[320px] md:w-[420px] group cursor-pointer snap-start"
          >
            <div className="relative aspect-[4/5] bg-background border border-foreground/5 overflow-hidden mb-8 skew-card transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-[0_0_30px_rgba(82,185,70,0.1)]">
              <div className="absolute inset-0 z-0 flex items-center justify-center text-foreground/5 text-7xl font-black select-none skew-card-inner">
                SHOWCASE
              </div>
              
              {/* Image Placeholder */}
              <div className="absolute inset-0 skew-card-inner scale-110">
                {/* Image Placeholder content */}
              </div>

              {/* View Link */}
              <div className="absolute top-6 right-6 bg-primary px-4 py-2 text-[10px] font-black text-background uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 z-20 skew-card-inner">
                Visit Store ↗
              </div>

              {/* Category Label */}
              <div className="absolute bottom-6 left-6 z-20 skew-card-inner">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] font-poppins">
                  {product.category || "UNIDENTIFIED"}
                </span>
              </div>
            </div>

            <div className="space-y-2 px-2 transition-transform duration-500 group-hover:translate-x-2">
              <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors font-poppins">
                {product.name}
              </h3>
              <p className="text-foreground/40 text-[10px] font-medium leading-relaxed font-questrial">
                {product.description}
              </p>
              <div className="flex items-center gap-4">
                 <div className="h-px w-6 bg-primary/20" />
                 <p className="text-[9px] font-black uppercase tracking-[0.4em] text-foreground/40 font-poppins">
                    Explore Details
                 </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </HomeFrame>
  );
}
