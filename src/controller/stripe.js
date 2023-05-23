const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)

const firebase = require("firebase/app")
// const getDatabase = require("firebase/database")

const firebaseConfig = {
	apiKey: "AIzaSyDAIsfI77QWn1P-brER4E11ikPWJRdvQfc",
	authDomain: "tutormanagement-ff356.firebaseapp.com",
	databaseURL: "https://tutormanagement-ff356-default-rtdb.firebaseio.com",
	projectId: "tutormanagement-ff356",
	storageBucket: "tutormanagement-ff356.appspot.com",
	messagingSenderId: "202617977326",
	appId: "1:202617977326:web:554950c0b4ab924af7f6ff",
}

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig)

module.exports = {
	async pay(req, res) {
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
	},
}
