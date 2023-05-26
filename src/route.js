require("dotenv").config()

const express = require("express")
const route = express.Router()

const stripeController = require("./controller/stripe")
const firebaseController = require("./controller/firebase")

route.get("/favicon.ico", (req, res) => {})

route.get("/", (req, res) => {
	res.render("index")
})

route.get("/:file", (req, res) => {
	res.render(`${req.params.file}`)
})

route.get("/hireTeacher/:professorId", (req, res) => {
	res.render("hireTeacher", { professorId: req.params.professorId })
})

route.get("/payment/:professorId", (req, res) => {
	res.render("payment", { professorId: req.params.professorId })
})

route.post("/create-checkout-session", (req, res) => stripeController.pay(req, res))

route.get("/successfull-payment/:studentId/:professorId/:amount", (req, res) => firebaseController.completedPayment(req, res))

route.get("/professor/:studentId/", (req, res) => {
	res.redirect(`/professor/${req.params.studentId}/tasks`)
})

route.get("/professor/:studentId/tasks", (req, res) => {
	res.render("professor-student-tasks", {studentId: req.params.studentId})
})


module.exports = route
