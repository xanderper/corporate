"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export interface NavLink {
  name: string;
  href: string;
}

export interface NavigationProps {
  brand: {
    line1: string;
    line2: string;
  };
  navLinks: NavLink[];
}

export function Navigation({ brand, navLinks }: NavigationProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled
            ? "bg-virex-warmwhite border-b border-virex-stone/50 py-4"
            : "bg-transparent py-8"
          }`}
      >
        <div className="container flex items-center justify-between">
          <Link
            href="/"
            className="flex flex-col font-serif leading-[1.05] text-virex-deepink z-50"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="text-xl tracking-[0.02em]">{brand.line1}</span>
            <span className="text-xl tracking-[0.02em]">{brand.line2}</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative py-1 text-[13px] font-medium tracking-wide transition-colors ${isActive
                      ? "text-virex-deepink after:absolute after:left-0 after:right-0 after:-bottom-[1px] after:h-px after:bg-virex-forest"
                      : "text-virex-muted hover:text-virex-deepink"
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-virex-deepink z-50 p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-virex-warmwhite z-40 flex flex-col justify-center px-6 transition-all duration-500 ease-[0.16,1,0.3,1] ${isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
          } md:hidden`}
      >
        <nav className="flex flex-col gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-3xl font-serif transition-colors ${isActive ? "text-virex-forest" : "text-virex-deepink"
                  }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
