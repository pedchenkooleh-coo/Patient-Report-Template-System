import { PrismaClient } from '@prisma/client'
import { createApp } from './app'

const PORT = Number(process.env.PORT ?? 3001)

const prisma = new PrismaClient()
const app = createApp(prisma)

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`)
})
