import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'

const app = express()
dotenv.config()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})