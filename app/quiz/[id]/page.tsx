'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Loader2, Home } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

interface Question {
  id: string
  questionText: string
  questionType: string
  options: string[]
  correctAnswers: number[]
  order: number
}

interface Quiz {
  id: string
  title: string
  description: string | null
  questions: Question[]
}

export default function QuizPlayer() {
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [answers, setAnswers] = useState<number[][]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchQuiz()
  }, [quizId])

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`/api/quiz/${quizId}`)
      const data = await res.json()

      data.questions = data.questions.map((q: any) => ({
        ...q,
        options: JSON.parse(q.options),
        correctAnswers: JSON.parse(q.correctAnswers)
      }))

      setQuiz(data)
      setAnswers(Array(data.questions.length).fill([]))
    } catch (error) {
      console.error('Hiba a kvíz betöltésekor:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (questionIndex: number, optionIndex: number) => {
    const question = quiz!.questions[questionIndex]
    const newAnswers = [...answers]

    if (question.questionType === 'single' || question.questionType === 'truefalse') {
      newAnswers[questionIndex] = [optionIndex]
    } else {
      if (newAnswers[questionIndex].includes(optionIndex)) {
        newAnswers[questionIndex] = newAnswers[questionIndex].filter(i => i !== optionIndex)
      } else {
        newAnswers[questionIndex] = [...newAnswers[questionIndex], optionIndex]
      }
    }

    setAnswers(newAnswers)
  }

  const handleSubmit = async () => {
    if (answers.some(a => a.length === 0)) {
      alert('Válaszolj meg minden kérdést!')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          answers
        })
      })

      const result = await res.json()
      router.push(`/results/${result.attemptId}`)
    } catch (error) {
      alert('Hiba történt a beküldés során')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#202020] transition-colors duration-300 flex items-center justify-center">
        <Loader2 className="text-blue-600 animate-spin" size={48} />
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#202020] transition-colors duration-300 flex items-center justify-center">
        <div className="text-red-600 text-2xl">Kvíz nem található</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#202020] transition-colors duration-300 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#3a3a3a] rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-gray-600 dark:text-gray-400">{quiz.description}</p>
              )}
              <div className="mt-4 text-gray-500 dark:text-gray-500">
                📝 {quiz.questions.length} kérdés
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />

              <button
                onClick={() => router.push('/')}
                className="bg-gray-200 dark:bg-[#323232] hover:bg-gray-300 dark:hover:bg-[#3a3a3a] text-gray-800 dark:text-white p-2 rounded-lg transition-all"
              >
                <Home size={20} />
              </button>

            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4 mb-6">
          {quiz.questions.map((question, qIndex) => {
            const userAnswers = answers[qIndex] || []

            return (
              <div key={question.id} className="bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#3a3a3a] rounded-xl shadow-md p-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shrink-0">
                    {qIndex + 1}
                  </span>
                  <p className="text-gray-800 dark:text-white flex-1">{question.questionText}</p>
                  {question.questionType === 'multiple' && (
                    <span className="text-amber-600 dark:text-amber-400 text-sm">(többválasztós)</span>
                  )}
                </div>

                <div className="space-y-2 ml-12">
                  {question.options.map((option, oIndex) => {
                    const isSelected = userAnswers.includes(oIndex)

                    return (
                      <button
                        key={oIndex}
                        onClick={() => handleAnswer(qIndex, oIndex)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all border ${isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-[#202020] text-gray-800 dark:text-white border-gray-300 dark:border-[#3a3a3a] hover:bg-gray-100 dark:hover:bg-[#323232]'
                          }`}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Submit Button */}
        <div className="sticky bottom-4">
          <button
            onClick={handleSubmit}
            disabled={submitting || answers.some(a => a.length === 0)}
            className="w-full bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-lg text-lg font-bold shadow-lg transition-all"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                Értékelés...
              </span>
            ) : answers.some(a => a.length === 0) ? (
              'Válaszolj meg minden kérdést!'
            ) : (
              'Beküldés és Értékelés'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}