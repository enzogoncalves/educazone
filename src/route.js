const express = require("express")
const route = express.Router()

route.get("/", (req, res) => {
	res.redirect("/educazone")
})

route.get("/educazone", (req, res) => {
	res.render("index")
})

route.get("/favicon.ico", (req, res) => {})
route.get("/educazone/favicon.ico", (req, res) => {})

route.get("/:file", (req, res) => {
	res.redirect(`/educazone/${req.params.file}`)
})

route.get("/educazone/:file", (req, res) => {
	res.render(`${req.params.file}`)
})

module.exports = route
