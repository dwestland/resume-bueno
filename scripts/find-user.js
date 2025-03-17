// Script to find a user in the database
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    // Find the first user
    const users = await prisma.user.findMany({
      take: 1,
      select: {
        id: true,
        email: true,
        subscription_plan: true,
        subscription_status: true,
        credits: true,
      },
    })

    console.log('Found users:', users)

    if (users.length > 0) {
      console.log('\nFirst user ID:', users[0].id)
      console.log(
        'Use this ID for testing: curl "http://localhost:3200/api/test-stripe?userId=' +
          users[0].id +
          '"'
      )
    } else {
      console.log('No users found in the database')
    }
  } catch (error) {
    console.error('Error finding users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
