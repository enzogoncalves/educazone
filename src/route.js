const express = require("express")
const route = express.Router()

route.get("/favicon.ico", (req, res) => {})

route.get("/", (req, res) => {
	res.render("index")
})

route.get("/:file", (req, res) => {
	res.render(`${req.params.file}`)
})

module.exports = route
