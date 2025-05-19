const Stripe = require('stripe');

const createStripeClient = () => {
    return new Stripe(process.env.STRIPE_SECRET_KEY);
};

module.exports = createStripeClient;
