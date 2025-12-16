'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CheckCircle, XCircle, Home, RotateCcw, Loader2 } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

interface DetailedAnswer {
  questionId: string
  questionText: string
  questionType: string
  options: string[]
  userAnswers: number[]
  correctAnswers: number[]
  isCorrect: boolean
}

interface Result {
  id: string
  quizId: string
  quiz: {
    title: string
    description: string | null
  }
  score: number
  totalQuestions: number
  answers: DetailedAnswer[]
  completedAt: string
}

export default function ResultsPage() {
  const router = useRouter()
  const params = useParams()
  const attemptId = params.id as string

  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResult()
  }, [attemptId])

  const fetchResult = async () => {
    try {
      const res = await fetch(`/api/results/${attemptId}`)
      const data = await res.json()
      data.answers = JSON.parse(data.answers)
      setResult(data)
    } catch (error) {
      console.error('Hiba az eredmény betöltésekor:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#202020] transition-colors duration-300 flex items-center justify-center">
        <Loader2 className="text-blue-600 animate-spin" size={48} />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#202020] transition-colors duration-300 flex items-center justify-center">
        <div className="text-red-600 text-2xl">Eredmény nem található</div>
      </div>
    )
  }

  const percentage = Math.round((result.score / result.totalQuestions) * 100)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#202020] transition-colors duration-300 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header - Results Summary */}
        <div className="bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#3a3a3a] rounded-xl shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {result.quiz.title}
            </h1>
            <ThemeToggle />
          </div>

          <div className="bg-gray-100 dark:bg-[#202020] border border-gray-300 dark:border-[#3a3a3a] rounded-xl p-6 mb-4">
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">
                <span className={percentage >= 75 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}>
                  {result.score}
                </span>
                <span className="text-gray-400"> / {result.totalQuestions}</span>
              </div>
              <div className="text-2xl text-gray-700 dark:text-gray-300 mb-4">
                {percentage}% helyes válasz
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {percentage >= 90 ? "🎉 Kiváló! Basszus, te tényleg tudod ezt!" :
                  percentage >= 75 ? "👍 Nagyon jó! Csak pár apróság maradt." :
                    percentage >= 60 ? "😊 Jó munka! Van még min dolgozni." :
                      percentage >= 50 ? "🤔 Megvan az alap, de tanulj még rá!" :
                        "😅 Basszus, ezt elrontottad. Tanulj még rá és próbáld újra!"}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push(`/quiz/${result.quizId}`)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              <RotateCcw size={20} />
              Újra próbálom
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 bg-gray-200 dark:bg-[#323232] hover:bg-gray-300 dark:hover:bg-[#3a3a3a] text-gray-800 dark:text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all border border-gray-300 dark:border-[#3a3a3a] shadow-md hover:shadow-lg"
            >
              <Home size={20} />
              Főoldal
            </button>
          </div>
        </div>

        {/* Detailed Answers */}
        <div className="bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#3a3a3a] rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">Részletes megoldások</h2>
        </div>

        <div className="space-y-4">
          {result.answers.map((answer, index) => (
            <div
              key={answer.questionId}
              className={`bg-white dark:bg-[#2b2b2b] border-2 rounded-xl shadow-md p-6 ${answer.isCorrect ? 'border-green-500' : 'border-red-500'
                }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold flex-shrink-0">
                  {index + 1}
                </span>
                <p className="text-gray-800 dark:text-white flex-1">{answer.questionText}</p>
                {answer.isCorrect ? (
                  <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
                ) : (
                  <XCircle className="text-red-500 flex-shrink-0" size={24} />
                )}
              </div>

              <div className="space-y-2 ml-12">
                {answer.options.map((option, oIndex) => {
                  const isUserAnswer = answer.userAnswers.includes(oIndex)
                  const isCorrectAnswer = answer.correctAnswers.includes(oIndex)

                  let bgColor = 'bg-gray-100 dark:bg-[#202020] text-gray-800 dark:text-gray-300'
                  let icon = null

                  if (isCorrectAnswer) {
                    bgColor = 'bg-green-600 text-white'
                    icon = <CheckCircle size={20} className="flex-shrink-0" />
                  } else if (isUserAnswer && !isCorrectAnswer) {
                    bgColor = 'bg-red-600 text-white'
                    icon = <XCircle size={20} className="flex-shrink-0" />
                  }

                  return (
                    <div
                      key={oIndex}
                      className={`px-4 py-3 rounded-lg flex items-center gap-3 ${bgColor}`}
                    >
                      {icon}
                      <span className="flex-1">{option}</span>
                      {isUserAnswer && !isCorrectAnswer && (
                        <span className="text-xs bg-red-800 px-2 py-1 rounded">
                          Te ezt választottad
                        </span>
                      )}
                      {isCorrectAnswer && (
                        <span className="text-xs bg-green-800 px-2 py-1 rounded">
                          Helyes válasz
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}