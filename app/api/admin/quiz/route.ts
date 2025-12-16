import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, extractToken } from '@/lib/auth'

// GET - Lista az összes kvízről (admin only)
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

    const quizzes = await prisma.quiz.findMany({
      include: {
        _count: {
          select: {
            questions: true,
            attempts: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(quizzes)
  } catch (error) {
    return NextResponse.json(
      { error: 'Hiba a kvízek lekérésekor' },
      { status: 500 }
    )
  }
}

// POST - Új kvíz létrehozása (admin only)
export async function POST(req: NextRequest) {
  try {
    // Admin auth check
    const token = extractToken(req.headers.get('authorization'))
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { title, description, questions } = body

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        questions: {
          create: questions.map((q: any, index: number) => ({
            questionText: q.questionText,
            questionType: q.questionType,
            options: JSON.stringify(q.options),
            correctAnswers: JSON.stringify(q.correctAnswers),
            order: index
          }))
        }
      },
      include: {
        questions: true
      }
    })

    return NextResponse.json(quiz)
  } catch (error) {
    console.error('Quiz creation error:', error)
    return NextResponse.json(
      { error: 'Hiba a kvíz létrehozásakor' },
      { status: 500 }
    )
  }
}

// DELETE - Kvíz törlése (admin only)
export async function DELETE(req: NextRequest) {
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

    await prisma.quiz.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Hiba a kvíz törlésekor' },
      { status: 500 }
    )
  }
}

// PUT - Kvíz frissítése (admin only)
export async function PUT(req: NextRequest) {
  try {
    // Admin auth check
    const token = extractToken(req.headers.get('authorization'))
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { id, title, description, questions } = body

    // Töröljük a régi kérdéseket
    await prisma.question.deleteMany({
      where: { quizId: id }
    })

    // Frissítjük a kvízt és hozzáadjuk az új kérdéseket
    const quiz = await prisma.quiz.update({
      where: { id },
      data: {
        title,
        description,
        questions: {
          create: questions.map((q: any, index: number) => ({
            questionText: q.questionText,
            questionType: q.questionType,
            options: JSON.stringify(q.options),
            correctAnswers: JSON.stringify(q.correctAnswers),
            order: index
          }))
        }
      },
      include: {
        questions: true
      }
    })

    return NextResponse.json(quiz)
  } catch (error) {
    console.error('Quiz update error:', error)
    return NextResponse.json(
      { error: 'Hiba a kvíz frissítésekor' },
      { status: 500 }
    )
  }
}