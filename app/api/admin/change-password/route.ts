import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, extractToken, verifyPassword, hashPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    // Admin auth check
    const token = extractToken(req.headers.get('authorization'))
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await req.json()

    // Jelenlegi admin lekérése
    const admin = await prisma.admin.findUnique({
      where: { username: decoded.username }
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin nem található' },
        { status: 404 }
      )
    }

    // Jelenlegi jelszó ellenőrzése
    const isValid = await verifyPassword(currentPassword, admin.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Hibás jelenlegi jelszó' },
        { status: 401 }
      )
    }

    // Új jelszó hash-elése és mentése
    const newHashedPassword = await hashPassword(newPassword)
    
    await prisma.admin.update({
      where: { username: decoded.username },
      data: { password: newHashedPassword }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Jelszó sikeresen megváltoztatva'
    })
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json(
      { error: 'Szerver hiba' },
      { status: 500 }
    )
  }
}