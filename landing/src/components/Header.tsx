import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-white/90 dark:bg-secondary/90 backdrop-blur-sm z-30 border-b border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link href="/" className="flex items-center group">
              <span className="sr-only">SaaS Logo</span>
              <div className="h-10 w-10 relative">
                {/* Animated gradient logo */}
                <div className="w-full h-full animated-gradient rounded-lg flex items-center justify-center text-white font-bold transition-all duration-300 group-hover:shadow-lg">
                  S
                </div>
              </div>
              <span className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">
                SaaS Product
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-expanded="false"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop menu */}
          <nav className="hidden md:flex space-x-8">
            <Link href="#features" className="text-base font-medium text-secondary dark:text-gray-200 hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#plans" className="text-base font-medium text-secondary dark:text-gray-200 hover:text-primary transition-colors">
              Plans
            </Link>
            <Link href="#contact" className="text-base font-medium text-secondary dark:text-gray-200 hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>

          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0 space-x-4">
            <ThemeToggle />
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:text-primary-600 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="https://app.example.com"
              className="btn-primary flex items-center space-x-2"
            >
              <span>Start free trial</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on state */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-secondary border-t border-gray-100 dark:border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="#features"
              className="block px-3 py-2 rounded-md text-base font-medium text-secondary dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#plans"
              className="block px-3 py-2 rounded-md text-base font-medium text-secondary dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Plans
            </Link>
            <Link
              href="#contact"
              className="block px-3 py-2 rounded-md text-base font-medium text-secondary dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-base font-medium text-gray-500 dark:text-gray-400">Theme</span>
                <ThemeToggle />
              </div>
              <Link
                href="/auth/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="https://app.example.com"
                className="block mt-2 w-full px-3 py-2 rounded-md text-center text-white bg-primary font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}