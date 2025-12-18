// server.js
const express = require("express");
const Stripe = require("stripe"); // ✅ Proper import of Stripe
const stripe = Stripe('sk_test_51SfFfjFj0F2OwNoB5l5DVgqQmg3StKHqHTKRyezPPB16qvCNovsnA27RHZlInbLm69PB07KIh4XoK43NYUGqck7800fvIl9FDn'); // 🔴 Replace with your secret key

const app = express();
app.use(express.json());
app.use(express.static("public")); // Serve static HTML pages from public/

/* ================= SPOTIFY PREMIUM PLANS (API DATA) ================= */
const plans = [
  {
    id: "individual",
    name: "Premium Individual",
    price: 14900,
    description: "For one person, offering all Premium features."
  },
  {
    id: "duo",
    name: "Premium Duo",
    price: 19900,
    description: "For two people living at the same address, with two separate accounts."
  },
  {
    id: "family",
    name: "Premium Family",
    price: 23900,
    description: "For up to six family members living at the same address, including parental controls."
  },
  {
    id: "student",
    name: "Premium Student",
    price: 7500,
    description: "Discounted rate for eligible students, often bundled with other services."
  }
];

/* ================= FETCH PLANS API ================= */
app.get("/plans", (req, res) => {
  res.json(plans);
});

/* ================= STRIPE CHECKOUT ================= */
app.post("/create-checkout-session", async (req, res) => {
  const { planId } = req.body;
  const selectedPlan = plans.find(p => p.id === planId);

  if (!selectedPlan) {
    return res.status(400).json({ error: "Invalid plan selected" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "php",
            product_data: {
              name: `Spotify ${selectedPlan.name}`
            },
            unit_amount: selectedPlan.price
          },
          quantity: 1
        }
      ],
      mode: "payment",
      success_url: "http://localhost:3000/success.html",
      cancel_url: "http://localhost:3000/cancel.html"
    });

    res.json({
      id: session.id,
      url: session.url
    });

  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ================= START SERVER ================= */
app.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});
