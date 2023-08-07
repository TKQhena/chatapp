const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const {createToken,validate,getUserData} = require('../middleware')
require('dotenv').config()
const User = require('../models/userModels')
const Message = require('../models/messageModel')
const ws = require('ws')
const fs = require('fs')
const jwt = require('jsonwebtoken')

router.post('/register', async (req, res) => {
    const { username, password } = req.body
    try {
        const hashedPassword = bcrypt.hashSync(password, process.env.bcryptSalt );
        const user = await User.create({ username, password: hashedPassword })
        const accessToken = createToken(user)
        res.cookie('accessToken', accessToken, {sameSite: 'none', secure: true}).status(201).json({
            id: user._id,
        })
    }catch(err) {
        return res.status(400).send(err)
    }
})

router.post('/login', async (req, res) => {
    const { username, password } = req.body
    try {
        const user = await User.findOne({ username })
        if(!user) {
            return res.status(400).send('User not found')
        }
        const isPasswordValid = bcrypt.compareSync(password, user.password)
        if(!isPasswordValid) {
            return res.status(400).send('Invalid password')
        }
        const accessToken = createToken(user)
        res.cookie('accessToken', accessToken, {sameSite: 'none', secure: true}).status(200).json({
            id: user._id,
        })
    }catch(err) {
        return res.status(400).send(err)
    }
})

router.get('/logout', (req, res) => {
    res.clearCookie('accessToken', {sameSite: 'none', secure: true}).status(200)
})

router.get('/user', validate, async (req, res) => {
    res.cookie('Token', req.authanticated, {sameSite: 'none', secure: true}).status(200)
})

router.get('/people', async (req, res) => {
    const people = await User.find({}, {_id:1, username:1})
    res.json(people)
})

router.get('/profile',(req, res) => {
    const token = req.cookies?.accessToken
    if(!token) {
        return res.status(401).send('Unauthorized')
    }
    try {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if(err) return res.status(401).send('Unauthorized')
            res.json(user)
        })
    }catch (err) {
        return res.status(401).send('Unauthorized')
    }
})

router.get('/messages/:userID', async (req, res) => {
    const {userID} = req.params;
    const userData = await getUserData(req);
    const currentUser = userData.userID;
    const messages = await Message.find({
        recipient: {$in: [userID, currentUser]}, 
        sender: {$in: [userID, currentUser]}
    }).sort({
        createdAt: 1
    })
    res.json(messages)
})

const wss = new ws.WebSocketServer({port:process.env.wsPort});
wss.on('connection', (connection, req) => {

  function notifyAboutOnlinePeople() {
    [...wss.clients].forEach(client => {
      client.send(JSON.stringify({
        online: [...wss.clients].map(c => ({userId:c.userId,username:c.username})),
      }));
    });
  }

  connection.isAlive = true;

  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
      console.log('dead');
    }, 1000);
  }, 5000);

  connection.on('pong', () => {
    clearTimeout(connection.deathTimer);
  });
  //read username from cookie
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies.split(';').find(str => str.startsWith('token='));
    if (tokenCookieString) {
      const token = tokenCookieString.split('=')[1];
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          const {userId, username} = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }

  connection.on('message', async (message) => {
    const messageData = JSON.parse(message.toString());
    const {recipient, text, file} = messageData;
    let filename = null;
    if (file) {
      console.log('size', file.data.length);
      const parts = file.name.split('.');
      const ext = parts[parts.length - 1];
      filename = Date.now() + '.'+ext;
      const path = __dirname + '/uploads/' + filename;
      const bufferData = new Buffer(file.data.split(',')[1], 'base64');
      fs.writeFile(path, bufferData, () => {
        console.log('file saved:'+path);
      });
    }
    if (recipient && (text || file)) {
      const messageDoc = await Message.create({
        sender:connection.userId,
        recipient,
        text,
        file: file ? filename : null,
      });
      console.log('created message');
      [...wss.clients]
        .filter(c => c.userId === recipient)
        .forEach(c => c.send(JSON.stringify({
          text,
          sender:connection.userId,
          recipient,
          file: file ? filename : null,
          _id:messageDoc._id,
        })));
    }
  });

  // notify everyone about online people (when someone connects)
  notifyAboutOnlinePeople();
});

module.exports = router