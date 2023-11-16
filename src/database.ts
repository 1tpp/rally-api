import { config } from './config'
import * as mongoose from 'mongoose'

await mongoose.connect(config.mongoUri).then(() => {
  console.log('💽 MongoDB is connected...')
}).catch(err => {
  console.log('❌ MongoDB connection error. Please make sure MongoDB is running. ' + err)
})
