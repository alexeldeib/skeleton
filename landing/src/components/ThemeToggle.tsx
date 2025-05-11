'use client'

import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light')

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    setTheme(savedTheme)
    applyTheme(savedTheme)
  }, [])

  // Apply theme to HTML element
  const applyTheme = (newTheme: string) => {
    const root = document.documentElement
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', newTheme)
  }

  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-10 h-10 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 3V4M18.3643 5.63623L17.6572 6.34334M21 12H20M18.3643 18.3638L17.6572 17.6567M12 20V21M6.34315 17.6567L5.63604 18.3638M4 12H3M6.34315 6.34334L5.63604 5.63623"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.23129 2.24048C9.24338 1.78695 10.1202 2.81145 9.80357 3.70098C8.72924 6.71928 9.38932 10.1474 11.6193 12.3765C13.8606 14.617 17.3114 15.2645 20.3395 14.1661C21.2206 13.8517 22.2454 14.7335 21.7842 15.7347C21.7747 15.7552 21.7651 15.7757 21.7554 15.7961C19.9705 19.6861 15.8922 22 11.3804 22C5.20703 22 0.221298 16.9931 0.221298 11C0.221298 6.44244 2.58071 2.47017 6.22122 0.754829C6.24158 0.745203 6.26201 0.735668 6.28252 0.726225C7.27323 0.251899 8.2349 0.74322 8.23129 2.24048Z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  )
}