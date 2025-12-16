import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { quizId, answers } = await req.json()

    // Quiz és kérdések lekérése
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!quiz) {
      return NextResponse.json(
        { error: 'Kvíz nem található' },
        { status: 404 }
      )
    }

    // Értékelés
    let correctCount = 0
    const detailedAnswers = quiz.questions.map((question, index) => {
      const correctAnswers = JSON.parse(question.correctAnswers)
      const userAnswers = answers[index] || []
      
      // Rendezzük a tömböket az összehasonlításhoz
      const sortedCorrect = [...correctAnswers].sort((a, b) => a - b)
      const sortedUser = [...userAnswers].sort((a, b) => a - b)
      
      const isCorrect = 
        sortedCorrect.length === sortedUser.length &&
        sortedCorrect.every((val, idx) => val === sortedUser[idx])
      
      if (isCorrect) correctCount++
      
      return {
        questionId: question.id,
        questionText: question.questionText,
        questionType: question.questionType,
        options: JSON.parse(question.options),
        userAnswers,
        correctAnswers,
        isCorrect
      }
    })

    // Attempt mentése
    const attempt = await prisma.attempt.create({
      data: {
        quizId,
        score: correctCount,
        totalQuestions: quiz.questions.length,
        answers: JSON.stringify(detailedAnswers)
      }
    })

    return NextResponse.json({
      attemptId: attempt.id,
      score: correctCount,
      total: quiz.questions.length
    })
  } catch (error) {
    console.error('Quiz submit error:', error)
    return NextResponse.json(
      { error: 'Hiba az értékelés során' },
      { status: 500 }
    )
  }
}