const express = require('express')
const router = express.Router()
const ws = require('ws')
const fs = require('fs')
const { connection } = require('mongoose')
require('dotenv').config()
const Port = process.env.PORT

const wss = new ws.Server({port:Port})
wss.on('connection', (connection,req)=>{
    const OnlineUsers = ()=>{
        [...wss.clients].forEach(client=>{
            client.send(JSON.stringify({
                online: [...wss.clients].map(client=>({
                    userId: client.userId,
                    username: client.username
                }))
            }))
        })
    }

    connection.isAlive = true;
    connection.timer = setInterval(()=>{
        connection.ping();
        connection.deathTimer = setTimeout(()=>{
            connection.isAlive = false;
            clearInterval(connection.timer);
            connection.terminate();
            OnlineUsers();
            console.log('Disconnected. Trying to reconnect.');
        }, 1000);
        
    }, 10000);

    connection.on('pong', () => {
        clearTimeout(connection.deathTimer);
    });

    const cookie = req.headers.cookie
    if(cookie){
        const accessToken = cookie.split('=')[1]
        connection.userId = verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
    }
    
})