const express = require('express')
const router = express.Router()
const {createToken, validate, getUserData} = require('../middleware')
const User = require('../models/userModels')
const {Message} = require('../models/messageModel')
const bcrypt = require('bcryptjs')
const cookieParser = require('cookie-parser')

router.use(cookieParser())
router.use(express.json())

router.post('/register', async (req, res) => {
  const {email,username, password} = req.body
  bcrypt.hash(password, 10).then((hash) => {
    const newUser = new User({
      email,
      username,
      password: hash
    })
    newUser.save()
      .then((user) => {
        newToken = createToken(user)
        res.cookie('accessToken', newToken,{sameSite: 'none', secure: true})
        res.json("User has been created successfully")
      })
      .catch((err) => {
        res.status(400).json(err)
      })
  })
})

router.post('/login', async (req, res) => {
  const {username, password} = req.body
  console.log(username, password) 
  const user = await User.findOne({username})
  if (!user) {
    res.status(400).json("User does not exist")
  }else{
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      res.status(400).json("Incorrect password")
    }else{
      newToken = createToken(user)
      res.cookie('accessToken', newToken,{sameSite: 'none', secure: true}).json(user)
      console.log(newToken)
    }
  }
})

router.get('/profile', validate, (req, res) => {
  getUserData(req).then((user) => {
    res.json(user)
  })
})

router.post('/logout', (req, res) => {
  res.clearCookie('accessToken')
  res.json("Logged out successfully")
})

router.get('/people', async(req,res)=>{
  const users = await User.find({}, {_id: 1, password: 1})
  res.json(users)
})

router.get('/messages/:userId', async(req,res)=>{
  const userId = req.params
  const userData = await getUserData(req)
  const currentUserData = userData.userId
  const messages = await Message.find({
    sender: {
      $in: [currentUserData, userId]
    },
    recipient: {
      $in: [currentUserData, userId]
    }
  }).sort({createdAt: 1})
  res.json(messages)
})

module.exports = router