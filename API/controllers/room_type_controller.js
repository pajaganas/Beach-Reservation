const database = require('../models/con_db')
const roomTypeModel = require('../models/room_type_model')

const addRoomType = (req, res, next) => {
    let roomType = req.body.type ? req.body.type.toLowerCase() : undefined;
    let capacity = req.body.capacity;
  
    if (!roomType || !capacity) {
        res.status(404).json({
            successful: false,
            message: "Required fields are not defined.",
        })
        return
    } 
    else if (roomType !== "single" && roomType !== "twin" && roomType !== "family") {
        res.status(400).json({
            successful: false,
            message: "Invalid room type. Allowed room type is single, twin, and family.",
        })
        return
    } 
    else if ((roomType === "single" && capacity !== 1) || (roomType === "twin" && capacity !== 2) || (roomType === "family" && capacity < 3)) {
        res.status(400).json({
            successful: false,
            message: "Invalid capacity for the given room type.",
        })
        return
    } 
    else {
        let insertQuery = `INSERT INTO room_type SET ?`
        let roomTypeObj = roomTypeModel.room_type_model(roomType, capacity)
  
        database.db.query(insertQuery, roomTypeObj, (err, rows, result) => {
            if (err) {
                res.status(500).json({
                    successful: false,
                    message: err
                })
            } 
            else {
                res.status(200).json({
                    successful: true,
                    message: "Room type is added successfully!"
                })
            }
        })
    }
}
  
const viewRoomTypeDetailsById = (req, res, next)=>{
    let roomTypeId = req.params.id
    let query = `SELECT type, capacity FROM room_type WHERE id = ${roomTypeId}`

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
                    message: `Successfully got room type ID number ${roomTypeId}!`,
                    data: rows[0]
                })
            } 
            else {
                res.status(500).json({
                    successful: false,
                    message: `Room type ID number ${roomTypeId} is not exist.`,
                    data: []
                })
            }
        }
    })
}

const viewAllRoomTypes = (req, res, next)=>{
    let query = `SELECT type, capacity FROM room_type`

    database.db.query(query, (err, rows, result)=>{
        if(err){
            res.status(500).json({
                successful:false,
                message: err
            })
        }
        else{
            if(rows.length > 0){
                res.status(200).json({
                    successful:true,
                    message: "Successfully got all room types!",
                    count: rows.length,
                    data: rows
                })
            }
            else{
                res.status(200).json({
                    successful:true,
                    message: "No room types available.",
                    count: rows.length,
                    data: rows
                })
            }
        }
    })
}

const deleteRoomType = (req, res, next) => {
    let roomTypeId = req.params.id
  
    if (!roomTypeId) {
        res.status(404).json({
            successful: false,
            message: "Room type ID is missing."
        })
        return
    }
  
    let query = `SELECT id FROM room_type WHERE id = ${roomTypeId}`
    database.db.query(query, (err, rows) => {
        if (err) {
            res.status(500).json({
                successful: false,
                message: err
            })
            return
        }
  
        if (rows.length > 0) {
            let deleteQuery = `DELETE FROM room_type WHERE id = ${roomTypeId}`
            database.db.query(deleteQuery, (err) => {
                if (err) {
                    res.status(500).json({
                        successful: false,
                        message: err
                    })
                    return
                }

                res.status(200).json({
                    successful: true,
                    message: "Successfully deleted the room type!"
                })
            })
        } 
        else {
            res.status(400).json({
                successful: false,
                message: "Room type ID does not exist."
            })
        }
    })
}
  

module.exports = {
    addRoomType,
    viewAllRoomTypes,
    viewRoomTypeDetailsById,
    deleteRoomType
}