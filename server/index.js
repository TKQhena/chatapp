const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const app = express()
require('dotenv').config()

const client_URL = process.env.CLIENT_URL
app.use(express.json())
app.use(cookieParser())
app.use(cors(
  {
    origin: client_URL,
    credentials: true,
  }
))
const Port = process.env.PORT

mongoose.connect('mongodb://localhost:27017/chatapp')

mongoose.connection.on('connected', () => {
  console.log('Mongoose is connected')
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/user', require('./routes/userendpoint'))

/* app.use('/ws', require('./routes/websocket')) */


app.listen(Port, () => {
  console.log(`Server is running on http://localhost:${Port}`)
})

