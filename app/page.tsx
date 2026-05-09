import { Metadata } from "next";
import Hero from "./components/home/Hero";
import Shop from "./components/home/Shop";
import TournamentPreview from "./components/home/TournamentPreview";
import Footer from "./components/Footer";
import FadeIn, { StaggerContainer } from "./components/FadeIn";
import { API_ENDPOINTS } from "./utils/api";

export const metadata: Metadata = {
  title: "Landing | The Premier Arena for Hobbyists",
  description: "Welcome to Hobby+. Discover tournaments, gear, and community.",
  openGraph: {
    title: "Landing | Hobby+",
    description: "The next level of hobby gaming.",
    images: ["/hpluslogo.png"],
  },
};

/**
 * Home Page - Server Component
 * Orchestrates data fetching and layout structure.
 */
export default async function Home() {
  // Parallel Fetching from Backend (Server-Side)
  // We use the internal backend URL if possible
  const hostIp = process.env.HOST_IP || "localhost";
  const backendPort = process.env.BACKEND_PORT || "4000";
  const backendUrl = process.env.BACKEND_URL || `http://${hostIp}:${backendPort}`;

  let tournaments = [];
  try {
    const res = await fetch(`${backendUrl}${API_ENDPOINTS.TOURNAMENTS.BASE}`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });
    if (res.ok) {
      const data = await res.json();
      // Filter for relevant preview statuses
      tournaments = data.filter((t: { status: string }) => 
        t.status === "OPEN" || t.status === "UPCOMING" || t.status === "PENDING"
      );
    }
  } catch (e) {
    console.error("Failed to fetch tournaments server-side", e);
  }

  return (
    <StaggerContainer className="flex flex-col">
      {/* Flagship Hero Section */}
      <FadeIn>
        <Hero />
      </FadeIn>
      
      {/* Tournament Showcase - Server Rendered */}
      <FadeIn>
        <TournamentPreview tournaments={tournaments} />
      </FadeIn>
      
      {/* Featured Shop - Client Interactive */}
      <FadeIn>
        <Shop />
      </FadeIn>
      
      {/* Future Sections */}
      <FadeIn>
        <section className="py-24 bg-background border-t border-foreground/5 relative overflow-hidden">
           <div className="absolute inset-0 z-0 opacity-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_70%)]" />
           </div>
           <div className="max-w-7xl mx-auto px-8 relative z-10 text-center">
              <div className="h-px w-24 bg-primary/30 mx-auto mb-8" />
              <h4 className="text-sm font-black uppercase tracking-[0.6em] text-foreground/40 italic">
                 More Updates Coming Soon
              </h4>
           </div>
        </section>
      </FadeIn>

      <Footer />
    </StaggerContainer>
  );
}
