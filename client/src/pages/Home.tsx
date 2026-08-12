import { LandingHero } from "../components/LandingHero";
import { LandingHowItWorks } from "../components/LandingHowItWorks";
import { LandingUploadSection } from "../components/LandingUploadSection";
import { LandingWhatYouGet } from "../components/LandingWhatYouGet";
import "./Home.css";

export function Home() {
  return (
    <main className="landing">
      <LandingHero />
      <LandingHowItWorks />
      <LandingWhatYouGet />
      <LandingUploadSection />
    </main>
  );
}
