//CREATE OUR OWN SERVER

const HTTP = require('http')
const app = require('./app')

const port = 8000

const server = HTTP.createServer(app)

server.listen(port, ()=>{
    console.log(`Server is listening in port ${port}`)
})