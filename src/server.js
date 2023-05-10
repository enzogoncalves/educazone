const express = require("express")
const server = express()
const route = require("./route")

const port = 5500

server.set("views", "./src/views")
server.set("view engine", "ejs")

server.use(express.urlencoded({ extended: true }))

server.use(express.static("public"))
server.use("/css", express.static(__dirname + "public/css"))
server.use("/js", express.static(__dirname + "public/js"))
server.use("/img", express.static(__dirname + "public/img"))

server.use(express.json())

server.use(route)

server.listen(process.env.PORT || port, () => console.log("Ouvindo porta " + port))
