import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { stripe } from "../lib/stripe";
import { billingService } from "./billing.service";
import { createCheckoutSchema } from "./billing.schema";

export const billingController = new Hono()
  .post("/create-checkout-session", zValidator("json", createCheckoutSchema), async (c) => {
    const userId = c.get("userId");
    const { priceId } = c.req.valid("json");

    try {
      const result = await billingService.createCheckoutSession(userId, priceId);
      return c.json(result);
    } catch {
      return c.json({ error: "Failed to create checkout session" }, 500);
    }
  })
  .post("/create-portal-session", async (c) => {
    const userId = c.get("userId");

    try {
      const result = await billingService.createPortalSession(userId);
      return c.json(result);
    } catch {
      return c.json({ error: "No subscription found" }, 400);
    }
  });

// Webhook handler (mounted separately without auth)
export const billingWebhook = new Hono().post("/", async (c) => {
  const sig = c.req.header("stripe-signature");
  const body = await c.req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return c.json({ error: "Webhook signature verification failed" }, 400);
  }

  await billingService.handleWebhook(event);
  return c.json({ received: true });
});
