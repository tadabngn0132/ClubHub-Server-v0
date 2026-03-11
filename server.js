import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'

import { limiter } from './src/middlewares/rateLimiting.js'
import { prisma } from './src/libs/prisma.js'

import authRouter from './src/routes/authRoute.js'
import userRouter from './src/routes/userRoute.js'
import activityRouter from './src/routes/activityRoute.js'
import taskRouter from './src/routes/taskRoute.js'
import activityRegistrationRouter from './src/routes/activityRegistrationRoute.js'
import memberApplicationRouter from './src/routes/memberApplicationRoute.js'
import notificationRouter from './src/routes/notificationRoute.js'

import { corsOptions } from './src/configs/corsConfig.js'
import session from 'express-session'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors(corsOptions))
app.use(limiter)
app.use(cookieParser())
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  }
}))

app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)
app.use('/api/activities', activityRouter)
app.use('/api/tasks', taskRouter)
app.use('/api/activity-registrations', activityRegistrationRouter)
app.use('/api/member-applications', memberApplicationRouter)
app.use('/api/notifications', notificationRouter)

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

