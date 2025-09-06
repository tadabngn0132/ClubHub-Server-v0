import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'

import { sql } from './src/config/database.js'
import authRoutes from './src/routes/authRoute.js'

const app = express()
dotenv.config()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)

async function testDatabaseConnection() {
    try {
        await sql`SELECT version()`
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
