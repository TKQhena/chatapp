const {sign, verify} = require('jsonwebtoken');
require('dotenv').config();

const createToken = (user) => {
    const accessToken = sign({username: user.username, email: user.email}, process.env.ACCESS_TOKEN_SECRET);

    return accessToken;
}

const validate = (req,res,next) => {
    const accessToken = req.cookies["accessToken"];

    if(!accessToken) {
        return res.status(401).send("Unauthorized");
    }
    try {
        const verified = verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        if(varified){
            req.authanticated = true;
            return next();
        }
    }catch (err) {
        return res.status(401).send("Unauthorized");
    }

}

module.exports = {
    createToken,
    validate
}