'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AuthPanel from '@/components/auth/AuthPanel'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false) // Start with loading=false to show the form by default
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        // Make sure Supabase client exists
        if (!supabase) {
          console.error('Supabase client is undefined')
          setError('Supabase client initialization failed')
          return
        }
        
        setLoading(true)
        const { data, error } = await supabase.auth.getUser()
          .catch(err => {
            console.log('Auth check error (caught):', err)
            // Always allow access to login page on error
            return { data: { user: null }, error: err }
          })
        
        if (error) {
          console.log('Auth error (returned):', error)
          // Don't treat session missing as an error for the login page
          if (error.message !== 'Auth session missing!') {
            setError(`Authentication error: ${error.message}`)
          }
          setLoading(false)
          return
        }
        
        if (data?.user) {
          // User is already logged in, redirect to dashboard
          router.push('/dashboard')
        } else {
          // No user, show the login form
          setLoading(false)
        }
      } catch (error) {
        console.error('Unexpected error during auth check:', error)
        setError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setLoading(false)
      }
    }

    // Run auth check once
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
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 dark:bg-red-200 dark:text-red-900 rounded-md">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}

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