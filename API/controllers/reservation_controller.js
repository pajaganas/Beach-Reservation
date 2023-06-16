const database = require('../models/con_db')

const addReservation = (req, res, next) => {
  let started_at = req.body.started_at
  let ended_at = req.body.ended_at
  let reservationStatus = req.body.status ? req.body.status.toLowerCase() : undefined
  let userId = req.body.user_id
  let roomId = req.body.room_id

  if (!started_at || !ended_at || !reservationStatus) {
    return res.status(400).json({
      successful: false,
      message: "Required fields are missing."
    })
  } 
  else if (reservationStatus !== 'reserved' && reservationStatus !== 'cancelled') {
    return res.status(400).json({
      successful: false,
      message: "Invalid reservation status. Must be 'reserved' or 'cancelled'."
    })
  } 
  else if (started_at === ended_at) {
    return res.status(400).json({
      successful: false,
      message: "started_at and ended_at should not be the same."
    })
  }
  else if (new Date(ended_at) < new Date(started_at)) {
    return res.status(400).json({
      successful: false,
      message: "ended_at should not be earlier than started_at."
    })
  }
  const userRoleQuery = `SELECT role FROM users WHERE id = ${userId}`
  database.db.query(userRoleQuery, (roleErr, roleRows) => {
    if (roleErr) {
      return res.status(500).json({
        successful: false,
        message: roleErr
      })
    } 
    else if (roleRows.length === 0) {
      return res.status(400).json({
        successful: false,
        message: "Invalid user id. User does not exist."
      })
    }

    const userRole = roleRows[0]?.role;
    if (userRole !== 'customer') {
      return res.status(400).json({
        successful: false,
        message: "Only customers can make reservations."
      })
    }

    const userQuery = `SELECT first_name, last_name FROM users WHERE id = ${userId}`
    const roomQuery = `SELECT * FROM rooms WHERE id = ${roomId}`

    database.db.query(userQuery, (userErr, userRows) => {
      if (userErr) {
        return res.status(500).json({
          successful: false,
          message: userErr
        })
      } 
      else if (userRows.length === 0) {
        return res.status(400).json({
          successful: false,
          message: "Invalid user id. User does not exist."
        })
      }

      database.db.query(roomQuery, (roomErr, roomRows) => {
        if (roomErr) {
          return res.status(500).json({
            successful: false,
            message: roomErr
          })
        } 
        else if (roomRows.length === 0) {
          return res.status(400).json({
            successful: false,
            message: "Invalid room id. Room does not exist."
          })
        }

        let reserved_at = new Date().toISOString().slice(0, 19).replace('T', ' ')

        if (userRole === 'customer') {
          const checkReservationQuery = `SELECT * FROM reservations WHERE started_at = ? AND ended_at = ? AND room_id = ?`
          const checkReservationValues = [started_at, ended_at, roomId]
          database.db.query(checkReservationQuery, checkReservationValues, (checkErr, checkRows) => {
            if (checkErr) {
              return res.status(500).json({
                successful: false,
                message: checkErr
              })
            }

            if (checkRows.length > 0) {
              return res.status(400).json({
                successful: false,
                message: "Reservation already exists for the selected period and room."
              })
            }

            const insertQuery = `INSERT INTO reservations (reserved_at, started_at, ended_at, status, user_id, room_id) VALUES (?, ?, ?, ?, ?, ?)`
            const reservationValues = [reserved_at, started_at, ended_at, reservationStatus, userId, roomId]

            database.db.query(insertQuery, reservationValues, (err, result) => {
              if (err) {
                return res.status(500).json({
                  successful: false,
                  message: err
                })
              }
              const updateRoomQuery = `UPDATE rooms SET status = 'occupied' WHERE id = ${roomId}`
              database.db.query(updateRoomQuery, (updateErr, updateResult) => {
                if (updateErr) {
                  return res.status(500).json({
                    successful: false,
                    message: updateErr
                  })
                }

                return res.status(200).json({
                  successful: true,
                  message: "Successfully added a new reservation!"
                })
              })
            })
          })
        }
      })
    })
  })
}

const viewReservationDetailsById = (req, res, next)=>{
  let reservationId = req.params.id
  let query = `SELECT DATE_FORMAT(reserved_at, '%Y-%m-%d %H:%i:%s') as reserved_at, DATE_FORMAT(started_at, '%Y-%m-%d %H:%i:%s') as started_at, DATE_FORMAT(ended_at, '%Y-%m-%d %H:%i:%s') as ended_at, reservations.status AS reservation_status, users.first_name, users.last_name, rooms.number as room_number,room_type.type, room_type.capacity, rooms.price FROM reservations INNER JOIN users ON reservations.user_id = users.id INNER JOIN rooms ON reservations.room_id = rooms.id INNER JOIN room_type ON rooms.room_type_id = room_type.id WHERE reservations.id = '${reservationId}'`

  database.db.query(query, (err, rows, result) => {
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
                  message: `Successfully got reservation by user ID number ${reservationId}!`,
                  data: rows[0]
              })
          } 
          else {
              res.status(500).json({
                  successful: false,
                  message: `User ID number ${reservationId} is not exist.`
              })
          }
      }
  })
}

