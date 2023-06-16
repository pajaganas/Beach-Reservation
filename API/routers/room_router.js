const express = require('express')
const roomController = require('../controllers/room_controller')

const roomRouter = express.Router()

roomRouter.post('/add-room', roomController.addRoom)
roomRouter.get('/view-type', roomController.viewAllRoomsByType)
roomRouter.get('/view/:id', roomController.viewRoomDetailsById)
roomRouter.put('/update/:id', roomController.updateRoomDetails)
roomRouter.delete('/deleteAll', roomController.deleteAllRooms)
roomRouter.delete('/delete/:id', roomController.deleteRoomById)

module.exports = roomRouter
