const { Router } = require("express")
const express = require("express")
const route = express.Router()

route.get("/favicon.ico", (req, res) => {})

route.get("/", (req, res) => {
	res.render("index")
})

route.get("/:file", (req, res) => {
	res.render(`${req.params.file}`)
})

route.get("/hireTeacher/:professorId", (req, res) => {
	res.render("hireTeacher", { professorId: req.params.professorId})
})

route.get("/payment/:professorId", (req, res) => {
	res.render("payment", { professorId: req.params.professorId})
})

module.exports = route
