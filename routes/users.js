require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const cors = require('cors');
const User = require('../models/User');
const { Authentication } = require('../middleware/Authentication');


const secret =  process.env.SECRET_KEY || 'this the best one i have';

router.post('/register', async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            password
        } = req.body;
        if(!first_name || ! last_name || !email || !password)
                    return res.status(400).send({message: 'Fields are missing'});
        if(typeof first_name != 'string' || typeof last_name != 'string' || typeof email != "string" || typeof password != 'string')
                return res.status(400).send({message: 'types is not valid'});
        const today = new Date();
        let user = await User.findOne({
            where: {
                email: email
            }
        })
        if(user)
            return res.status(400).send({message: 'User already exist'});
        const hash = bcrypt.hashSync(password, 10);
        User.create({
            first_name: first_name,
            last_name: last_name,
            email: email,
            password: hash,
            created: today
        })
        .then(user => {
            let token = jwt.sign(user.dataValues, secret, {expiresIn: '1h'});
            return res.status(200).send({token: token});

        })
        .catch(e => {
            console.log('error: ', e);
            return res.status(400).send({
                message: e
            });

        });

    } catch (error) {
        console.log('register error: ', error);
        return res.status(500).send({message: 'Server Error'});
    }
})

router.post('/login', async (req, res) => {
    try {
        let {
            email,
            password
        } = req.body;

        let user = await User.findOne({
            where: {
                email: email
            }
        });

        if(user) {
            let compare = bcrypt.compareSync(password, user.dataValues.password);
            if(compare) {
                let token = jwt.sign({
                    exp: Math.floor(Date.now() / 1000) + (60 * 60),
                    data: user.dataValues
                  }, secret)
                  res.status(200).send({
                      token: token
                  })
            } else {
                return res.status(200).send({
                    message: 'Password is incorrect'
                })
            }
        } else {
            return res.status(200).send({
                message: 'User not found'
            });

        }
    } catch (error) {
        console.log('LOGIN ERROR: ', error);
        return res.status(500).send({
            message: 'Server error'
        })
    }
})

router.get('/profile', [Authentication], async (req, res) => {
        try {
            User.findOne({
                where: {
                    id: req.user
                },
                attributes: ['first_name', 'last_name', 'email']
            })
            .then(user => {
                res.status(200).send(
                    user.dataValues
                    )
            })
            .catch(e => {
                console.log('User', e)
                return res.status(404).send({
                    message: 'user not found' 
                })
            })
        } catch (error) {
            console.log('PROFILE', error)
            return res.status(500).send({
                message: 'Server error' 
            })
        }
})

module.exports = router;