const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')

const db = require('./API/models/con_db')
db.connectDatabase()

const userRouter = require('./API/routers/user_router')
const roomRouter = require('./API/routers/room_router')
const reservationRouter = require('./API/routers/reservation_router')
const roomTypeRouter = require('./API/routers/room_type_router')

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())


//define header settings
app.use((req, res, next)=>{
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "*")

    if (req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', "PUT, POST, PATCH, DELETE, GET")
        return res.status(200).json({})
    }

    next()
})

//TEST API
app.get('/test', (req, res, next)=>{
    res.status(200).json({
        successful: true,
        message: "Successful test!"
    })

    next()

})

app.use('/users', userRouter)
app.use('/rooms', roomRouter)
app.use('/reservations', reservationRouter)
app.use('/room_type', roomTypeRouter)

//ERROR MIDDLEWARE

app.use((req, res, next)=>{
    const error = new Error('Not found')
    error.status = 404
    next(error)
})

app.use((error, req, res, next)=>{
    res.status(error.status || 500)
    res.json({
        error:{
            message: error.message
        }
    })
})

module.exports = app