import { useState } from 'react'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Simulate API call to backend
    if (email) {
      setLoading(true)

      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 800))

      setSubmitted(true)
      setLoading(false)
    }
  }

  return (
    <div
      id="signup"
      className="section-padding relative overflow-hidden"
    >
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-surface dark:from-primary/10 dark:via-secondary-900 dark:to-secondary-900 -z-10" />

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-xl opacity-70" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent/5 rounded-full blur-xl opacity-70" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left content */}
            <div className="lg:pr-8 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium inline-block mb-4">
                  Get Started Today
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-secondary dark:text-white">
                  Ready to transform your workflow?
                </h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                  Join thousands of teams already using our platform to streamline their processes and boost productivity.
                </p>

                {/* Statistics */}
                <div className="mt-10 grid grid-cols-2 gap-8 lg:gap-16">
                  <div>
                    <div className="font-bold text-4xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                      10k+
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Active users
                    </p>
                  </div>
                  <div>
                    <div className="font-bold text-4xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                      99.9%
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Uptime guarantee
                    </p>
                  </div>
                </div>

                {/* Testimonial */}
                <div className="mt-10 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-stripe-sm border border-gray-50 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    "This platform has revolutionized how our team works together.
                    The analytics and collaboration features are simply outstanding."
                  </p>
                  <div className="mt-4 flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      JD
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-secondary dark:text-white">Jane Doe</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">CTO, Example Company</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right form */}
            <div className="mt-12 lg:mt-0">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-stripe overflow-hidden">
                {submitted ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full gradient-purple mx-auto flex items-center justify-center">
                      <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="mt-4 text-2xl font-bold text-secondary dark:text-white">Thank you!</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                      We've sent a confirmation to your email. Check your inbox to get started.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-6 text-primary hover:text-primary-700 font-medium"
                    >
                      Return to signup
                    </button>
                  </div>
                ) : (
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-secondary dark:text-white">
                      Start your free trial
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                      No credit card required. Start using our platform in minutes.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                      <div>
                        <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="full-name"
                          name="full-name"
                          autoComplete="name"
                          required
                          className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary"
                          placeholder="Jane Doe"
                        />
                      </div>

                      <div>
                        <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email Address
                        </label>
                        <input
                          id="email-address"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary"
                          placeholder="jane@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Company
                        </label>
                        <input
                          id="company"
                          name="company"
                          type="text"
                          autoComplete="organization"
                          className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary dark:focus:border-primary"
                          placeholder="Your Company (Optional)"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className={`w-full rounded-lg gradient-purple text-white font-medium py-3 px-4 transition-all duration-300 hover:shadow-lg
                            ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:translate-y-[-1px] active:translate-y-[1px]'}`}
                        >
                          {loading ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </span>
                          ) : 'Get Started'}
                        </button>
                      </div>

                      <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
                        By signing up, you agree to our{' '}
                        <a href="#" className="font-medium text-primary hover:text-primary-700">
                          Terms
                        </a>{' '}
                        and{' '}
                        <a href="#" className="font-medium text-primary hover:text-primary-700">
                          Privacy Policy
                        </a>
                      </p>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}