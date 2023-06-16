const database = require('../models/con_db')
const userModel = require('../models/user_model')
const bcrypt = require('bcrypt')
const util =  require('..//..//utils')

const login = (req, res, next) => {
    let userEmail = req.body.email_add
    let userPass = req.body.password

    if (userEmail == "" || userEmail == null || userPass == "" || userPass == null){
        res.status(400).json({
            successful: false,
            message: "Email or password is missing"
        })
    }
    else{
        let query = `SELECT * FROM users WHERE email_add = '${userEmail}'`;

        database.db.query(query, (err, rows, result) => {
            if (err) {
                res.status(500).json({
                    successful: false,
                    message: err
                })
            } 
            else {
                if (rows.length === 0) {
                    res.status(404).json({
                        successful: false,
                        message: "User not found."
                    })
                } 
                else {
                    const user = rows[0];
                    bcrypt.compare(userPass, user.password, (err, result) => {
                        if (err) {
                            res.status(500).json({
                                successful: false,
                                message: err
                            })
                        } 
                        else if (result) {
                            res.status(200).json({
                                successful: true,
                                message: "Successfully logged in!"
                            })
                        } 
                        else {
                            res.status(401).json({
                                successful: false,
                                message: "Invalid password."
                            })
                        }
                    })
                }
            }
        })
    }
}

const addUser = (req, res, next) => {
    let userFirstName = req.body.first_name ? req.body.first_name.toLowerCase() : undefined
    let userLastName = req.body.last_name ? req.body.last_name.toLowerCase() : undefined
    let userContact = req.body.contact_no
    let userRole = req.body.role ? req.body.role.toLowerCase() : undefined
    let userEmail = req.body.email_add
    let userPass = req.body.password
    let userStatus = req.body.status ? req.body.status.toLowerCase() : undefined
    let userAddress = req.body.address ? req.body.address.toLowerCase() : undefined
    let userBirthdate = req.body.birthdate
    let userEmergencyContact = req.body.emergency_contact
    let userPosition = req.body.position ? req.body.position.toLowerCase() : undefined
  
    if (userFirstName === "" || userFirstName === null || userLastName === "" || userLastName === null) {
      res.status(404).json({
        successful: false,
        message: "First name or last name is not defined."
      })
      return
    } 
    else if (util.checkName(userFirstName) || util.checkName(userLastName)) {
      res.status(400).json({
        successful: false,
        message: "First name or last name cannot contain special characters."
      })
      return
    } 
    else if (!["admin", "employee", "customer"].includes(userRole)) {
        res.status(400).json({
            successful: false,
            message: "Invalid user role. Allowed roles are admin, employee, and customer."
        })
        return
    }
  
    if (userRole === "customer") {
      if (userAddress || userBirthdate || userEmergencyContact || userPosition) {
        res.status(400).json({
            successful: false,
            message: "Customer role does not require address, birthdate, emergency contact, and position."
        })
        return
      }
    } 
    else if (userRole === "admin" || userRole === "employee") {
      if (!userAddress || !userBirthdate || !userEmergencyContact || !userPosition) {
        res.status(400).json({
          successful: false,
          message: "Admin and employee roles require address, birthdate, emergency contact, and position."
        })
        return
      }
    }
    if (!util.checkNumber(userContact) && !util.checkNumber(userEmergencyContact)) {
        res.status(400).json({
            successful: false,
            message: "Invalid emergency or contact number format. The number should start with '+639' and be followed by 9 digits."
        })
        return
    }

    if (userRole === "admin" && userPosition !== "manager" && userPosition !== "receptionist") {
        res.status(400).json({
            successful: false,
            message: "Invalid position for admin role. Allowed positions are manager and receptionist."
        })
        return
    }

    if (userRole === "employee" && userPosition !== "cleaner" && userPosition !== "room attendant" && userPosition !== "room server") {
        res.status(400).json({
            successful: false,
            message: "Invalid position for employee role. Allowed positions are cleaner, room attendant, and room server."
        })
        return
    }

    if (userRole === "admin" || userRole === "employee") {
        if (!userBirthdate || util.calculateAge(userBirthdate) < 18) {
            res.status(400).json({
                successful: false,
                message: "Admin and employee must be 18 and above."
            })
            return
        }
    }

    let query = `SELECT email_add FROM users WHERE email_add = '${userEmail}'`
    database.db.query(query, (err, rows, result) => {
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
                    message: "Email address is already taken."
                })
            }
            else if (!util.checkEmail(userEmail)) {
                res.status(400).json({
                    successful: false,
                    message: "Invalid email address format. Must end with '@gmail.com', '@yahoo.com' and '@outlook.com'"
                })
            }
            else if(!util.checkPassword(userPass)){
                res.status(400).json({
                    successful: false,
                    message: "Invalid password format. Must be 8 characters with atleast one digit, special character, uppercase and lowercase letter."
                })
            }
            else {
                bcrypt.hash(userPass, 10, (err, hashedPassword) => {
                    if (err) {
                        res.status(500).json({
                            successful: false,
                            message: "Error in hashing password."
                        })
                    }
                    else {
                        let insertQuery = `INSERT INTO users SET ?`
                        let userObj

                        if (userRole === "admin" || userRole === "employee") {
                            userObj = userModel.user_model(userFirstName, userLastName, userContact, userRole, userEmail, hashedPassword, userStatus, userAddress, userBirthdate, userEmergencyContact, userPosition);
                        } 
                        else {
                            userObj = userModel.user_model(userFirstName, userLastName, userContact, userRole, userEmail, hashedPassword, userStatus);
                        }

                        database.db.query(insertQuery, userObj, (err, rows, result) => {
                            if (err) {
                                res.status(500).json({
                                    successful: false,
                                    message: err
                                })
                            } 
                            else {
                                res.status(200).json({
                                    successful: true,
                                    message: "Successfully added new user!"
                                })
                            }
                        })
                    }
                })
            }
        }
    })
}

