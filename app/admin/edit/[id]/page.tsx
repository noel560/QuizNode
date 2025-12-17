'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Plus, Trash2, Save, ArrowLeft, Check, Loader2, ChevronDown } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

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

  useEffect(() => {
    if (loading) {
      document.title = 'QuizNode Admin - Betöltés...'
    } else if (title) {
      // Ha a kvíz címe betöltődött
      document.title = `${title} szerkesztése`
    } else {
      // Ha betöltődött (és nem történt átirányítás), de valamiért még sincs címe
      document.title = 'QuizNode Admin - Szerkesztés'
    }
  }, [title, loading])

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
    } else {
      updated[index].options = ['', '']
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#202020] transition-colors duration-300 p-3 md:p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header - Kompakt mobilon */}
        <div className="bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#3a3a3a] rounded-xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm md:text-base"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Vissza az admin felületre</span>
              <span className="sm:hidden text-sm font-semibold">Vissza</span>
            </button>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-4 py-2 rounded-lg font-bold flex items-center gap-2 active:scale-95 disabled:opacity-50 text-sm transition-all"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? '...' : 'Mentés'}
              </button>
            </div>
          </div>

          <input
            placeholder="Kvíz címe"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-2 md:py-3 rounded-lg border border-gray-300 dark:border-[#3a3a3a] bg-gray-100 dark:bg-[#202020] text-gray-800 dark:text-white text-xl md:text-2xl font-bold focus:ring-2 focus:ring-blue-500 mb-3 outline-hidden"
          />

          <textarea
            placeholder="Kvíz leírása (opcionális)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#3a3a3a] bg-gray-100 dark:bg-[#202020] text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 outline-hidden text-sm"
          />
        </div>

        {/* Questions */}
        <div className="space-y-6 mb-8">
          {questions.map((q, qi) => (
            <div key={qi} className="bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#3a3a3a] rounded-xl shadow-md p-4 md:p-6">
              
              <div className="flex justify-between items-center mb-4 gap-2">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                    {qi + 1}. kérdés
                  </span>
                  <div className="relative shrink-0">
                    <select
                      value={q.questionType}
                      onChange={(e) => changeQuestionType(qi, e.target.value as any)}
                      className="appearance-none bg-gray-100 dark:bg-[#323232] text-gray-700 dark:text-gray-200 pl-3 pr-8 py-1 rounded-lg text-xs border border-gray-300 dark:border-[#444] outline-hidden cursor-pointer"
                    >
                      <option value="single">Egy válasz</option>
                      <option value="multiple">Több válasz</option>
                      <option value="truefalse">Igaz/Hamis</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                  </div>
                </div>
                
                <button onClick={() => removeQuestion(qi)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg shrink-0">
                  <Trash2 size={18} />
                </button>
              </div>

              <textarea
                placeholder="Kérdés szövege..."
                value={q.questionText}
                onChange={e => updateQuestion(qi, 'questionText', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#3a3a3a] bg-gray-50 dark:bg-[#202020] text-gray-800 dark:text-white mb-4 outline-hidden focus:ring-1 focus:ring-blue-500 text-sm md:text-base"
                rows={2}
              />

              <div className="space-y-2">
                {q.options.map((option, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <button
                      onClick={() => toggleCorrectAnswer(qi, oi)}
                      className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all ${
                        q.correctAnswers.includes(oi)
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 dark:border-[#444] text-transparent'
                      }`}
                    >
                      <Check size={20} />
                    </button>
                    
                    <input
                      placeholder={`${oi + 1}. válasz`}
                      value={option}
                      disabled={q.questionType === 'truefalse'}
                      onChange={e => updateOption(qi, oi, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-[#3a3a3a] bg-white dark:bg-[#2b2b2b] text-sm outline-hidden focus:border-blue-500"
                    />

                    {q.questionType !== 'truefalse' && q.options.length > 2 && (
                      <button onClick={() => removeOption(qi, oi)} className="p-2 text-gray-400 hover:text-red-500 shrink-0">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {q.questionType !== 'truefalse' && (
                <button
                  onClick={() => addOption(qi)}
                  className="mt-4 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-semibold active:scale-95"
                >
                  <Plus size={16} />
                  Válasz hozzáadása
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="flex flex-col gap-3 mb-10">
          <button
            onClick={addQuestion}
            className="w-full bg-white dark:bg-[#2b2b2b] border-2 border-dashed border-gray-300 dark:border-[#3a3a3a] text-gray-600 dark:text-gray-400 p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-all active:scale-95"
          >
            <Plus size={20} />
            Új kérdés
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="md:hidden w-full bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Kvíz frissítése
          </button>
        </div>
      </div>
    </div>
  )
}