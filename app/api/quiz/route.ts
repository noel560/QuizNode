import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Publikus kvízlista (bárki láthatja)
export async function GET() {
  try {
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