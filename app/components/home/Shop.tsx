"use client";
import { useRef } from "react";
import { motion } from "motion/react";
import HomeFrame from "./HomeFrame";

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  link: string;
  category?: string;
  description?: string;
}

interface ShopProps {
  products?: Product[];
}

export default function Shop({ 
  products = [
    { id: "1", name: "Premium Board Game", price: "$59.99", image: "/p1.jpg", link: "#", category: "COLLECTIBLES", description: "High-fidelity strategic simulation unit." },
    { id: "2", name: "Miniature Starter Set", price: "$45.00", image: "/p2.jpg", link: "#", category: "HOBBY", description: "Precision-molded tactical components." },
    { id: "3", name: "Limited Edition Cards", price: "$12.99", image: "/p3.jpg", link: "#", category: "CARDS", description: "Authenticated holographic assets." },
    { id: "4", name: "Gamer Accessories", price: "$25.00", image: "/p4.jpg", link: "#", category: "STORE", description: "Ergonomic interface enhancements." },
    { id: "5", name: "Hobby Supplies Pack", price: "$30.00", image: "/p5.jpg", link: "#", category: "SUPPLIES", description: "Industrial-grade maintenance kit." },
  ] 
}: ShopProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);

  return (
    <HomeFrame className="py-24">
      {/* Rhythmic Draggable Feed - No redundant headers */}
      <div ref={constraintsRef} className="relative overflow-hidden px-8 pb-12 cursor-grab active:cursor-grabbing">
        <motion.div 
          drag="x"
          dragConstraints={constraintsRef}
          className="flex gap-12 w-max"
          ref={scrollRef}
        >
          {products.map((product, idx) => (
            <motion.a 
              key={product.id}
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -12,
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
              className="flex-none w-[340px] md:w-[450px] group cursor-pointer pointer-events-auto"
              onDragStart={(e) => e.preventDefault()} 
            >
              <div className="relative aspect-[4/5] bg-zinc-900 border-4 border-white group-hover:border-primary group-hover:shadow-[12px_12px_0px_0px_#52B946] transition-all duration-500 overflow-hidden mb-10">
                {/* Sensory Breathing Border */}
                <motion.div 
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-0 border-2 border-primary/20 pointer-events-none"
                />

                <div className="absolute top-8 right-8 bg-primary text-black px-8 py-4 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 font-poppins shadow-[4px_4px_0px_0px_white]">
                  VIEW STORE ↗
                </div>
  
                <div className="absolute bottom-8 left-8 z-20">
                  <motion.span 
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-xs font-black bg-white text-black px-4 py-2 uppercase tracking-widest font-poppins"
                  >
                    {product.category || "STORE"}
                  </motion.span>
                </div>
              </div>
  
              <div className="space-y-4 px-2">
                <div className="flex items-end justify-between gap-4">
                  <h3 className="text-4xl font-black uppercase tracking-tighter text-white group-hover:text-primary transition-colors font-poppins leading-none">
                    {product.name}
                  </h3>
                  <span className="text-2xl font-black text-primary/60 font-poppins">{product.price}</span>
                </div>
                <p className="text-white/30 text-xs font-bold uppercase tracking-widest leading-relaxed font-poppins max-w-[90%]">
                  {product.description}
                </p>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </HomeFrame>
  );
}
