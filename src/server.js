const express = require("express")
const server = express()
const route = require("./route")
const path = require("path")

const port = 5500

server.set("views", path.join(__dirname, "views"))

server.set("view engine", "ejs")

server.use(express.urlencoded({ extended: true }))

server.use(express.static(__dirname + "../../" + "/public"))

server.use(express.json())

server.use(route)

server.listen(process.env.PORT || port, () => console.log("Ouvindo porta " + port))
