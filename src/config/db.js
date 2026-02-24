import mongoose from 'mongoose'
import { config } from './config.js'

const connectDB = async () => {
  try {
    await mongoose.connect(config.databaseURL)

    mongoose.connection.on('connected', () => {
      console.log('Connected Succesfully to DB!!')
    })

    mongoose.connection.on('error', (err) => {
      console.log('Error in connecting to DB!!', err)
    })
  } catch (error) {
    console.error('Failed to connect to Database', error)
    process.exit(1)
  }
}

export default connectDB
