import express from 'express'
import createHttpError from 'http-errors'
import globalErrorHandler from '../middleware/globalErrorHandler.js'
import userRouter from '../users/userRouter.js'
import bookRouter from './books/bookRouter.js'
import cors from 'cors'

const app = express()
app.use(express.json()) // middleware
app.use(cors())

app.get('/', (req, res, next) => {
  const error = createHttpError(400, 'something went wrong')
  throw error

  res.json({ message: 'This is just a demo api' })
})

app.use('/api/users', userRouter)
app.use('/api/books', bookRouter)

app.use(globalErrorHandler)

export default app
