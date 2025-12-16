'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('theme') as 'light' | 'dark'
    
    if (stored) {
      setTheme(stored)
      applyTheme(stored)
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const initial = prefersDark ? 'dark' : 'light'
      setTheme(initial)
      applyTheme(initial)
    }
  }, [])

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const html = document.documentElement
    
    if (newTheme === 'dark') {
      html.classList.add('dark')
      html.style.colorScheme = 'dark'
    } else {
      html.classList.remove('dark')
      html.style.colorScheme = 'light'
    }
    
    // Force repaint
    html.offsetHeight
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
    
    // Force full page re-render by triggering a style recalculation
    window.dispatchEvent(new Event('themechange'))
  }

  if (!mounted) {
    return <div className="w-14 h-7" />
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-8 bg-gray-300 dark:bg-gray-700 rounded-full transition-colors duration-300 border-2 border-gray-400 dark:border-gray-600 hover:scale-105 active:scale-95 shadow-md overflow-hidden"
      aria-label="Toggle theme"
    >
      <div
        className={`absolute top-px w-7 h-7 bg-blue-600 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg ${
          theme === 'dark' ? 'left-[calc(100%-26px)]' : 'left-0'
        }`}
      >
        {theme === 'dark' ? (
          <Moon size={14} className="text-white" />
        ) : (
          <Sun size={14} className="text-white" />
        )}
      </div>
    </button>
  )
}