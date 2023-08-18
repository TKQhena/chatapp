const {sign, verify} = require('jsonwebtoken');
require('dotenv').config();

const createToken = (user) => {
    const accessToken = sign({username: user.username, id:user._id}, process.env.ACCESS_TOKEN_SECRET);

    return accessToken;
}

const validate = (req,res,next) => {
    const accessToken = req.cookies["accessToken"];

    if(!accessToken) {
        return res.status(401).send("Was not tested");
    }
    try {
        const verified = verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        if(verified){
            req.authanticated = true;
            return next();
        }
    }catch (err) {
        return res.status(401).send("Unauthorized");
    }

}

async function getUserData(req) {
    return new Promise((resolve, reject) => {
        const accessToken = req.cookies["accessToken"];
        if(!accessToken) {
            reject('no token');
        }else{
            verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
                if(err) {
                    reject(err);
                }else{
                    resolve(user);
                }
            })
        }
    })
}

module.exports = {
    createToken,
    validate,
    getUserData
}