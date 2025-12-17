'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Key } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

export default function AdminSettings() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
    }
  }, [])

  // useEffect(() => {
  //   document.title = 'QuizNode Admin - Beállítások'
  // }, [])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Az új jelszavak nem egyeznek!')
      return
    }

    if (newPassword.length < 6) {
      setError('A jelszónak legalább 6 karakter hosszúnak kell lennie!')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Jelszó sikeresen megváltoztatva!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setError(data.error || 'Hiba történt')
      }
    } catch {
      setError('Hálózati hiba')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#202020] transition-colors duration-300 p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#3a3a3a] rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/admin')}
              className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white flex items-center gap-2 transition-all"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Vissza az admin felületre</span>
              <span className="sm:hidden text-sm font-semibold">Vissza</span>
            </button>
            <ThemeToggle />
          </div>
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            Beállítások
          </h1>
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#3a3a3a] rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Key className="text-blue-600 dark:text-blue-400" size={24} />
            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Jelszó változtatás
            </h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Jelenlegi jelszó
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-[#3a3a3a]
                           bg-gray-100 dark:bg-[#202020] text-gray-800 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Új jelszó
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-[#3a3a3a]
                           bg-gray-100 dark:bg-[#202020] text-gray-800 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
              />
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Legalább 6 karakter
              </p>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Új jelszó megerősítése
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-[#3a3a3a]
                           bg-gray-100 dark:bg-[#202020] text-gray-800 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-100 dark:bg-red-500/20 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 dark:bg-green-500/20 border border-green-400 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40
                         disabled:from-gray-400 disabled:to-gray-400
                         py-3 rounded-lg font-bold
                         flex items-center justify-center gap-2
                         transition-all"
            >
              <Save size={20} />
              {loading ? 'Mentés...' : 'Jelszó mentése'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
