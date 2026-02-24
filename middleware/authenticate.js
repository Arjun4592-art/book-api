import { config } from '../src/config/config.js'
import createHttpError from 'http-errors'
import pkg from 'jsonwebtoken'
const { verify } = pkg

export const authenticate = (req, res, next) => {
  const token = req.header.Authorization || req.header.authorization

  if (!token) {
    return next(createHttpError(401, 'Authorization token is required'))
  }

  const parsedToken = token.split(' ')[1]

  const decoded = verify(parsedToken, config.jwtSecret)

  req.userId = decoded.sub
}
