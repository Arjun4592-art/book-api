import express from 'express'
import {
  createBook,
  readBook,
  updateBook,
  deleteBook,
  readBookById,
} from './bookController.js'
import multer from 'multer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { authenticate } from '../../middleware/authenticate.js'

const bookRouter = express.Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

//file store local --> upload
const upload = multer({
  dest: path.resolve(__dirname, '../../public/data/uploads'),
  limits: { fileSize: 10 * 1024 * 1024 }, //10MB
})

bookRouter.post(
  '/',
  authenticate,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]),
  createBook,
)

bookRouter.get('/', readBook)
bookRouter.get('/:bookId', readBookById)

bookRouter.patch(
  '/:bookId',
  authenticate,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]),
  updateBook,
)

bookRouter.delete('/:bookId', authenticate, deleteBook)

export default bookRouter
