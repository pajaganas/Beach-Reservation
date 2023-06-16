const express = require('express')
const userController = require('../controllers/user_controller')

const userRouter = express.Router()

userRouter.post('/add-user', userController.addUser)
userRouter.post('/login', userController.login)
userRouter.get('/view/:id', userController.viewUserDetailsById)
userRouter.get('/view-all', userController.viewAllUsers)
userRouter.put('/updateContactNo/:id', userController.updateUserContactNo)
userRouter.put('/updatePassword/:id', userController.updateUserPassword)
userRouter.delete('/delete/:id', userController.deleteUserById)

module.exports = userRouter

