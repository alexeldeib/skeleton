'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Plans from '@/components/Plans'
import Signup from '@/components/Signup'
import Footer from '@/components/Footer'
import LoadingAnimation from '@/components/LoadingAnimation'

export default function Home() {
  // Enable smooth scrolling
  useEffect(() => {
    // Check if the browser supports scroll behavior
    if ('scrollBehavior' in document.documentElement.style) {
      document.documentElement.style.scrollBehavior = 'smooth'
    } else {
      // Fallback for browsers that don't support scroll-behavior
      const smoothScrollPolyfill = async () => {
        try {
          await import('smoothscroll-polyfill')
            .then((module) => module.default.polyfill())
        } catch (e) {
          console.warn('Smooth scroll polyfill failed to load', e)
        }
      }
      smoothScrollPolyfill()
    }

    // Clean up on component unmount
    return () => {
      document.documentElement.style.scrollBehavior = ''
    }
  }, [])

  return (
    <main className="min-h-screen overflow-x-hidden">
      <LoadingAnimation />
      <Header />
      <div className="pt-20">
        <Hero />
        <Features />
        <Plans />
        <Signup />
        <Footer />
      </div>
    </main>
  )
}