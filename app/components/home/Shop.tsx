"use client";
import { useRef } from "react";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  link: string;
}

interface ShopProps {
  products?: Product[];
}

export default function Shop({ 
  products = [
    { id: "1", name: "Premium Board Game", price: "$59.99", image: "/p1.jpg", link: "#" },
    { id: "2", name: "Miniature Starter Set", price: "$45.00", image: "/p2.jpg", link: "#" },
    { id: "3", name: "Limited Edition Cards", price: "$12.99", image: "/p3.jpg", link: "#" },
    { id: "4", name: "Gamer Accessories", price: "$25.00", image: "/p4.jpg", link: "#" },
    { id: "5", name: "Hobby Supplies Pack", price: "$30.00", image: "/p5.jpg", link: "#" },
  ] 
}: ShopProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const { current } = scrollRef;
    const scrollAmount = 400;
    if (direction === "left") {
      current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="py-24 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-8 mb-12 flex items-end justify-between">
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-4">
            <span className="h-px w-8 bg-primary/30"></span>
            The Gear Shop
          </h2>
          <h3 className="text-4xl font-black italic tracking-tighter uppercase text-white">
            Level Up Your <span className="text-primary">Inventory</span>
          </h3>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => scroll("left")}
            className="w-12 h-12 border border-neutral-800 flex items-center justify-center hover:bg-neutral-900 transition-all active:scale-90"
          >
            ←
          </button>
          <button 
            onClick={() => scroll("right")}
            className="w-12 h-12 border border-neutral-800 flex items-center justify-center hover:bg-neutral-900 transition-all active:scale-90"
          >
            →
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto px-8 pb-12 no-scrollbar snap-x snap-mandatory"
      >
        {products.map((product) => (
          <div 
            key={product.id}
            className="flex-none w-[300px] md:w-[400px] group cursor-pointer snap-start"
          >
            <div className="relative aspect-[4/5] bg-neutral-900 overflow-hidden mb-6">
              <div className="absolute inset-0 flex items-center justify-center text-neutral-800 text-6xl font-black italic">
                PRODUCT
              </div>
              {/* Product Image:
              <Image src={product.image} fill className="object-cover transition-transform duration-700 group-hover:scale-110" alt={product.name} />
              */}
              <div className="absolute top-4 right-4 bg-primary px-3 py-1 text-[10px] font-black text-background uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Shop Now
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{product.name}</h4>
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 italic">{product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
