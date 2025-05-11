import { FeaturePattern } from './Patterns'

export default function Features() {
  const features = [
    {
      title: 'Powerful Analytics',
      description: 'Gain valuable insights with our comprehensive analytics dashboard. Track performance metrics and make data-driven decisions.',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      delay: '0',
    },
    {
      title: 'Seamless Integration',
      description: 'Connect with your favorite tools and services. Our platform integrates with various third-party applications for a smooth workflow.',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      delay: '100',
    },
    {
      title: 'Collaborative Workspace',
      description: 'Work together with your team in real-time. Share documents, assign tasks, and track progress all in one place.',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      delay: '200',
    },
    {
      title: 'Enterprise Security',
      description: 'Your data is safe with us. We implement industry-leading security measures to protect your sensitive information.',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      delay: '300',
    },
  ]

  return (
    <div id="features" className="section-padding relative bg-surface dark:bg-gray-900 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-80 -left-80 w-96 h-96 bg-primary/5 rounded-full" />
        <div className="absolute top-1/3 -right-80 w-96 h-96 bg-accent/5 rounded-full" />
        <FeaturePattern />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary-700">
              Powerful Features
            </span>
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-600 dark:text-gray-300 mx-auto">
            Everything you need to boost productivity and grow your business
          </p>
        </div>

        <div className="mt-16 max-w-7xl mx-auto">
          <div className="grid gap-8 md:gap-12 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group glossy-card border-0 overflow-hidden flex flex-col transform transition-all duration-500 hover:scale-105"
                style={{
                  animationDelay: `${feature.delay}ms`,
                  transitionDelay: `${feature.delay}ms`
                }}
              >
                <div className="flex flex-col h-full z-10 p-6">
                  {/* Colored gradient background that shows on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />

                  <div className="relative z-10">
                    {/* Icon in gradient circle */}
                    <div className="gradient-purple rounded-lg w-12 h-12 flex items-center justify-center text-white mb-5 shadow-sm">
                      {feature.icon}
                    </div>

                    <h3 className="text-lg font-semibold text-secondary dark:text-white">{feature.title}</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </div>

                  {/* Subtle arrow button that appears on hover */}
                  <div className="mt-auto pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <a href="#" className="inline-flex items-center text-primary font-medium">
                      <span>Learn more</span>
                      <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature highlight */}
        <div className="mt-24 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-secondary to-primary rounded-2xl shadow-stripe overflow-hidden">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                <h3 className="text-2xl md:text-3xl font-bold text-white">
                  Try our powerful dashboard
                </h3>
                <p className="mt-4 text-white/80">
                  Experience the full power of our analytics platform with a 14-day free trial. No credit card required.
                </p>
                <div className="mt-8">
                  <a
                    href="#"
                    className="inline-block bg-white text-primary font-medium px-6 py-3 rounded-lg shadow-stripe-button hover:shadow-lg transition-all duration-300 hover:translate-y-[-1px]"
                  >
                    Start free trial
                  </a>
                </div>
              </div>
              <div className="relative min-h-[300px]">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Placeholder for dashboard image */}
                  <div className="w-full h-64 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}