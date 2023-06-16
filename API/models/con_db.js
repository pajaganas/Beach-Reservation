const mysql = require('mysql')

//DEFINE DATABASE DETAILS
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "beach_reservation"
})

const connectDatabase = ()=>{
    db.connect((error)=>{
        if (error){
            console.log("Error connecting to database.")
        }
        else{
            console.log("Successfully connected to database.")
        }
    })
}

module.exports = {
    connectDatabase,
    db
}