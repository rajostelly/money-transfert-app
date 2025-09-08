"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-white p-2"
        onClick={toggleMenu}
        aria-label="Toggle mobile menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={toggleMenu}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-green-forest-800 z-50 transform transition-transform duration-300 md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-br from-green-forest-500 to-green-olive-500 rounded-lg flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 5.16-1 9-5.45 9-11V7l-10-5z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">TransferApp</span>
            </div>
            <button onClick={toggleMenu} className="text-white p-2">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-6">
            <a
              href="#features"
              className="block text-white/90 hover:text-green-olive-300 transition-colors duration-300 font-medium text-lg"
              onClick={toggleMenu}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="block text-white/90 hover:text-green-olive-300 transition-colors duration-300 font-medium text-lg"
              onClick={toggleMenu}
            >
              How it Works
            </a>
            <a
              href="#pricing"
              className="block text-white/90 hover:text-green-olive-300 transition-colors duration-300 font-medium text-lg"
              onClick={toggleMenu}
            >
              Pricing
            </a>
            <a
              href="#support"
              className="block text-white/90 hover:text-green-olive-300 transition-colors duration-300 font-medium text-lg"
              onClick={toggleMenu}
            >
              Support
            </a>
          </nav>

          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="space-y-4">
              <Link
                href="/auth?tab=signin"
                className="block w-full text-center text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 font-medium"
                onClick={toggleMenu}
              >
                Sign In
              </Link>
              <Link
                href="/auth?tab=signup"
                className="block w-full text-center bg-gradient-to-r from-green-olive-500 to-green-forest-500 hover:from-green-olive-600 hover:to-green-forest-600 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300"
                onClick={toggleMenu}
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
