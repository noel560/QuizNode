import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const attempt = await prisma.attempt.findUnique({
      where: { id },
      include: {
        quiz: {
          select: {
            title: true,
            description: true
          }
        }
      }
    })

    if (!attempt) {
      return NextResponse.json(
        { error: 'Eredmény nem található' },
        { status: 404 }
      )
    }

    return NextResponse.json(attempt)
  } catch (error) {
    console.error('Results fetch error:', error)
    return NextResponse.json(
      { error: 'Hiba az eredmény lekérésekor' },
      { status: 500 }
    )
  }
}