'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AuthPanel from '@/components/auth/AuthPanel'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        router.push('/dashboard')
      } else {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="h-12 w-12 mx-auto bg-primary rounded-md flex items-center justify-center text-white font-bold text-2xl">
              S
            </div>
          </Link>
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome to SaaS App
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in or sign up to continue
          </p>
        </div>
        
        <AuthPanel />
        
        <div className="mt-6 text-center">
          <Link href="/" className="text-primary hover:underline">
            &larr; Back to home page
          </Link>
        </div>
      </div>
    </div>
  )
}