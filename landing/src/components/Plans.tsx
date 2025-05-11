import Link from 'next/link'
import { useState } from 'react'
import { PricingPattern } from './Patterns'

export default function Plans() {
  const [billingPeriod, setBillingPeriod] = useState('monthly')

  const plans = [
    {
      name: 'Basic',
      description: 'Perfect for individuals and small projects',
      price: {
        monthly: '$12',
        yearly: '$120',
      },
      savings: 'Save $24 yearly',
      features: [
        'Core analytics features',
        'Up to 3 team members',
        '1GB storage',
        'Basic support',
      ],
      isPopular: false,
      cta: 'Start with Basic',
      ctaAlt: 'Try free for 14 days',
    },
    {
      name: 'Pro',
      description: 'Ideal for growing teams and businesses',
      price: {
        monthly: '$29',
        yearly: '$290',
      },
      savings: 'Save $58 yearly',
      features: [
        'All Basic features',
        'Up to 10 team members',
        '10GB storage',
        'Priority support',
        'Advanced analytics',
      ],
      isPopular: true,
      cta: 'Start with Pro',
      ctaAlt: 'Try free for 14 days',
    },
    {
      name: 'Enterprise',
      description: 'For large organizations with complex needs',
      price: {
        monthly: 'Custom',
        yearly: 'Custom',
      },
      features: [
        'All Pro features',
        'Unlimited team members',
        '100GB storage',
        'Dedicated support',
        'Custom integrations',
        'Advanced security',
      ],
      isPopular: false,
      cta: 'Contact Sales',
      ctaAlt: 'Schedule a demo',
    },
  ]

  return (
    <div id="plans" className="section-padding bg-white dark:bg-secondary relative">
      {/* Background decorations */}
      <PricingPattern />
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-secondary dark:text-white">
            Plans for Every Need
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-600 dark:text-gray-300 mx-auto">
            Choose the perfect plan to help your team succeed
          </p>

          {/* Billing period toggle */}
          <div className="mt-10 inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`py-2 px-4 rounded-md text-sm font-medium focus:outline-none transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-white dark:bg-gray-700 shadow text-secondary dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`py-2 px-4 rounded-md text-sm font-medium focus:outline-none transition-all flex items-center ${
                billingPeriod === 'yearly'
                  ? 'bg-white dark:bg-gray-700 shadow text-secondary dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Yearly <span className="ml-1 text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`
                relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden
                transition-all duration-300 transform shadow-stripe-sm
                ${plan.isPopular
                  ? 'border-2 border-primary translate-y-[-8px] lg:scale-105 shadow-stripe'
                  : 'border border-gray-100 dark:border-gray-700'
                }
              `}
            >
              {plan.isPopular && (
                <div className="absolute top-0 inset-x-0">
                  <div className="h-1.5 w-full gradient-purple" />
                  <div className="absolute top-0 inset-x-0 flex justify-center">
                    <span className="px-3 py-0.5 text-xs font-semibold tracking-wide uppercase rounded-b-lg text-white gradient-purple transform translate-y-0.5">
                      Most Popular
                    </span>
                  </div>
                </div>
              )}

              <div className="p-8">
                <div className="flex flex-col h-full">
                  <div>
                    {/* Plan name, description, price */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold text-secondary dark:text-white">{plan.name}</h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">{plan.description}</p>
                      </div>
                      {/* Only show badge for custom pricing */}
                      {plan.price[billingPeriod] === 'Custom' && (
                        <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md text-xs font-medium">
                          Contact sales
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mt-5">
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-secondary dark:text-white">
                          {plan.price[billingPeriod]}
                        </span>
                        {plan.price[billingPeriod] !== 'Custom' && (
                          <span className="ml-1 text-gray-500 dark:text-gray-400">/{billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
                        )}
                      </div>
                      {/* Savings callout for yearly plans */}
                      {billingPeriod === 'yearly' && plan.savings && (
                        <p className="mt-1 text-sm text-primary">{plan.savings}</p>
                      )}
                    </div>

                    {/* Feature list */}
                    <ul className="mt-8 space-y-4">
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
                  </div>

                  {/* CTA Buttons */}
                  <div className="mt-8 flex flex-col space-y-3">
                    <Link
                      href="#signup"
                      className={
                        plan.isPopular
                          ? "btn-primary w-full text-center"
                          : "bg-white text-primary border border-primary hover:bg-primary/5 w-full py-3 px-4 rounded-lg text-center font-medium transition-all"
                      }
                    >
                      {plan.cta}
                    </Link>
                    <Link
                      href="#"
                      className="text-sm text-center text-gray-600 dark:text-gray-300 hover:text-primary"
                    >
                      {plan.ctaAlt}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise banner */}
        <div className="mt-20 max-w-7xl mx-auto bg-surface dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 lg:p-12">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-secondary dark:text-white">Need a custom solution?</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-2xl">
                We offer tailored enterprise solutions for organizations with specific requirements.
                Contact our sales team to discuss your needs.
              </p>
              <div className="mt-8">
                <a
                  href="#"
                  className="inline-flex items-center font-medium text-primary hover:text-primary-700 transition-colors"
                >
                  <span>Learn more about Enterprise</span>
                  <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="mt-8 lg:mt-0 flex justify-end">
              <a
                href="#"
                className="btn-primary"
              >
                Contact sales
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}