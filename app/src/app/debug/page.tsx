'use client'

import { useEffect, useState } from 'react'

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<{[key: string]: string}>({})
  
  useEffect(() => {
    // Collect environment variables for debugging
    const vars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'undefined',
      ANON_KEY_PREFIX: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
        `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10)}...` : 'undefined',
      ANON_KEY_LENGTH: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length?.toString() || 'undefined',
      NODE_ENV: process.env.NODE_ENV || 'undefined',
    }
    
    setEnvVars(vars)
    
    // Test a direct fetch to Supabase
    const testSupabaseConnection = async () => {
      try {
        console.log('Testing direct connection to Supabase...')
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
          method: 'GET',
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            'Content-Type': 'application/json'
          }
        })
        
        console.log('Response status:', response.status, response.statusText)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Response error:', errorText)
        } else {
          const data = await response.json()
          console.log('Supabase connection successful, got settings:', data)
        }
      } catch (error) {
        console.error('Fetch error:', error)
      }
    }
    
    testSupabaseConnection()
  }, [])
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Environment Debug</h1>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Environment Variables</h2>
          
          <div className="space-y-2">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-200 dark:border-gray-700 py-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">{key}</span>
                <span className="text-gray-600 dark:text-gray-400 font-mono text-sm">{value}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              Connection Test Results
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check the browser console for connection test results.
            </p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <a href="/auth/login" className="text-primary hover:underline">
            Return to login page
          </a>
        </div>
      </div>
    </div>
  )
}