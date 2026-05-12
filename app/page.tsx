import { Metadata } from "next";
import Hero from "./components/home/Hero";
import Shop from "./components/home/Shop";
import TournamentPreview from "./components/home/TournamentPreview";
import SectionDivider from "./components/home/SectionDivider";
import Footer from "./components/Footer";
import FadeIn, { StaggerContainer } from "./components/FadeIn";
import { API_ENDPOINTS } from "./utils/api";

export const metadata: Metadata = {
  title: "Landing | The Next Level of Competitive Gaming",
  description: "Welcome to Hobby+. Discover professional tournaments, elite gear, and community.",
  openGraph: {
    title: "Landing | Hobby+",
    description: "The next level of hobby gaming.",
    images: ["/hpluslogo.png"],
  },
};

export default async function Home() {
  const hostIp = process.env.HOST_IP || "localhost";
  const backendPort = process.env.BACKEND_PORT || "4000";
  const backendUrl = process.env.BACKEND_URL || `http://${hostIp}:${backendPort}`;

  let tournaments = [];
  try {
    const res = await fetch(`${backendUrl}${API_ENDPOINTS.TOURNAMENTS.BASE}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      tournaments = data.filter((t: { status: string }) => 
        t.status === "OPEN" || t.status === "UPCOMING" || t.status === "PENDING"
      );
    }
  } catch (e) {
    console.error("Failed to fetch tournaments server-side", e);
  }

  return (
    <div className="flex flex-col bg-[#1B1B1B] selection:bg-primary selection:text-black min-h-screen overflow-x-hidden">
      <StaggerContainer>
        {/* Rhythmic Landing Sequence */}
        <FadeIn>
          <Hero />
        </FadeIn>
        
        <div className="relative">
          {/* Section 01 // STORE */}
          <SectionDivider label="STORE" />
          <FadeIn>
            <Shop />
          </FadeIn>

          {/* Section 02 // TOURNAMENTS */}
          <SectionDivider label="TOURNAMENTS" />
          <FadeIn>
            <TournamentPreview tournaments={tournaments} />
          </FadeIn>
        </div>

        <Footer />
      </StaggerContainer>
    </div>
  );
}
