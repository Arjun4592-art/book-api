import cloudinary from '../config/cloudinary.js'
import path from 'node:path'
import bookModel from './bookModel.js'
import fs from 'node:fs'
import createHttpError from 'http-errors'

export const createBook = async (req, res, next) => {
  const { title, genre } = req.body

  const files = req.files
  const coverImageMimeType = files.coverImage[0].mimetype.split('/').at(-1)
  const fileName = files.coverImage[0].filename
  const filepath = path.resoleve(
    __dirname,
    '../../public/data/uploads',
    fileName,
  )

  const uploadResult = await cloudinary.uploader.upload(filepath, {
    filename_override: fileName,
    folder: 'book-covers',
    format: coverImageMimeType,
  })

  const pdfFileName = files.file[0].filename
  const bookFilepath = path.resoleve(
    __dirname,
    '../../public/data/uploads',
    pdfFileName,
  )

  const bookUploadResult = await cloudinary.uploader.upload(bookFilepath, {
    resource_type: 'raw',
    filename_override: pdfFileName,
    folder: 'book-pdfs',
    format: 'pdf',
  })

  const newBook = await bookModel.create({
    title,
    genre,
    author: req.userId,
    coverImage: uploadResult.secure_url,
    file: bookUploadResult.secure_url,
  })

  // Delete temp files
  //todo: try-catch
  await fs.promises.unlink(filepath)
  await fs.promises.unlink(bookFilepath)

  res.status(201).json({ id: newBook._id })
}

export const readBook = async (req, res, next) => {
  try {
    // todo: add pagination
    const book = await bookModel.find()
    return res.json(book)
  } catch (error) {
    return next(createHttpError(500, 'Error while getting book'))
  }
}

export const readBookById = async (req, res, next) => {
  const bookId = req.params.bookId

  if (!bookId) {
    return next(createHttpError(404, 'Book not found'))
  }

  try {
    const getSingleBook = await bookModel.findById(bookId)

    return res.json(getSingleBook)
  } catch (error) {
    return next(createHttpError(500, "Don't get id"))
  }
}

// update book
export const updateBook = async (req, res, next) => {
  const { title, genre } = req.body
  const bookId = req.params.bookId

  const book = await bookModel.findById(bookId)

  if (!book) {
    return next(createHttpError(404, 'Book not found'))
  }

  if (book.author.toString() !== req.userId) {
    return next(createHttpError(403, 'Unauthorized'))
  }

  let completeCoverImage = ''

  const files = req.files
  if (files?.coverImage) {
    const coverImageMimeType = files.coverImage[0].mimetype.split('/').at(-1)
    const fileName = files.coverImage[0].filename
    const filepath = path.resoleve(
      __dirname,
      '../../public/data/uploads',
      fileName,
    )

    completeCoverImage = fileName

    const uploadResult = await cloudinary.uploader.upload(filepath, {
      filename_override: completeCoverImage,
      folder: 'book-covers',
      format: completeCoverImage,
    })

    completeCoverImage = uploadResult.secure_url
    await fs.promises.unlink(filepath)
  }

  let completeBookPdf = ''
  if (files?.file) {
    const bookFileName = files.file[0].filename
    const bookFilepath = path.resoleve(
      __dirname,
      '../../public/data/uploads',
      pdfFileName,
    )

    completeBookPdf = bookFileName

    const bookUploadResult = await cloudinary.uploader.upload(bookFilepath, {
      resource_type: 'raw',
      filename_override: pdfFileName,
      folder: 'book-pdfs',
      format: 'pdf',
    })

    completeBookPdf = bookUploadResult.secure_url
    await fs.promises.unlink(bookFilepath)
  }

  const updataBook = await bookModel.findByIdAndUpdate(
    { bookId },
    {
      title,
      genre,
      coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
      file: completeBookPdf ? completeBookPdf : book.file,
    },
    { new: true },
  )

  res.json(updataBook)
}

export const deleteBook = async (req, res, next) => {
  try {
    const bookId = req.params.bookId
    const book = await bookModel.findById(bookId)

    if (!book) {
      return next(createHttpError(404, 'Book not found'))
    }

    if (book.author.toString() !== req.userId) {
      return next(createHttpError(403, 'Unauthorise user'))
    }

    const coverFileSplits = book.coverImage.split('/')
    const coverImagePublicId =
      coverFileSplits.at(-2) + '/' + coverFileSplits.at(-1)?.split('.').at(-2)

    const bookFileSplits = book.file.split('/')
    const bookFilePublicId = bookFileSplits.at(-2) + '/' + bookFileSplits.at(-1)

    // todo: add try error block
    await cloudinary.uploader.destroy(coverImagePublicId)

    await cloudinary.uploader.destroy(bookFilePublicId, {
      resource_type: 'raw',
    })

    await bookModel.deleteOne({ _id: bookId })
    return res.json({ _id: bookId })
  } catch (error) {
    return next(createHttpError(500, 'Getting Error'))
  }
}
