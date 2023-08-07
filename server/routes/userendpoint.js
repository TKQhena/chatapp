const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const {createToken,validate} = require('../middleware')
require('dotenv').config()
const User = require('../models/userModels')
const Message = require('../models/messageModels')

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body
    try {
        const hashedPassword = bcrypt.hashSync(password, process.env.bcryptSalt );
        const user = await User.create({ username, email, password: hashedPassword })
        const accessToken = createToken(user)
        res.cookie('accessToken', accessToken, {sameSite: 'none', secure: true}).status(201)
    }catch(err) {
        return res.status(400).send(err)
    }
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email })
        if(!user) {
            return res.status(400).send('User not found')
        }
        const isPasswordValid = bcrypt.compareSync(password, user.password)
        if(!isPasswordValid) {
            return res.status(400).send('Invalid password')
        }
        const accessToken = createToken(user)
        res.cookie('accessToken', accessToken, {sameSite: 'none', secure: true}).status(200)
    }catch(err) {
        return res.status(400).send(err)
    }
})

module.exports = router