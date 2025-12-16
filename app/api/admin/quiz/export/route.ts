import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, extractToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    // Admin auth check
    const token = extractToken(req.headers.get('authorization'))
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Hiányzó kvíz ID' },
        { status: 400 }
      )
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
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

    // Parse questions és export formátumba alakítás
    const exportData = {
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions.map(q => ({
        questionText: q.questionText,
        questionType: q.questionType,
        options: JSON.parse(q.options),
        correctAnswers: JSON.parse(q.correctAnswers)
      }))
    }

    return NextResponse.json(exportData)
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Hiba az exportálás során' },
      { status: 500 }
    )
  }
}