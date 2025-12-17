'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Save, ArrowLeft, Check, ChevronDown } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

interface Question {
  questionText: string
  questionType: 'single' | 'multiple' | 'truefalse'
  options: string[]
  correctAnswers: number[]
}

export default function QuizEditor() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (title.trim()) {
      document.title = `Új kvíz: ${title}`
    } else {
      document.title = 'Új kvíz létrehozása'
    }
  }, [title])

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

  const addOption = (q: number) => {
    const updated = [...questions]
    updated[q].options.push('')
    setQuestions(updated)
  }

  const removeOption = (q: number, o: number) => {
    const updated = [...questions]
    updated[q].options = updated[q].options.filter((_, i) => i !== o)
    updated[q].correctAnswers = updated[q].correctAnswers
      .filter(i => i !== o)
      .map(i => (i > o ? i - 1 : i))
    setQuestions(updated)
  }

  const updateOption = (q: number, o: number, value: string) => {
    const updated = [...questions]
    updated[q].options[o] = value
    setQuestions(updated)
  }

  const toggleCorrectAnswer = (q: number, o: number) => {
    const updated = [...questions]
    const question = updated[q]

    if (question.questionType !== 'multiple') {
      question.correctAnswers = [o]
    } else {
      question.correctAnswers = question.correctAnswers.includes(o)
        ? question.correctAnswers.filter(i => i !== o)
        : [...question.correctAnswers, o]
    }

    setQuestions(updated)
  }

  const changeQuestionType = (q: number, type: Question['questionType']) => {
    const updated = [...questions]
    updated[q].questionType = type

    if (type === 'truefalse') {
      updated[q].options = ['Igaz', 'Hamis']
      updated[q].correctAnswers = []
    } else {
      updated[q].options = ['', '']
      updated[q].correctAnswers = []
    }

    setQuestions(updated)
  }

  const handleSave = async () => {
    if (!title.trim()) return alert('Add meg a kvíz címét!')
    if (questions.length === 0) return alert('Adj hozzá kérdést!')

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.questionText.trim()) return alert(`A ${i + 1}. kérdés üres`)
      if (q.options.some(o => !o.trim())) return alert(`Üres válasz a ${i + 1}. kérdésben`)
      if (q.correctAnswers.length === 0) return alert(`Nincs helyes válasz: ${i + 1}. kérdés`)
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, questions })
      })

      if (res.ok) router.push('/admin')
      else alert('Mentési hiba')
    } catch {
      alert('Hálózati hiba')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#202020] transition-colors duration-300 p-3 md:p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header - Tapadásmentesebb mobilon */}
        <div className="bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#3a3a3a] rounded-xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Vissza az admin felületre</span>
              <span className="sm:hidden text-sm font-semibold">Vissza</span>
            </button>

            <div className="flex items-center gap-2 md:gap-3">
              <ThemeToggle />
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 disabled:from-gray-400 disabled:to-gray-400 px-4 md:px-5 py-2 rounded-lg font-bold flex items-center gap-2 active:scale-95 transition-all text-sm md:text-base"
              >
                <Save size={18} />
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
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#3a3a3a] bg-gray-100 dark:bg-[#202020] text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 outline-hidden text-sm md:text-base"
          />
        </div>

        {/* Questions List */}
        <div className="space-y-6 mb-8">
          {questions.map((q, qi) => (
            <div key={qi} className="bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#3a3a3a] rounded-xl shadow-md p-4 md:p-6 relative">

              {/* Question Header */}
              <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs md:text-sm font-bold">
                    {qi + 1}. kérdés
                  </span>
                  <div className="relative">
                    <select
                      value={q.questionType}
                      onChange={(e) => changeQuestionType(qi, e.target.value as any)}
                      className="appearance-none bg-gray-100 dark:bg-[#323232] text-gray-700 dark:text-gray-200 pl-3 pr-8 py-1 rounded-lg text-xs md:text-sm border border-gray-300 dark:border-[#444] outline-hidden cursor-pointer"
                    >
                      <option value="single">Egy válasz</option>
                      <option value="multiple">Több válasz</option>
                      <option value="truefalse">Igaz/Hamis</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                  </div>
                </div>

                <button
                  onClick={() => removeQuestion(qi)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <textarea
                placeholder="Kérdés szövege..."
                value={q.questionText}
                onChange={e => updateQuestion(qi, 'questionText', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#3a3a3a] bg-gray-50 dark:bg-[#202020] text-gray-800 dark:text-white mb-4 outline-hidden focus:ring-1 focus:ring-blue-500"
                rows={2}
              />

              {/* Options */}
              <div className="space-y-2">
                {q.options.map((option, oi) => (
                  <div key={oi} className="flex items-center gap-2 group">
                    <button
                      onClick={() => toggleCorrectAnswer(qi, oi)}
                      className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all ${q.correctAnswers.includes(oi)
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
                      <button
                        onClick={() => removeOption(qi, oi)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {q.questionType !== 'truefalse' && (
                <button
                  onClick={() => addOption(qi)}
                  className="mt-4 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  <Plus size={16} />
                  Válaszlehetőség hozzáadása
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <button
            onClick={addQuestion}
            className="flex-1 bg-white dark:bg-[#2b2b2b] border-2 border-dashed border-gray-300 dark:border-[#3a3a3a] text-gray-600 dark:text-gray-400 p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-all active:scale-95"
          >
            <Plus size={20} />
            Új kérdés hozzáadása
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="sm:hidden bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg"
          >
            Kvíz Mentése
          </button>
        </div>
      </div>
    </div>
  )
}
