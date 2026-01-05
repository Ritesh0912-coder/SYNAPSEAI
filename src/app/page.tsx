import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import SmartSolutions from "../components/SmartSolutions";
import Services from "../components/Services";
import Testimonials from "../components/Testimonials";
import RealWorldStrategies from "../components/RealWorldStrategies";
import Contact from "../components/Contact";
import QuickContact from "../components/QuickContact";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden selection:bg-primary selection:text-black">
      <Navbar />
      <Hero />
      <SmartSolutions />
      <Services />
      <Testimonials />
      <RealWorldStrategies />
      <QuickContact />
      <Contact />
      <Footer />
    </main>
  );
}
