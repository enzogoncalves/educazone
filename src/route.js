require("dotenv").config()

const express = require("express")
const route = express.Router()

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)

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

route.post("/create-checkout-session", async (req, res) => {
	const price_in_cents = req.body.item.price * 100

	try {
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			mode: "payment",
			line_items: [
				{
					price_data: {
						currency: "brl",
						product_data: {
							name: req.body.item.name,
						},
						unit_amount: price_in_cents,
					},
					quantity: 1,
				},
			],
			success_url: `${process.env.SERVER_URL}/success`,
			cancel_url: `${process.env.SERVER_URL}/cancel`,
		})
		res.json({ url: session.url })
	} catch (e) {
		res.status(500).json({ error: e.message })
	}
})

module.exports = route
