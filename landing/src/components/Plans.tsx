import Link from 'next/link'

export default function Plans() {
  const plans = [
    {
      name: 'Basic',
      description: 'Perfect for individuals and small projects',
      features: [
        'Core analytics features',
        'Up to 3 team members',
        '1GB storage',
        'Basic support',
      ],
      isPopular: false,
    },
    {
      name: 'Pro',
      description: 'Ideal for growing teams and businesses',
      features: [
        'All Basic features',
        'Up to 10 team members',
        '10GB storage',
        'Priority support',
        'Advanced analytics',
      ],
      isPopular: true,
    },
    {
      name: 'Enterprise',
      description: 'For large organizations with complex needs',
      features: [
        'All Pro features',
        'Unlimited team members',
        '100GB storage',
        'Dedicated support',
        'Custom integrations',
        'Advanced security',
      ],
      isPopular: false,
    },
  ]

  return (
    <div id="plans" className="py-16 bg-white dark:bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-secondary dark:text-white sm:text-4xl">
            Plans for Every Need
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-600 dark:text-gray-300 mx-auto">
            Choose the perfect plan to help your team succeed
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden 
                ${plan.isPopular ? 'ring-2 ring-primary transform scale-105 md:scale-110' : ''}
              `}
            >
              {plan.isPopular && (
                <div className="bg-primary text-white text-center py-2 font-medium">
                  Most Popular
                </div>
              )}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-secondary dark:text-white">{plan.name}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{plan.description}</p>
                <p className="mt-4 text-gray-500 dark:text-gray-400">
                  Pricing coming soon
                </p>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="ml-3 text-gray-700 dark:text-gray-300">{feature}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link 
                    href="#signup" 
                    className={`block w-full px-4 py-2 border border-transparent rounded-md shadow text-center font-medium 
                      ${plan.isPopular 
                        ? 'bg-primary text-white hover:bg-primary/90' 
                        : 'bg-gray-100 dark:bg-gray-700 text-secondary dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'}`
                    }
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}