const viewAllUsers = (req, res, next)=>{
    let query = `SELECT first_name, last_name, contact_no, role, email_add, address, DATE_FORMAT(birthdate, '%Y-%m-%d') AS birthdate, emergency_contact, position, status FROM users`

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
                    message: "Successfully got all users!",
                    count: rows.length,
                    data: rows
                })
            }
            else{
                res.status(200).json({
                    successful:true,
                    message: "No users available.",
                    count: rows.length,
                    data: rows
                })
            }
        }
    })
}

const viewUserDetailsById = (req, res, next)=>{
    let userId = req.params.id
    let query = `SELECT first_name, last_name, contact_no, role, email_add, address, DATE_FORMAT(birthdate, '%Y-%m-%d') AS birthdate, emergency_contact, position, status FROM users WHERE id = ${userId}`

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
                    message: `Successfully got user ID number ${userId}!`,
                    data: rows[0]
                })
            } 
            else {
                res.status(500).json({
                    successful: false,
                    message: `User ID number ${userId} is not exist.`,
                    data: []
                })
            }
        }
    })
}

const updateUserContactNo = (req, res, next) => {
    let userId = req.params.id;
    let userContact = req.body.contact_no;
  
    if (userId === '' || userId === null) {
        res.status(400).json({
            successful: false,
            message: 'User ID is missing.',
        })
    } 
    else {
        let query = `SELECT id, contact_no FROM users WHERE id = ${userId}`;
  
        database.db.query(query, (err, rows, result) => {
            if (err) {
                res.status(500).json({
                    successful: false,
                    message: err
                })
            } 
            else {
                if (rows.length > 0) {
                    let existingContact = rows[0].contact_no;
                    let updateQuery = '';
                    let messages = [];

                    if(util.checkNumber(userContact)){
                        if (userContact !== existingContact) {
                            updateQuery += `contact_no = '${userContact}', `;
                            messages.push("Successfully updated the user's contact number!")
                        }
                    }
                    else{
                        res.status(400).json({
                            successful: false,
                            message: "Invalid contact number format. The number should start with '+639' and be followed by 9 digits."
                        })
                        return
                    } 
  
                    if (messages.length > 0) {
                        updateQuery = updateQuery.slice(0, -2)
                        let updateUserQuery = `UPDATE users SET ${updateQuery} WHERE id = ${userId}`
  
                        database.db.query(updateUserQuery, (err, rows, result) => {
                            if (err) {
                                res.status(500).json({
                                    successful: false,
                                    message: err
                                })
                            } 
                            else {
                                res.status(200).json({
                                    successful: true,
                                    message: messages.join(" ")
                                })
                            }
                        })
                    } 
                    else {
                        res.status(400).json({
                            successful: false,
                            message: 'No updates provided for the contact number.'
                        })
                    }
                } 
                else {
                    res.status(400).json({
                        successful: false,
                        message: "User does not exist."
                    })
                }
            }
        })
    }
}

