require("dotenv").config()

const express = require("express")
const route = express.Router()

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)

const storeItems = new Map([
	[1, { priceInCents: 1000, name: "Learn React Today" }],
	[2, { priceInCents: 2000, name: "Learn CSS Today" }],
])

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
	try {
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			mode: "payment",
			line_items: req.body.items.map(item => {
				const storeItem = storeItems.get(item.id)
				return {
					price_data: {
						currency: "brl",
						product_data: {
							name: storeItem.name,
						},
						unit_amount: storeItem.priceInCents,
					},
					quantity: item.quantity,
				}
			}),
			success_url: `${process.env.SERVER_URL}/success.html`,
			cancel_url: `${process.env.SERVER_URL}/cancel.html`,
		})
		res.json({ url: session.url })
	} catch (e) {
		res.status(500).json({ error: e.message })
	}
})

module.exports = route
