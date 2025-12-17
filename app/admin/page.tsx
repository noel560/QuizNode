'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Play, LogOut, Download, Upload, Settings, Home } from 'lucide-react'
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
  const [userName, setUserName] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }

    const storedName = localStorage.getItem('adminUsername');
    if (storedName) {
      setUserName(storedName);
    } else {
      setUserName('Admin'); // Fallback
    }

    fetchQuizzes()
  }, [])

  // useEffect(() => {
  //   document.title = 'QuizNode Admin - Kezelőfelület'
  // }, [])

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
    localStorage.removeItem('adminUsername')
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#202020] transition-colors duration-300 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#3a3a3a] rounded-xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 bg-clip-text mb-1">
                Admin Kezelőfelület
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                {userName ? `Szia, ${userName}!` : 'Üdvözöllek az admin felületen'}
              </p>
            </div>
            <div className="self-end sm:self-auto">
              <ThemeToggle />
            </div>
          </div>

          {/* Gombok - Mobilon 2 oszlopos rács, felette sima sor */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 md:gap-3">
            <button
              onClick={() => router.push('/')}
              className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm transition-all active:scale-95 border border-blue-200 dark:border-blue-900/30"
            >
              <Home size={16} />
              <span className="hidden xs:inline">Főoldal</span>
              <span className="xs:hidden">Főoldal</span>
            </button>

            <button
              onClick={() => router.push('/admin/create')}
              className="bg-gray-200 dark:bg-[#323232] text-gray-800 dark:text-white px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm transition-all border border-gray-300 dark:border-[#3a3a3a] active:scale-95 dark:hover:bg-[#363636] hover:bg-[#dbdde0]"
            >
              <Plus size={16} />
              Új Kvíz
            </button>

            <label className="bg-gray-200 dark:bg-[#323232] text-gray-800 dark:text-white px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm transition-all border border-gray-300 dark:border-[#3a3a3a] cursor-pointer active:scale-95 dark:hover:bg-[#363636] hover:bg-[#dbdde0]">
              <Upload size={16} />
              <span className="truncate">{importing ? '...' : 'Import'}</span>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" disabled={importing} />
            </label>

            <button
              onClick={() => router.push('/admin/settings')}
              className="bg-gray-200 dark:bg-[#323232] text-gray-800 dark:text-white px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm transition-all border border-gray-300 dark:border-[#3a3a3a] active:scale-95 dark:hover:bg-[#363636] hover:bg-[#dbdde0]"
            >
              <Settings size={16} />
              Beállítások
            </button>

            <button
              onClick={handleLogout}
              className="col-span-2 sm:col-auto bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm transition-all border border-red-200 dark:border-red-900/30 active:scale-95 hover:bg-red-100 dark:hover:bg-red-900/40"
            >
              <LogOut size={16} />
              Kilépés
            </button>
          </div>
        </div>

        {/* Kvíz lista - Mobilon 1 oszlop, tablettől 2, desktopon 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#3a3a3a] rounded-xl p-5 shadow-md flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2 dark:text-white truncate">{quiz.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {quiz.description || 'Nincs leírás'}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 border-t border-gray-100 dark:border-[#3a3a3a] pt-3">
                  <span>{quiz._count.questions} kérdés</span>
                  <span>{quiz._count.attempts} kitöltés</span>
                </div>

                {/* Akció gombok - Most már 4 gombbal */}
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => router.push(`/quiz/${quiz.id}`)}
                    className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg flex justify-center hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    title="Megtekintés"
                  >
                    <Play size={18} />
                  </button>

                  <button
                    onClick={() => router.push(`/admin/edit/${quiz.id}`)} // SZERKESZTÉS GOMB
                    className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg flex justify-center hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
                    title="Szerkesztés"
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    onClick={() => exportQuiz(quiz.id)}
                    className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg flex justify-center hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                    title="Exportálás"
                  >
                    <Download size={18} />
                  </button>

                  <button
                    onClick={() => deleteQuiz(quiz.id)}
                    className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    title="Törlés"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {quizzes.length === 0 && !loading && (
          <div className="text-center py-12 bg-white dark:bg-[#2b2b2b] rounded-xl border border-dashed border-gray-400">
            <p className="text-gray-500">Még nincsenek kvízek.</p>
          </div>
        )}
      </div>
    </div>
  )
}