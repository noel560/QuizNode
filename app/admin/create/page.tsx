'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Save, ArrowLeft, Check } from 'lucide-react'
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#202020] transition-colors duration-300 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#3a3a3a]
                        rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
            >
              <ArrowLeft size={20} />
              Vissza
            </button>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-linear-to-r from-blue-600 to-cyan-600
                           hover:from-blue-700 hover:to-cyan-700
                           disabled:from-gray-400 disabled:to-gray-400
                           text-white px-5 py-2 rounded-lg font-bold
                           flex items-center gap-2 shadow-md"
              >
                <Save size={18} />
                {saving ? 'Mentés...' : 'Mentés'}
              </button>
            </div>
          </div>

          <input
            placeholder="Kvíz címe"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-[#3a3a3a]
                       bg-gray-100 dark:bg-[#202020] text-gray-800 dark:text-white
                       text-2xl font-bold focus:ring-2 focus:ring-blue-500 mb-3"
          />

          <textarea
            placeholder="Kvíz leírása (opcionális)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-[#3a3a3a]
                       bg-gray-100 dark:bg-[#202020] text-gray-700 dark:text-gray-300
                       focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Questions */}
        <div className="space-y-4 mb-6">
          {questions.map((q, qi) => (
            <div
              key={qi}
              className="bg-white dark:bg-[#2b2b2b] border border-gray-300 dark:border-[#3a3a3a]
                         rounded-xl shadow-md p-6"
            >
              <div className="flex justify-between mb-4">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {qi + 1}. kérdés
                </span>
                <button onClick={() => removeQuestion(qi)} className="text-red-500">
                  <Trash2 size={18} />
                </button>
              </div>

              <textarea
                value={q.questionText}
                onChange={e => updateQuestion(qi, 'questionText', e.target.value)}
                placeholder="Kérdés szövege"
                rows={2}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-[#3a3a3a]
                           bg-gray-100 dark:bg-[#202020] text-gray-800 dark:text-white
                           focus:ring-2 focus:ring-blue-500 mb-3"
              />

              {/* Question type */}
              <div className="flex gap-2 mb-4">
                {['single', 'multiple', 'truefalse'].map(type => (
                  <button
                    key={type}
                    onClick={() => changeQuestionType(qi, type as any)}
                    className={`px-4 py-2 rounded-lg font-medium border transition-all ${q.questionType === type
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-100 dark:bg-[#202020] text-gray-600 dark:text-gray-300 border-gray-300 dark:border-[#3a3a3a]'
                      }`}
                  >
                    {type === 'single' && 'Egyválasztós'}
                    {type === 'multiple' && 'Többválasztós'}
                    {type === 'truefalse' && 'Igaz / Hamis'}
                  </button>
                ))}
              </div>

              {/* Options */}
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <button
                      onClick={() => toggleCorrectAnswer(qi, oi)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${q.correctAnswers.includes(oi)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 dark:bg-[#202020] text-gray-400'
                        }`}
                    >
                      {q.correctAnswers.includes(oi) && <Check size={16} />}
                    </button>

                    <input
                      value={opt}
                      onChange={e => updateOption(qi, oi, e.target.value)}
                      disabled={q.questionType === 'truefalse'}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-[#3a3a3a]
                                 bg-gray-100 dark:bg-[#202020] text-gray-800 dark:text-white
                                 disabled:opacity-50"
                    />

                    {q.questionType !== 'truefalse' && q.options.length > 2 && (
                      <button onClick={() => removeOption(qi, oi)} className="text-red-500">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}

                {q.questionType !== 'truefalse' && (
                  <button
                    onClick={() => addOption(qi)}
                    className="text-blue-600 text-sm flex items-center gap-1 mt-2"
                  >
                    <Plus size={16} />
                    Válasz hozzáadása
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add question */}
        <button
          onClick={addQuestion}
          className="w-full bg-white dark:bg-[#2b2b2b] border-2 border-dashed
                     border-gray-300 dark:border-[#3a3a3a]
                     hover:border-blue-500
                     text-blue-600 py-4 rounded-xl font-bold
                     flex items-center justify-center gap-2"
        >
          <Plus size={24} />
          Kérdés hozzáadása
        </button>
      </div>
    </div>
  )
}
