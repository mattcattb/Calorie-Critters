import Stripe from "stripe";
import { stripe, PLANS } from "../lib/stripe";
import { BadRequestException, ServiceException } from "../common/errors";
import { appEnv } from "../common/env";
import { db } from "../db";
import { user } from "../db/schema";
import { eq } from "drizzle-orm";

export const billingService = {
  async createCheckoutSession(userId: string, priceId?: string) {
    const [currentUser] = await db.select().from(user).where(eq(user.id, userId));

    let customerId = currentUser.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: currentUser.email,
        metadata: { userId },
      });
      customerId = customer.id;

      await db
        .update(user)
        .set({ stripeCustomerId: customerId })
        .where(eq(user.id, userId));
    }

    if (!PLANS.pro.priceId && !priceId) {
      throw new ServiceException("Missing Stripe price configuration");
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId || PLANS.pro.priceId!,
          quantity: 1,
        },
      ],
      success_url: `${appEnv.BETTER_AUTH_URL}/dashboard?success=true`,
      cancel_url: `${appEnv.BETTER_AUTH_URL}/pricing?canceled=true`,
    });

    return { url: session.url };
  },

  async createPortalSession(userId: string) {
    const [currentUser] = await db.select().from(user).where(eq(user.id, userId));

    if (!currentUser.stripeCustomerId) {
      throw new BadRequestException("No subscription found");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: currentUser.stripeCustomerId,
      return_url: `${appEnv.BETTER_AUTH_URL}/dashboard`,
    });

    return { url: session.url };
  },

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await db
          .update(user)
          .set({ subscriptionStatus: subscription.status })
          .where(eq(user.stripeCustomerId, customerId));
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await db
          .update(user)
          .set({ subscriptionStatus: null })
          .where(eq(user.stripeCustomerId, customerId));
        break;
      }
    }
  },
};
