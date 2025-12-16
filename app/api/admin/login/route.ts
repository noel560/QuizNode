import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    const admin = await prisma.admin.findUnique({
      where: { username }
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'Hibás felhasználónév vagy jelszó' },
        { status: 401 }
      )
    }

    // Jelszó ellenőrzés bcrypt-tel
    const isValid = await verifyPassword(password, admin.password)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Hibás felhasználónév vagy jelszó' },
        { status: 401 }
      )
    }

    // JWT token generálás
    const token = generateToken({ username: admin.username })

    return NextResponse.json({ token, username: admin.username })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Szerver hiba' },
      { status: 500 }
    )
  }
}