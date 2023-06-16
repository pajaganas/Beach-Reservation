const express = require('express')
const roomTypeController = require('../controllers/room_type_controller')

const roomTypeRouter = express.Router()

roomTypeRouter.post('/add-type', roomTypeController.addRoomType)
roomTypeRouter.get('/view/:id', roomTypeController.viewRoomTypeDetailsById)
roomTypeRouter.get('/view-all', roomTypeController.viewAllRoomTypes)
roomTypeRouter.delete('/delete/:id', roomTypeController.deleteRoomType)

module.exports = roomTypeRouter
