import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'

import { limiter } from './src/middlewares/rateLimiting.js'
import { prisma } from './src/lib/prisma.js'

import authRoutes from './src/routes/authRoute.js'
import userRouter from './src/routes/userRoute.js'

const app = express()
dotenv.config()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(limiter)
app.use(cookieParser())
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRouter)

async function testDatabaseConnection() {
    try {
        await prisma.$queryRaw`SELECT 1`
        console.log('Database connection successful')
    } catch (error) {
        console.error('Database connection failed:', error)
    }
}

testDatabaseConnection().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
        console.log(`Go to http://localhost:${PORT}`)
    })
})

