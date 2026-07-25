import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import shopRoutes from './routes/shopRoutes.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/shop', shopRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'ShopCard API running!' })
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected!')
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`)
    })
  })
  .catch((err) => {
    console.log('MongoDB error:', err)
  })