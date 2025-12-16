'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, BookOpen, Shield, Loader2 } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

interface Quiz {
  id: string
  title: string
  description: string | null
  _count: {
    questions: number
    attempts: number
  }
}

export default function HomePage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const res = await fetch('/api/quiz')
      const data = await res.json()
      setQuizzes(data)
    } catch (error) {
      console.error('Hiba a kvízek betöltésekor:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#202020] flex items-center justify-center transition-colors duration-300">
        <Loader2 className="text-blue-600 animate-spin" size={48} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#202020] transition-colors duration-300 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          <div className="text-center">
            <h1 className="text-5xl font-bold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
              Quiz App
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-xl">
              Válassz egy kvízt és teszteld a tudásod! 🚀
            </p>
          </div>
        </div>

        {/* Admin Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => router.push('/admin')}
            className="bg-white dark:bg-[#2b2b2b] hover:bg-gray-100 dark:hover:bg-[#323232] text-gray-800 dark:text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 border border-gray-300 dark:border-[#3a3a3a] shadow-md hover:shadow-lg"
          >
            <Shield size={18} />
            Admin
          </button>
        </div>

        {/* Quiz List */}
        {quizzes.length === 0 ? (
          <div className="bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#3a3a3a] rounded-xl shadow-lg p-12 text-center">
            <BookOpen className="mx-auto text-gray-400 dark:text-gray-600 mb-4" size={64} />
            <p className="text-gray-600 dark:text-gray-400 text-xl">
              Még nincsenek elérhető kvízek
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {quizzes.map((quiz, index) => (
              <div
                key={quiz.id}
                onClick={() => router.push(`/quiz/${quiz.id}`)}
                className="bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#3a3a3a] rounded-xl shadow-md hover:shadow-xl p-6 transition-all duration-200 hover:scale-[1.02]"
                style={{
                  animation: `slideUp 0.3s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {quiz.title}
                  </h3>
                  {quiz.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {quiz.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    📝 {quiz._count.questions} kérdés
                  </span>
                  <span className="flex items-center gap-1">
                    📊 {quiz._count.attempts} kitöltés
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/quiz/${quiz.id}`)
                  }}
                  className="w-full bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Play size={20} />
                  Kvíz indítása
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 dark:text-gray-600 text-sm">
          <p>Készítette: Quiz App 2024</p>
        </div>
      </div>
    </div>
  )
}