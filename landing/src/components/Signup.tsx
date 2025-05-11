import { useState } from 'react'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Here you would typically send this to your backend
    // For now we'll just simulate the success case
    if (email) {
      setSubmitted(true)
    }
  }

  return (
    <div id="signup" className="py-16 bg-primary/10 dark:bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-secondary dark:text-white sm:text-4xl">
            Get Early Access
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Be the first to try our product when it launches. Sign up for our waitlist to receive exclusive updates.
          </p>
          
          {submitted ? (
            <div className="mt-8 p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-xl font-medium text-secondary dark:text-white">Thank you for signing up!</h3>
              <p className="mt-1 text-gray-600 dark:text-gray-300">We'll notify you when we launch.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="flex-grow w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm placeholder-gray-500 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Notify Me
                </button>
              </div>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                We care about your data. Read our{' '}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}