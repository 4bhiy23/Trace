"use client";

import React from "react";
import { AuthBackgroundDoodles } from "./AuthBackgroundDoodles";
import { AuthCard } from "./AuthCard";
import { TraceLogo } from "./TraceLogo";
import { ThemeToggle } from "./ThemeToggle";

interface AuthPageLayoutProps {
  initialMode?: "sign-in" | "sign-up";
}

export function AuthPageLayout({
  initialMode = "sign-up",
}: AuthPageLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[var(--background)] text-[var(--foreground)] selection:bg-[#F26A4B]/20 selection:text-[#F26A4B] transition-colors duration-200">
      {/* Background Doodles and Texture */}
      <AuthBackgroundDoodles />

      
      <header className="relative z-10 w-full px-6 pt-4 sm:pt-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="w-10" /> 
        <TraceLogo />
        <div className="w-10 flex justify-end">
          <ThemeToggle />
        </div>
      </header>

    
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-3 sm:py-6">
        <AuthCard initialMode={initialMode} />
      </main>

    
      <footer className="relative z-10 py-4 text-center" />
    </div>
  );
}
