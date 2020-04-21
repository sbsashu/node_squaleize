require('dotenv').config();
let User = require('../models/User');
let jwt = require('jsonwebtoken');

module.exports = { 
    Authentication: (req, res, next) => {
        if(!req.headers['authorization']) {
            return res.status(401).send({
                message: 'token is not provided' 
            })
        }
        try {
            let decoded = jwt.verify(req.headers['authorization'], process.env.SECRET_KEY);
            req.user = decoded.data.id
            if(decoded) {
                User.findOne({
                    where: {
                        id: decoded.data.id
                    }
                })
                .then(user => {
                    next();
                })
                .catch(e => {
                    console.log('token error', e)
                    return res.status(400).send({
                        message: 'token is invalid'
                    })
                })
            } else {
                return res.status(400).send({
                    message: 'token is invalid'
                })
            }
        } catch (error) {
            console.log("AUTH : ", error)
            res.status(500).send({
                message: 'Server error'
            })
        }
}}