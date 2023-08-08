const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const app = express()
require('dotenv').config()

app.use(express.json())
app.use(cookieParser())
app.use(cors())

mongoose.connect('mongodb://localhost:27017/chatapp')

mongoose.connection.on('connected', () => {
  console.log('Mongoose is connected')
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/api', require('./routes/userendpoint'))


app.listen(4040, () => {
  console.log('Server is running on http://localhost:4040')
})

