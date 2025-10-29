import React from "react";

import Navbar from "../home/homecomponents/Navbar";
import HeroSection from "../home/homecomponents/HeroSection";
import DemoSection from "../home/homecomponents/DemoSection";
import PricingSection from "../home/homecomponents/PricingSection";
import TestimonialsSection from "../home/homecomponents/TestimonialsSection";
import Footer from "../home/homecomponents/Footer";
import ShowcaseSection from "./homecomponents/ShowcaseSection";
import CandidateHeroSection from "./homecomponents/CandidateHeroSection";
import LandingPage from "./homecomponents/LandingPage";
import CandidateShowcaseSection from "./homecomponents/CandidateShowcaseSection";

import { useAuth } from "../../context/AuthContext";

export default function JobSphereHomepage() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6 text-indigo-600">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-slate-800">
      <main className="max-w-7xl mx-auto px-6">
        <Navbar />

        {/* If interviewer is logged in */}
        {user?.role === "interviewer" ? (
          <>
            <HeroSection/>
            <ShowcaseSection />
             <DemoSection />
            <PricingSection />
          </>
        ) : user?.role === "candidate" ? (
          // If candidate is logged in
          <>
            <CandidateHeroSection/>
            <CandidateShowcaseSection/>
             <DemoSection />
            <PricingSection />
          </>
        ) : (
          // If not logged in, show default landing
          <>
        
           <LandingPage/>
          </>
        )}


         {/* <FeaturesSection /> */}
           
           
            <TestimonialsSection />
            <Footer />
      </main>
    </div>
  );
}
