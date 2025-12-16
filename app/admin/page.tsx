'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Play, LogOut, Download, Upload, Settings } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

interface Quiz {
  id: string
  title: string
  description: string | null
  createdAt: string
  _count: {
    questions: number
    attempts: number
  }
}

export default function AdminDashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/quiz', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.status === 401) {
        router.push('/admin/login')
        return
      }

      const data = await res.json()
      setQuizzes(data)
    } catch (error) {
      console.error('Hiba a kvízek betöltésekor:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteQuiz = async (id: string) => {
    if (!confirm('Biztosan törlöd ezt a kvízt?')) return

    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/quiz?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.ok) {
        setQuizzes(quizzes.filter(q => q.id !== id))
      }
    } catch (error) {
      console.error('Hiba a kvíz törlésekor:', error)
    }
  }

  const exportQuiz = async (quizId: string) => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/quiz/export?id=${quizId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Hiba az exportálás során:', error)
      alert('Nem sikerült exportálni a kvízt')
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        alert('Kvíz sikeresen importálva!')
        fetchQuizzes()
      } else {
        alert('Hiba történt az importálás során')
      }
    } catch (error) {
      console.error('Import error:', error)
      alert('Hibás JSON fájl')
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#202020] transition-colors duration-300 flex items-center justify-center">
        <div className="text-blue-600 text-2xl">Betöltés...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#202020] transition-colors duration-300 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#3a3a3a] rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Kvízek kezelése</p>
            </div>
            <ThemeToggle />
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="bg-gray-200 dark:bg-[#323232] hover:bg-gray-300 dark:hover:bg-[#3a3a3a] text-gray-800 dark:text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all border border-gray-300 dark:border-[#3a3a3a] shadow-sm hover:shadow-md">
              <Upload size={18} />
              {importing ? 'Importálás...' : 'Import Quiz'}
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                disabled={importing}
              />
            </label>
            <button
              onClick={() => router.push('/admin/create')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
            >
              <Plus size={18} />
              Új Kvíz
            </button>
            <button
              onClick={() => router.push('/admin/settings')}
              className="bg-gray-200 dark:bg-[#323232] hover:bg-gray-300 dark:hover:bg-[#3a3a3a] text-gray-800 dark:text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all border border-gray-300 dark:border-[#3a3a3a] shadow-sm hover:shadow-md"
            >
              <Settings size={18} />
              Beállítások
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-200 dark:bg-[#323232] hover:bg-gray-300 dark:hover:bg-[#3a3a3a] text-gray-800 dark:text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all border border-gray-300 dark:border-[#3a3a3a] shadow-sm hover:shadow-md"
            >
              <LogOut size={18} />
              Kilépés
            </button>
          </div>
        </div>

        {/* Quiz List */}
        {quizzes.length === 0 ? (
          <div className="bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#3a3a3a] rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-xl mb-4">Még nincsenek kvízek</p>
            <button
              onClick={() => router.push('/admin/create')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-bold inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Hozz létre egyet!
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#3a3a3a] rounded-xl shadow-md hover:shadow-lg p-6 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {quiz.title}
                    </h3>
                    {quiz.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{quiz.description}</p>
                    )}
                    <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-500">
                      <span>📝 {quiz._count.questions} kérdés</span>
                      <span>📊 {quiz._count.attempts} kitöltés</span>
                      <span>📅 {new Date(quiz.createdAt).toLocaleDateString('hu-HU')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/quiz/${quiz.id}`)}
                      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-all shadow-sm hover:shadow-md"
                      title="Kvíz indítása"
                    >
                      <Play size={18} />
                    </button>
                    <button
                      onClick={() => router.push(`/admin/edit/${quiz.id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all shadow-sm hover:shadow-md"
                      title="Szerkesztés"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => exportQuiz(quiz.id)}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white p-2 rounded-lg transition-all shadow-sm hover:shadow-md"
                      title="Export JSON"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={() => deleteQuiz(quiz.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-all shadow-sm hover:shadow-md"
                      title="Törlés"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}