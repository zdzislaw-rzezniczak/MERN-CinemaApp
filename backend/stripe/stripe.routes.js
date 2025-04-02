const express = require("express");
const { getPaymentStripe } = require("../stripe/stripe.controller");

const router = express.Router();

router.post("/:id", getPaymentStripe);

module.exports = router;
