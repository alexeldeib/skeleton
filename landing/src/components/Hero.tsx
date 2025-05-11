import Link from 'next/link'
import { useState } from 'react'
import { HeroPattern } from './Patterns'

export default function Hero() {
  const [email, setEmail] = useState('')

  return (
    <div className="relative pt-24 pb-16 overflow-hidden">
      {/* Absolute positioned background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-dark to-white dark:from-secondary dark:to-secondary-900 opacity-60" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <HeroPattern />
      </div>

      {/* Hero content */}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Small badge at the top */}
          <div className="w-full flex justify-center mb-12">
            <div className="text-sm bg-surface dark:bg-gray-800 rounded-full px-4 py-1 inline-flex items-center space-x-2 shadow-sm border border-gray-100 dark:border-gray-700">
              <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-medium">New</span>
              <span className="text-secondary dark:text-white">Introducing our latest features</span>
              <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          <div className="text-center">
            {/* Gradient heading with animated effect */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
              <span className="block text-secondary dark:text-white text-shadow">Transform Your Workflow</span>
              <span
                className="mt-2 md:mt-4 block bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary-600 animate-gradient-x"
              >
                With Our SaaS Solution
              </span>
            </h1>

            <p className="mt-6 text-xl leading-relaxed text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              A powerful platform that helps teams streamline their processes,
              collaborate effectively, and achieve remarkable results.
            </p>

            {/* Email signup form */}
            <div className="mt-10 max-w-md mx-auto px-4">
              <form className="sm:flex shadow-stripe-sm rounded-lg">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="w-full px-5 py-3 rounded-l-lg focus:ring-2 focus:ring-primary border-transparent focus:border-transparent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  type="submit"
                  className="mt-3 sm:mt-0 w-full sm:w-auto gradient-purple text-white font-medium py-3 px-6 rounded-r-lg rounded-l-lg sm:rounded-l-none shadow-stripe-button hover:shadow-lg transition-all duration-300 hover:translate-y-[-1px] active:translate-y-[1px]"
                >
                  Get Started
                </button>
              </form>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Start your free 14-day trial. No credit card required.
              </p>
            </div>

            {/* Logos or social proof */}
            <div className="mt-12">
              <p className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">
                Trusted by leading companies
              </p>
              <div className="flex justify-center space-x-8 opacity-75">
                {['Acme', 'Globex', 'Stark', 'Wayne', 'Umbrella'].map((company, index) => (
                  <div key={index} className="h-8 text-gray-400 dark:text-gray-500 font-semibold">
                    {company}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating app screenshot for desktop - hidden on mobile */}
          <div className="hidden lg:block absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1/3 mt-20 w-full max-w-4xl">
            <div className="glossy-card overflow-hidden">
              <div className="h-8 bg-gray-50 border-b border-gray-100 flex items-center px-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className="h-64 bg-white"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1428 174" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 107L54 94.8C107 83 214 59 321 64.3C428 70 535 102 642 110.5C749 118 856 102 963 85.5C1070 70 1177 54 1284 43C1391 32 1498 27 1605 37.5C1712 48 1819 75 1926 85.5C2033 96 2140 91 2247 88.5C2354 86 2461 86 2568 80.2C2675 75 2782 64 2889 69.7C2996 75 3103 96 3210 110.5C3317 124 3424 134 3478 139L3531 144L3531 175L0 175L0 107Z"
            className="fill-white dark:fill-secondary-900"
          />
        </svg>
      </div>
    </div>
  )
}