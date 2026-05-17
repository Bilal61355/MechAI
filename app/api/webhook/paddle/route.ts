import { NextRequest, NextResponse } from "next/server";
import { Paddle, Environment } from "@paddle/paddle-node-sdk";
import { createServiceClient } from "@/utils/supabase/service";

const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment: Environment.production,
});

// Tell Next.js not to parse the body — we need the raw string for signature verification
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("paddle-signature") ?? "";
  const rawBody = await req.text(); // Must be raw text — do NOT use req.json()

  try {
    const event = await paddle.webhooks.unmarshal(
      rawBody,
      process.env.PADDLE_WEBHOOK_SECRET!,
      signature
    );

    const service = createServiceClient();

    switch (event.eventType) {
      // Subscription created / reactivated → grant access
      case "subscription.activated":
      case "subscription.updated": {
        const sub = event.data as {
          id: string;
          customData?: { userId?: string };
          currentBillingPeriod?: { endsAt?: string };
          status: string;
        };

        const userId = sub.customData?.userId;
        if (!userId) break;

        const validUntil =
          sub.currentBillingPeriod?.endsAt ??
          new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();

        await service.from("subscriptions").upsert(
          {
            user_id: userId,
            paddle_subscription_id: sub.id,
            status: "active",
            valid_until: validUntil,
          },
          { onConflict: "user_id" }
        );
        break;
      }

      // Payment renewed → extend valid_until
      case "transaction.completed": {
        const tx = event.data as {
          customData?: { userId?: string };
          subscriptionId?: string;
        };

        const userId = tx.customData?.userId;
        if (!userId) break;

        const newValidUntil = new Date(
          Date.now() + 31 * 24 * 60 * 60 * 1000
        ).toISOString();

        await service
          .from("subscriptions")
          .update({ status: "active", valid_until: newValidUntil })
          .eq("user_id", userId);
        break;
      }

      // Subscription cancelled / payment failed → revoke access
      case "subscription.canceled":
      case "subscription.past_due": {
        const sub = event.data as {
          customData?: { userId?: string };
          id: string;
        };

        const userId = sub.customData?.userId;
        if (!userId) break;

        await service
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("user_id", userId);
        break;
      }

      default:
        // Unhandled event — ignore
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Paddle webhook error:", err);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }
}
