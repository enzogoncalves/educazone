require("dotenv").config()

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)

module.exports = {
	async pay(req, res) {
		const price_in_cents = req.body.payment.price * 100
		try {
			const session = await stripe.checkout.sessions.create({
				payment_method_types: ["card"],
				mode: "payment",
				line_items: [
					{
						price_data: {
							currency: "brl",
							product_data: {
								name: req.body.payment.name,
							},
							unit_amount: price_in_cents,
						},
						quantity: 1,
					},
				],
				success_url: `${process.env.SERVER_URL}/successfull-payment/${req.body.payment.studentId}/${req.body.payment.professorId}/${req.body.payment.price}`,
				cancel_url: `${process.env.SERVER_URL}/cancel`,
			})
			res.json({ url: session.url })
		} catch (e) {
			res.status(500).json({ error: e.message })
		}
	},
}
