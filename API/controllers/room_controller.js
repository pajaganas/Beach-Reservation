const database = require('../models/con_db')
const roomModel = require('../models/room_model')

const addRoom = (req, res, next) => {
  let roomNumber = parseInt(req.body.number)
  let roomStatus = req.body.status ? req.body.status.toLowerCase() : undefined
  let roomPrice = parseInt(req.body.price)
  let roomType = req.body.room_type_id

  if (!roomNumber || !roomStatus) {
    res.status(400).json({
      successful: false,
      message: "Room number and status are missing"
    })
  } 
  else if (roomNumber < 101 || roomNumber > 310) {
    res.status(400).json({
      successful: false,
      message: "Invalid room number. Must be between 101 and 310."
    })
  } 
  else if (roomPrice <= 0) {
    res.status(400).json({
      successful: false,
      message: "Invalid room price. Must be greater than 0."
    })
  } 
  else {
    if (roomStatus !== "available" && roomStatus !== "occupied" && roomStatus !== "inactive") {
      res.status(400).json({
        successful: false,
        message: "Invalid room status. Must be available, occupied, or inactive."
      })
    } 
    else {
      let query = `SELECT number FROM rooms WHERE number = '${roomNumber}'`

      database.db.query(query, (err, rows) => {
        if (err) {
          res.status(500).json({
            successful: false,
            message: err
          })
        } 
        else {
          if (rows.length > 0) {
            res.status(400).json({
              successful: false,
              message: "Room number already exists."
            })
          } 
          else {
            let insertQuery = `INSERT INTO rooms SET ?`
            let roomObj = roomModel.room_model(roomNumber, roomStatus, roomPrice, roomType)

            database.db.query(insertQuery, roomObj, (err, rows, result) => {
              if (err) {
                res.status(500).json({
                  successful: false,
                  message: err
                })
              } 
              else {
                res.status(200).json({
                  successful: true,
                  message: "Successfully added a new room!"
                })
              }
            })
          }
        }
      })
    }
  }
}

const viewAllRoomsByType = (req, res, next) => {
  let roomType = req.body.room_type_id
  let query = `SELECT rooms.number, rooms.status, rooms.price, room_type.type, room_type.capacity FROM rooms JOIN room_type ON rooms.room_type_id = room_type.id WHERE room_type_id = '${roomType}'` 

  database.db.query(query, (err, rows) => {
    if (err) {
      res.status(500).json({
        successful: false,
        message: err
      })
    } 
    else {
      if (rows.length > 0) {
        res.status(200).json({
          successful: true,
          message: "Successfully got all type of rooms!",
          count: rows.length,
          data: rows
        })
      } 
      else {
        res.status(200).json({
          successful: true,
          message: "No type of rooms available."
        })
      }
    }
  })
}

const viewRoomDetailsById = (req, res, next) => {
  let roomId = req.params.id
  let query = `SELECT rooms.number, rooms.status, rooms.price, room_type.type, room_type.capacity FROM rooms JOIN room_type ON rooms.room_type_id = room_type.id WHERE rooms.id = '${roomId}'` 

  database.db.query(query, (err, rows) => {
    if (err) {
      res.status(500).json({
        successful: false,
        message: err
      })
    } 
    else {
      if (rows.length > 0) {
        res.status(200).json({
          successful: true,
          message: `Successfully got room with ID ${roomId}.`,
          data: rows[0]
        })
      } 
      else {
        res.status(404).json({
          successful: false,
          message: `Room with ID ${roomId} does not exist.`
        })
      }
    }
  })
}

const updateRoomDetails = (req, res, next) => {
  let roomId = req.params.id
  let roomStatus = req.body.status

  if (!roomId) {
    res.status(400).json({
      successful: false,
      message: "Room ID is missing."
    })
  } 
  else if (roomStatus && roomStatus !== 'available' && roomStatus !== 'occupied') {
    res.status(400).json({
      successful: false,
      message: "Invalid room status. Must be 'available' or 'occupied'"
    })
  } 
  else {
    let query = `SELECT id, price, status FROM rooms WHERE id = ${roomId}`

    database.db.query(query, (err, rows) => {
      if (err) {
        res.status(500).json({
          successful: false,
          message: err
        })
      } 
      else {
        if (rows.length > 0) {
          let updatedStatus = rows[0].status

          if (roomStatus && (roomStatus === 'available' || roomStatus === 'occupied')) {
            updatedStatus = roomStatus
          }

          let updateQuery = `UPDATE rooms SET status = '${updatedStatus}' WHERE id = ${roomId}`

          database.db.query(updateQuery, (err, result) => {
            if (err) {
              res.status(500).json({
                successful: false,
                message: err
              })
            } 
            else {
              res.status(200).json({
                successful: true,
                message: "Successfully updated the room!"
              })
            }
          })
        } 
        else {
          res.status(404).json({
            successful: false,
            message: "Room does not exist."
          })
        }
      }
    })
  }
}

const deleteAllRooms = (req, res, next) => {
  let query = `DELETE FROM rooms`

  database.db.query(query, (err, result) => {
    if (err) {
      res.status(500).json({
        successful: false,
        message: err
      })
    } 
    else {
      res.status(200).json({
        successful: true,
        message: "Successfully deleted all rooms!"
      })
    }
  })
}

const deleteRoomById = (req, res, next) => {
  let roomId = req.params.id

  if (!roomId) {
    res.status(400).json({
      successful: false,
      message: "Room ID is missing."
    })
  } 
 else {
    let query = `SELECT id FROM rooms WHERE id = ${roomId}`

    database.db.query(query, (err, rows) => {
      if (err) {
        res.status(500).json({
          successful: false,
          message: err
        })
      } 
     else {
        if (rows.length > 0) {
          let deleteQuery = `UPDATE rooms SET status = 'inactive' WHERE id = ${roomId}`

          database.db.query(deleteQuery, (err, result) => {
            if (err) {
              res.status(500).json({
                successful: false,
                message: err
              })
            } 
           else {
              res.status(200).json({
                successful: true,
                message: "Successfully deleted the room!"
              })
            }
          })
        } 
          else {
          res.status(404).json({
            successful: true,
            message: "Room ID does not exist."
          })
        }
      }
    })
  }
}

module.exports = {
  addRoom,
  viewRoomDetailsById,
  viewAllRoomsByType,
  updateRoomDetails,
  deleteAllRooms,
  deleteRoomById
}