const viewAllReservations = (req, res, next) => {
  let query = `SELECT DATE_FORMAT(reserved_at, '%Y-%m-%d %H:%i:%s') as reserved_at, DATE_FORMAT(started_at, '%Y-%m-%d %H:%i:%s') as started_at, DATE_FORMAT(ended_at, '%Y-%m-%d %H:%i:%s') as ended_at, reservations.status AS reservation_status, users.first_name, users.last_name, rooms.number as room_number,room_type.type, room_type.capacity, rooms.price FROM reservations INNER JOIN users ON reservations.user_id = users.id INNER JOIN rooms ON reservations.room_id = rooms.id INNER JOIN room_type ON rooms.room_type_id = room_type.id`

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
          message: "Successfully got all reservations!",
          count: rows.length,
          data: rows
        })
      } 
      else {
        res.status(200).json({
          successful: true,
          message: "No reservations available.",
          count: rows.length,
          data: rows
        })
      }
    }
  })
}

const viewReservationByUser = (req, res, next) => {
  let userId = req.params.id
  let query = `SELECT DATE_FORMAT(reserved_at, '%Y-%m-%d %H:%i:%s') as reserved_at, DATE_FORMAT(started_at, '%Y-%m-%d %H:%i:%s') as started_at, DATE_FORMAT(ended_at, '%Y-%m-%d %H:%i:%s') as ended_at, reservations.status AS reservation_status, users.first_name, users.last_name, rooms.number as room_number,room_type.type, room_type.capacity, rooms.price FROM reservations INNER JOIN users ON reservations.user_id = users.id INNER JOIN rooms ON reservations.room_id = rooms.id INNER JOIN room_type ON rooms.room_type_id = room_type.id WHERE reservations.user_id = ${userId}`

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
          message: `Successfully got reservation by user ${userId}!`,
          data: rows
        })
      } 
      else {
        res.status(404).json({
          successful: false,
          message: `No reservations found for users ${userId}.`
        })
      }
    }
  })
}

const viewReservationByType = (req, res, next) => {
  let roomType = req.body.room_type_id
  let query = `SELECT DATE_FORMAT(reserved_at, '%Y-%m-%d %H:%i:%s') as reserved_at, DATE_FORMAT(started_at, '%Y-%m-%d %H:%i:%s') as started_at, DATE_FORMAT(ended_at, '%Y-%m-%d %H:%i:%s') as ended_at, reservations.status AS reservation_status, users.first_name, users.last_name, rooms.number as room_number,room_type.type, room_type.capacity, rooms.price FROM reservations INNER JOIN users ON reservations.user_id = users.id INNER JOIN rooms ON reservations.room_id = rooms.id INNER JOIN room_type ON rooms.room_type_id = room_type.id WHERE rooms.room_type_id = '${roomType}'`

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
          message: `Successfully got reservation by type ${roomType}!`,
          data: rows[0]
        })
      } 
      else {
        res.status(404).json({
          successful: false,
          message: `Reservation by type ${roomType} does not exist.`
        })
      }
    }
  })
}

const updateReservationDetails = (req, res, next) => {
  let reservationId = req.params.id
  let reservationStatus = req.body.status

  if (!reservationId || !reservationStatus) {
    res.status(400).json({
      successful: false,
      message: "Reservation ID or status is missing."
    })
  } 
 else {
    let query = `SELECT id FROM reservations WHERE id = ${reservationId}`

    database.db.query(query, (err, rows) => {
      if (err) {
        res.status(500).json({
          successful: false,
          message: err
        })
      } 
     else {
        if (rows.length > 0) {
          let updateQuery = `UPDATE reservations SET status = '${reservationStatus}' WHERE id = ${reservationId}`

          database.db.query(updateQuery, (err, result) => {
            if (err) {
              res.status(500).json({
                successful: false,
                message: err
              })
            } 
            else if (reservationStatus !== 'reserved' && reservationStatus !== 'cancelled') {
              res.status(400).json({
                successful: false,
                message: "Invalid reservation status. Must be reserved or cancelled."
              })
            } 
            else {
              res.status(200).json({
                successful: true,
                message: "Successfully updated the reservation's status!"
              })
            }
          })
        } 
          else {
          res.status(404).json({
            successful: false,
            message: "Reservation ID does not exist."
          })
        }
      }
    })
  }
}

module.exports = {
  addReservation,
  viewReservationDetailsById,
  viewReservationByUser,
  viewReservationByType,
  viewAllReservations,
  updateReservationDetails
}