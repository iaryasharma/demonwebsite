"use client";

import { HeroSection } from "@/components/hero-section"
import { FeatureHighlights } from "@/components/feature-highlights"
import { FeatureShowcase } from "@/components/feature-showcase"
import { CommandShowcase } from "@/components/command-showcase"
import { DiscordWidget } from "@/components/discord-widget"
import { useEffect } from "react"

export default function HomePage() {
  // Prevent image downloads on the entire page
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
      }
    };
    
    const handleDragStart = (e: DragEvent) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
      }
    };

    const handleSelectStart = (e: Event) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('selectstart', handleSelectStart);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);

  return (
    <div className="relative">
      <HeroSection />
      <FeatureHighlights />
      <FeatureShowcase />
      <CommandShowcase />
      <DiscordWidget />
    </div>
  )
}
