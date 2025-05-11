'use client'

import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Plans from '@/components/Plans'
import Signup from '@/components/Signup'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-16">
        <Hero />
        <Features />
        <Plans />
        <Signup />
        <Footer />
      </div>
    </main>
  )
}