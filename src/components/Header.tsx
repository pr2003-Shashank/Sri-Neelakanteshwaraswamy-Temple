"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Close menu when clicking on a link
  const closeMenu = () => setIsMenuOpen(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-white/90 py-4'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center" onClick={closeMenu}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dnumk8kl0/image/upload/v1755845882/logo_ywarix.png"
                alt="Sri Neelakanteshwaraswamy Temple"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="ml-3 text-xl font-semibold text-gray-800 hidden sm:block">Sri Neelakanteshwaraswamy Temple</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <NavLink href="/#about" text="About" />
            <NavLink href="/#posts" text="Posts" />
            <NavLink href="/#contact" text="Contact" />
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-3">
              <MobileNavLink href="/#about" text="About" onClick={closeMenu} />
              <MobileNavLink href="/#posts" text="Posts" onClick={closeMenu} />
              <MobileNavLink href="/#contact" text="Contact" onClick={closeMenu} />
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

// Reusable NavLink component for desktop
function NavLink({ href, text }: { href: string; text: string }) {
  return (
    <Link
      href={href}
      className="text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200 relative group"
    >
      {text}
      <span className="absolute left-0 bottom-0 h-0.5 w-0 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
    </Link>
  );
}

// Reusable NavLink component for mobile
function MobileNavLink({ href, text, onClick }: { href: string; text: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors duration-200 font-medium"
    >
      {text}
    </Link>
  );
}