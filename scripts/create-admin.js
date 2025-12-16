const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  const username = 'admin'
  const password = 'admin123' // Változtasd meg prodban!
  
  const hashedPassword = await bcrypt.hash(password, 10)
  
  const admin = await prisma.admin.upsert({
    where: { username },
    update: { password: hashedPassword },
    create: {
      username,
      password: hashedPassword
    }
  })
  
  console.log('✅ Admin user létrehozva/frissítve:')
  console.log(`   Username: ${admin.username}`)
  console.log(`   Password: ${password} (hash-elve az adatbázisban)`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())