const updateUserPassword = (req, res, next) => {
    let userId = req.params.id
    let userPass = req.body.password
    let oldPass = req.body.oldPassword

    if (userId === '' || userId === null) {
        res.status(400).json({
            successful: false,
            message: "User ID is missing."
        })
    } 
    else {
        let query = `SELECT id, password FROM users WHERE id = ${userId}`;

        database.db.query(query, (err, rows, result) => {
            if (err) {
                res.status(500).json({
                    successful: false,
                    message: err
                })
            } 
            else {
                if (rows.length > 0) {
                    let existingPassword = rows[0].password
                    let updateQuery = ''
                    let messages = []

                    if (util.checkPassword(userPass)) {
                        if (userPass !== existingPassword) {
                            if (oldPass !== existingPassword) {
                                bcrypt.hash(userPass, 10, (err, hashedPassword) => {
                                    if (err) {
                                        res.status(500).json({
                                            successful: false,
                                            message: err
                                        })
                                    } 
                                    else {
                                        updateQuery += `password = '${hashedPassword}',`
                                        messages.push("Successfully updated the user's password!")

                                        if (updateQuery !== '') {
                                            updateQuery = updateQuery.slice(0, -1)
                                            let updateUserQuery = `UPDATE users SET ${updateQuery} WHERE id = ${userId}`

                                            database.db.query(updateUserQuery, (err, rows, result) => {
                                                if (err) {
                                                    res.status(500).json({
                                                        successful: false,
                                                        message: err
                                                    })
                                                } 
                                                else {
                                                    res.status(200).json({
                                                        successful: true,
                                                        message: messages.join(" ")
                                                    })
                                                }
                                            })
                                        } 
                                        else {
                                            res.status(400).json({
                                                successful: false,
                                                message: 'No updates provided or the same value was provided for the password.'
                                            })
                                        }
                                    }
                                })
                            } 
                            else {
                                res.status(400).json({
                                    successful: false,
                                    message: 'Old password and new password cannot be the same.'
                                })
                            }
                        } 
                        else {
                            res.status(400).json({
                                successful: false,
                                message: 'No updates provided or the same value was provided for the password.'
                            })
                        }
                    } 
                    else {
                        res.status(400).json({
                            successful: false,
                            message: "Invalid password format. Must be 8 characters with at least one digit, special character, uppercase and lowercase letter."
                        })
                    }
                } 
                else {
                    res.status(400).json({
                        successful: false,
                        message: 'User does not exist.'
                    })
                }
            }
        })
    }
}

const deleteUserById = (req, res, next) => {
    let userId = req.params.id

    if (userId == "" || userId == null) {
        res.status(404).json({
            successful: false,
            message: "User is missing."
        })
    } 
    else {
        let query = `SELECT id FROM users WHERE id = ${userId}`

        database.db.query(query, (err, rows, result) => {
            if (err) {
                res.status(500).json({
                    successful: false,
                    message: err
                })
            } 
            else {
                if (rows.length > 0) {
                    let deleteQuery = `UPDATE users SET status = 'inactive' WHERE id = ${userId}`

                    database.db.query(deleteQuery, (err, rows, result) => {
                        if (err) {
                            res.status(500).json({
                                successful: false,
                                message: err
                            })
                        } 
                        else {
                            res.status(200).json({
                                successful: true,
                                message: "Successfully deleted a user!"
                            })
                        }
                    })
                } 
                else {
                    res.status(400).json({
                        successful: true,
                        message: "User ID does not exist."
                    })
                }
            }
        })
    }
}


module.exports = {
    login,
    addUser,
    viewAllUsers,
    viewUserDetailsById,
    updateUserContactNo,
    updateUserPassword,
    deleteUserById
}