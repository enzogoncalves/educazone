const express = require("express")
const server = express()
const path = require("path")
const route = require("./route")

server.set("view engine", "ejs")

server.set("views", path.join(__dirname, "views"))

server.use(express.static("public"))

server.use(express.urlencoded({ extended: true })) // habilitar o uso do ejs no html

server.use(route)

server.listen(3300, () => console.log("Ouvindo porta 3300"))
