import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  return (
    <header className="fixed top-0 w-full bg-white dark:bg-secondary z-30 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link href="/" className="flex items-center">
              <span className="sr-only">SaaS Logo</span>
              <div className="h-8 w-8 sm:h-10 sm:w-10 relative">
                {/* Replace with your actual logo */}
                <div className="w-full h-full bg-primary rounded-md flex items-center justify-center text-white font-bold">
                  S
                </div>
              </div>
              <span className="ml-2 text-xl font-bold text-secondary dark:text-white">SaaS Product</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-10">
            <Link href="#features" className="text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary">
              Features
            </Link>
            <Link href="#plans" className="text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary">
              Plans
            </Link>
            <Link href="#contact" className="text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary">
              Contact
            </Link>
          </nav>
          
          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
            <Link 
              href="https://app.example.com" 
              className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary/90"
            >
              Go to App
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}