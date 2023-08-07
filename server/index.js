const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  credentials: true,
  origin: 'http://localhost:3000'
}))

mongoose.connect('mongodb://localhost:27017/chatapp')

mongoose.connection.on('connected', () => {
  console.log('Mongoose is connected')
})

app.use('/user', require('./routes/userendpoint'))

app.use('/message', require('./routes/messageEndpoint'))

app.listen(4040, () => {
  console.log('Server is running on port 4040')
})

