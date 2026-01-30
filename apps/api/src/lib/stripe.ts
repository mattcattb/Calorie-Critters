import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export const PLANS = {
  free: {
    name: "Free",
    priceId: null,
    features: ["Track up to 10 entries/day", "7-day history"],
  },
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      "Unlimited tracking",
      "Full history",
      "Advanced analytics",
      "Export data",
    ],
  },
} as const;
