import React from "react";
import Navbar from "../home/homecomponents/Navbar";
import HeroSection from "../home/homecomponents/HeroSection";
import FeaturesSection from "../home/homecomponents/FeaturesSection";
import DemoSection from "../home/homecomponents/DemoSection";
import PricingSection from "../home/homecomponents/PricingSection";
import TestimonialsSection from "../home/homecomponents/TestimonialsSection";
import Footer from "../home/homecomponents/Footer";
import ShowcaseSection from "./homecomponents/ShowcaseSection";

export default function JobSphereHomepage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-slate-800">
      {/* <Navbar /> */}
      <main className="max-w-7xl mx-auto px-6">
        <Navbar/>
        <HeroSection />
        {/* <FeaturesSection /> */}
        <ShowcaseSection/>
        <DemoSection />
        <PricingSection />
        <TestimonialsSection />
        <Footer />
      </main>
    </div>
  );
}
