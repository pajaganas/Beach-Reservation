const express = require('express')
const reservationController = require('../controllers/reservation_controller')

const reservationRouter = express.Router()

reservationRouter.post('/add-reservation', reservationController.addReservation)
reservationRouter.get('/view/:id', reservationController.viewReservationDetailsById)
reservationRouter.get('/view-all', reservationController.viewAllReservations)
reservationRouter.get('/viewUser/:id', reservationController.viewReservationByUser)
reservationRouter.get('/viewType', reservationController.viewReservationByType)
reservationRouter.put('/update/:id', reservationController.updateReservationDetails)

module.exports = reservationRouter
