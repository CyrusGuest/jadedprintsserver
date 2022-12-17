// This is your test secret API key.
const stripe = require('stripe')('key');
const express = require('express');
const cors = require('cors');
const app = express();
const price_catalog = require('./productPrices')
app.use(express.static('public'));

app.use(cors());
app.use(express.json())

const YOUR_DOMAIN = 'https://639cd515ba25630008f8152f--singular-seahorse-d8e7f0.netlify.app/';

app.post('/create-checkout-session', async (req, res) => {
  const cart = req.body;

  let line_items = [];

  for (let i = 0; i < cart.length; i++) {
    const product = cart[i]
    const price = price_catalog[product.id][product.size]

    line_items.push({ price, quantity: product.quantity });
  };

  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}/ordersuccess`,
    cancel_url: `${YOUR_DOMAIN}/cart`,
    billing_address_collection: 'auto',
    shipping_address_collection: {
      allowed_countries: ['US'],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {amount: 0, currency: 'usd'},
          display_name: 'Free shipping',
          delivery_estimate: {
            minimum: {unit: 'business_day', value: 5},
            maximum: {unit: 'business_day', value: 7},
          },
          tax_behavior: 'exclusive'
        },
      },
    ],
    automatic_tax: { enabled: true },
  });

  res.status(200).send(session.url);
});

app.post('/album-requests', async (req, res) => {
  const request = req.body;

  console.log(request);

  res.sendStatus(200);
});

app.listen(4242, () => console.log('Running on port 4242'));