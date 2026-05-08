import Navibar from "./Assets/navbar";
import Hero from "./components/home/Hero";
import Shop from "./components/home/Shop";
import TournamentPreview from "./components/home/TournamentPreview";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navibar />
      
      <main className="flex-grow">
        <Hero />
        <Shop />
        <TournamentPreview />
      </main>

      <Footer />
    </div>
  );
}
