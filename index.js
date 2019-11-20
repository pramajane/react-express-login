require('dotenv').config()

const path = require("path")
const express = require('express')
const app = express()
const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_URL, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('connected to database'))

app.use(express.json())
app.use(express.static(path.join(__dirname, 'build')));

const usersRouter = require('./routes/user')
app.use('/user', usersRouter)

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
})

app.listen(3001, () => console.log('server started'))
