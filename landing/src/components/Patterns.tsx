export function HeroPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute top-0 left-0 right-0 w-full opacity-20 dark:opacity-10"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid-pattern"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 10 V0 H10 V10 H0"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-300 dark:text-gray-700"
            />
          </pattern>
          <linearGradient id="fade-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.2" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
          <mask id="fade-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="url(#fade-gradient)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" mask="url(#fade-mask)" />
        
        {/* Animated geometric shapes */}
        <circle cx="15%" cy="20%" r="60" fill="url(#grid-pattern)" className="animate-pulse-slow opacity-30" />
        <rect x="70%" y="70%" width="120" height="120" rx="20" fill="url(#grid-pattern)" className="animate-float opacity-30" />
        <path d="M70 40 L120 40 L95 80 Z" fill="url(#grid-pattern)" className="animate-float opacity-30" style={{ animationDelay: '2s' }} />
      </svg>
    </div>
  )
}

export function FeaturePattern() {
  return (
    <div className="absolute bottom-0 left-0 w-full h-1/2 overflow-hidden pointer-events-none">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
      <svg
        className="absolute bottom-0 left-0 right-0 w-full opacity-20 dark:opacity-10"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <path
          d="M0,1000 C200,800 400,900 600,800 C800,700 1000,800 1000,1000 L0,1000 Z"
          fill="url(#grid-pattern)"
          className="text-primary dark:text-primary opacity-10"
        />
      </svg>
    </div>
  )
}

export function PricingPattern() {
  return (
    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-1/2 aspect-square opacity-30 pointer-events-none">
      <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="pricing-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#pricing-gradient)" className="text-primary dark:text-accent" />
      </svg>
    </div>
  )
}

export function FooterPattern() {
  return (
    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
  )
}