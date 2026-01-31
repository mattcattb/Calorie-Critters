import {zValidator} from "@hono/zod-validator";
import {appEnv} from "../common/env";
import {stripe} from "../lib/stripe";
import {billingService} from "./billing.service";
import { BadRequestException } from "../common/errors";
import z from "zod";
import {createRouter} from "../common/hono";

export const createCheckoutSchema = z.object({
  priceId: z.string().optional(),
});

export const billingController = createRouter()
  .post(
    "/create-checkout-session",
    zValidator("json", createCheckoutSchema),
    async (c) => {
      const userId = c.get("userId");
      const {priceId} = c.req.valid("json");

      const result = await billingService.createCheckoutSession(
        userId,
        priceId,
      );
      return c.json(result);
    },
  )
  .post("/create-portal-session", async (c) => {
    const userId = c.get("userId");

    const result = await billingService.createPortalSession(userId);
    return c.json(result);
  });

// Webhook handler (mounted separately without auth)
export const billingWebhook = createRouter().post("/", async (c) => {
  const sig = c.req.header("stripe-signature");
  const body = await c.req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      appEnv.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    throw new BadRequestException("Webhook signature verification failed");
  }

  await billingService.handleWebhook(event);
  return c.json({received: true});
});
