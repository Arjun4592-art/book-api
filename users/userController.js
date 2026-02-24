import createHttpError from 'http-errors'
import userModel from './userModel.js'
import bcrypt from 'bcrypt'
import pkg from 'jsonwebtoken'
import { config } from '../src/config/config.js'
const { sign } = pkg

export const registerController = async (req, res, next) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    const error = createHttpError(400, 'All fields are required')

    return next(error)
  }

  try {
    const user = await userModel.findOne({ email })

    if (user) {
      const error = createHttpError(400, 'User already exists')

      return next(error)
    }
  } catch (error) {
    return next(createHttpError(500, 'Error while getting user'))
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const newUser = await userModel.create({
    name,
    email,
    password: hashedPassword,
  })

  // Token Generation JWT
  const token = sign({ sub: newUser._id }, config.jwtSecret, {
    expiresIn: '7d',
    algorithm: 'HS256',
  })

  res.status(200).json({ accessToken: token })
}

export const loginController = async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return next(createHttpError(400, 'All fields are required'))
  }

  try {
    const user = await userModel.findOne({ email })

    // Use a generic message for security
    if (!user) {
      return next(createHttpError(401, 'Invalid email or password'))
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return next(createHttpError(401, 'Invalid email or password'))
    }

    // Fixed typo: expiresIn
    const token = sign({ sub: user._id }, config.jwtSecret, {
      expiresIn: '7d',
      algorithm: 'HS256',
    })

    res.json({
      message: 'Login successful',
      accessToken: token,
    })
  } catch (error) {
    return next(createHttpError(500, 'Error during login process'))
  }
}
