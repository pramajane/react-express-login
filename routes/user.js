const express = require('express')
const router = express.Router()
const User = require('../models/user')
const helper = require('./helper')
const auth = require('./auth')

// list all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find()
        res.json(users)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

// list one user
router.get('/:id', helper, (req, res) => {
    res.json(res.user)
})

// create a new user
router.post('/', async (req, res) => {
    if (req.body.password === req.body.confirm_password) {
        const user = new User(req.body);
        try {
            await user.save()
            const token = await user.generateAuthToken()
            res.status(201).send({user, token})
        } catch (err) {
            res.status(400).json({message: err.message})
        }
    }
})

// user login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findByCredentials(email, password)
        if (!user) {
            return res.status(401).send({message: 'Login failed! Check authentication credentials'})
        }
        const token = await user.generateAuthToken()
        // console.log({token})
        res.send({ user, token }) 
    } catch(err) {
        // console.log(token)
        res.status(400).send({message: "bad request"})
    }   
})

// user me
router.get('/user/me', auth, async (req, res, next) => {
    // view logged in user profile
    console.log(req.token)
    res.send(req.user)
})

// user log out
router.post('/user/me/logout', auth, async(req, res, next) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    } catch (err) {
        res.status(500).send(err)
    }
})

// update a user
router.patch('/:id', helper, async (req, res) => {
    if (req.body.username != null) {
        res.user.username = req.body.username
    }
    if (req.body.email != null) {
        res.user.email = req.body.email
    }
    try {
        const updatedUser = await res.user.save()
        res.json(updatedUser)
    } catch(err) {
        res.status(400).json({message: err.message})
    }
})

// delete a user
router.delete('/:id', helper, async (req, res) => {
    try {
        await res.user.remove()
        res.json({message: "user is deleted"})
    } catch(err) {
        res.status(500).json({message: err.message})
    }
})

module.exports = router