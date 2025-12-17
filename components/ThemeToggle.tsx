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
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
    window.dispatchEvent(new Event('themechange'))
  }

  if (!mounted) return <div className="w-10 h-10" />

  return (
    <button
      onClick={toggleTheme}
      className="group relative inline-flex h-9 w-16 items-center rounded-full 
                 bg-gray-200 dark:bg-[#323232] 
                 border border-gray-300 dark:border-[#444]
                 transition-all duration-300 focus:outline-none 
                 hover:border-blue-500/50 shadow-inner"
      aria-label="Téma váltása"
    >
      {/* Háttér ikonok (halványan) */}
      <div className="flex w-full justify-between px-2 text-gray-400 dark:text-gray-500">
        <Sun size={14} className={theme === 'light' ? 'opacity-0' : 'opacity-100'} />
        <Moon size={14} className={theme === 'dark' ? 'opacity-0' : 'opacity-100'} />
      </div>

      {/* Csúszka (Knob) */}
      <div
        className={`absolute left-1 flex h-7 w-7 items-center justify-center rounded-full 
                   bg-white dark:bg-[#202020] shadow-md ring-1 ring-black/5
                   transition-all duration-500 ease-out
                   ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}`}
      >
        {theme === 'dark' ? (
          <Moon size={14} className="text-blue-400 fill-blue-400/10" />
        ) : (
          <Sun size={14} className="text-orange-500 fill-orange-500/10" />
        )}
      </div>
    </button>
  )
}