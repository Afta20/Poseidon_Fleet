"use client"
import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { PreviewSection } from '@/components/landing/PreviewSection';
import { Footer } from '@/components/landing/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white overflow-x-hidden selection:bg-primary/50">
      <LandingNavbar />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <StatsSection />
      <PreviewSection />
      <Footer />
    </main>
  );
}
