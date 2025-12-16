'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Plus, Trash2, Save, ArrowLeft, Check, Loader2 } from 'lucide-react'

interface Question {
  questionText: string
  questionType: 'single' | 'multiple' | 'truefalse'
  options: string[]
  correctAnswers: number[]
}

export default function QuizEditPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string

  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchQuiz()
  }, [quizId])

  const fetchQuiz = async () => {
    // ... (fetchQuiz funkció változatlan)
    try {
      const res = await fetch(`/api/quiz/${quizId}`)
      const data = await res.json()

      setTitle(data.title)
      setDescription(data.description || '')

      // Parse questions
      const parsedQuestions = data.questions.map((q: any) => ({
        questionText: q.questionText,
        questionType: q.questionType,
        options: JSON.parse(q.options),
        correctAnswers: JSON.parse(q.correctAnswers)
      }))

      setQuestions(parsedQuestions)
    } catch (error) {
      console.error('Hiba a kvíz betöltésekor:', error)
      alert('Nem sikerült betölteni a kvízt')
      router.push('/admin')
    } finally {
      setLoading(false)
    }
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        questionType: 'single',
        options: ['', ''],
        correctAnswers: []
      }
    ])
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const addOption = (questionIndex: number) => {
    const updated = [...questions]
    updated[questionIndex].options.push('')
    setQuestions(updated)
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions]
    updated[questionIndex].options = updated[questionIndex].options.filter((_, i) => i !== optionIndex)
    updated[questionIndex].correctAnswers = updated[questionIndex].correctAnswers
      .filter(i => i !== optionIndex)
      .map(i => i > optionIndex ? i - 1 : i)
    setQuestions(updated)
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions]
    updated[questionIndex].options[optionIndex] = value
    setQuestions(updated)
  }

  const toggleCorrectAnswer = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions]
    const question = updated[questionIndex]

    if (question.questionType === 'single' || question.questionType === 'truefalse') {
      question.correctAnswers = [optionIndex]
    } else {
      if (question.correctAnswers.includes(optionIndex)) {
        question.correctAnswers = question.correctAnswers.filter(i => i !== optionIndex)
      } else {
        question.correctAnswers.push(optionIndex)
      }
    }

    setQuestions(updated)
  }

  const changeQuestionType = (index: number, type: 'single' | 'multiple' | 'truefalse') => {
    const updated = [...questions]
    updated[index].questionType = type

    if (type === 'truefalse') {
      updated[index].options = ['Igaz', 'Hamis']
      updated[index].correctAnswers = []
    }

    setQuestions(updated)
  }

  const handleSave = async () => {
    // ... (handleSave funkció változatlan)
    if (!title.trim()) {
      alert('Add meg a kvíz címét!')
      return
    }

    if (questions.length === 0) {
      alert('Adj hozzá legalább egy kérdést!')
      return
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.questionText.trim()) {
        alert(`A ${i + 1}. kérdés szövege hiányzik!`)
        return
      }
      if (q.options.some(opt => !opt.trim())) {
        alert(`A ${i + 1}. kérdésben van üres válaszlehetőség!`)
        return
      }
      if (q.correctAnswers.length === 0) {
        alert(`A ${i + 1}. kérdéshez jelölj meg helyes választ!`)
        return
      }
    }

    setSaving(true)

    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/quiz', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: quizId,
          title,
          description,
          questions
        })
      })

      if (res.ok) {
        router.push('/admin')
      } else {
        alert('Hiba történt a mentés során')
      }
    } catch (error) {
      alert('Hálózati hiba')
    } finally {
      setSaving(false)
    }
  }

  // Megfelelő betöltőképernyő a Fluent UI stílusban
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#202020] flex items-center justify-center transition-colors duration-300">
        <Loader2 className="text-blue-600 animate-spin" size={48} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#202020] transition-colors duration-300 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header and Actions */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            Vissza az admin felületre
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
          >
            <Save size={20} />
            {saving ? 'Mentés...' : 'Kvíz mentése'}
          </button>
        </div>

        {/* Quiz Details Card */}
        <div className="bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#3a3a3a] rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Kvíz szerkesztése
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cím
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-[#3a3a3a] rounded-lg bg-gray-50 dark:bg-[#323232] text-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Add meg a kvíz címét"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Leírás (opcionális)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-[#3a3a3a] rounded-lg bg-gray-50 dark:bg-[#323232] text-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Rövid leírás a kvízről"
              />
            </div>
          </div>
        </div>

        {/* Questions List */}
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Kérdések ({questions.length})
        </h2>
        <div className="space-y-6">
          {questions.map((question, qIndex) => (
            <div
              key={qIndex}
              className="bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#3a3a3a] rounded-xl shadow-lg p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                  {qIndex + 1}. Kérdés
                </h3>
                <button
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors duration-200 p-2 rounded-full hover:bg-red-50 dark:hover:bg-[#3c3c3c]"
                  title="Kérdés törlése"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {/* Question Text */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kérdés szövege
                </label>
                <textarea
                  value={question.questionText}
                  onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#3a3a3a] rounded-lg bg-gray-50 dark:bg-[#323232] text-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Írd be a kérdés szövegét"
                />
              </div>

              {/* Question Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kérdés típusa
                </label>
                <div className="flex gap-3">
                  {['single', 'multiple', 'truefalse'].map((type) => (
                    <button
                      key={type}
                      onClick={() => changeQuestionType(qIndex, type as 'single' | 'multiple' | 'truefalse')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        question.questionType === type
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-[#3a3a3a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#444444]'
                      }`}
                    >
                      {type === 'single' ? 'Egyszeres választás' : type === 'multiple' ? 'Többszörös választás' : 'Igaz/Hamis'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Válaszlehetőségek
                </label>
                {question.options.map((option, oIndex) => {
                  const isCorrect = question.correctAnswers.includes(oIndex)
                  return (
                    <div key={oIndex} className="flex items-center gap-3">
                      <button
                        onClick={() => toggleCorrectAnswer(qIndex, oIndex)}
                        className={`p-2 rounded-full transition-colors duration-200 border-2 ${
                          isCorrect
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'bg-white dark:bg-[#2b2b2b] border-gray-300 dark:border-[#3a3a3a] text-transparent hover:bg-green-50 dark:hover:bg-[#3c3c3c]'
                        }`}
                        title="Helyes válasz jelölése"
                      >
                        <Check size={16} />
                      </button>

                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        className={`grow px-4 py-2 border rounded-lg bg-gray-50 dark:bg-[#323232] text-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                          isCorrect ? 'border-green-400 dark:border-green-600' : 'border-gray-300 dark:border-[#3a3a3a]'
                        }`}
                        placeholder={`Válasz ${oIndex + 1}`}
                        disabled={question.questionType === 'truefalse'}
                      />

                      {(question.questionType !== 'truefalse' && question.options.length > 2) && (
                        <button
                          onClick={() => removeOption(qIndex, oIndex)}
                          className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-2 rounded-full"
                          title="Válaszlehetőség törlése"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  )
                })}
                {question.questionType !== 'truefalse' && (
                  <button
                    onClick={() => addOption(qIndex)}
                    className="w-full bg-gray-100 dark:bg-[#323232] hover:bg-gray-200 dark:hover:bg-[#3a3a3a] text-gray-600 dark:text-gray-400 border border-dashed border-gray-300 dark:border-[#444444] py-2 rounded-lg flex items-center justify-center gap-2 mt-2 transition-colors duration-200"
                  >
                    <Plus size={18} />
                    Válaszlehetőség hozzáadása
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Question Button */}
        <div className="mt-8 text-center">
          <button
            onClick={addQuestion}
            className="bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg mx-auto"
          >
            <Plus size={20} />
            Új kérdés hozzáadása
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 dark:text-gray-600 text-sm">
          <p>Készítette: Quiz App 2024</p>
        </div>
      </div>
    </div>
  )
}