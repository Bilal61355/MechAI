import { NextRequest, NextResponse } from "next/server";
import { Paddle, Environment } from "@paddle/paddle-node-sdk";
import { createClient } from "@/utils/supabase/server";

const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment: Environment.production,
});

export async function POST(req: NextRequest) {
  // Verify user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const origin = new URL(req.url).origin;

  try {
    // Create a Paddle transaction — passes userId as custom_data so the
    // webhook can link the payment back to the correct Supabase user
    const transaction = await paddle.transactions.create({
      items: [
        {
          priceId: process.env.PADDLE_PRICE_ID!,
          quantity: 1,
        },
      ],
      customData: { userId: user.id, userEmail: user.email },
      // After checkout, Paddle redirects here
      checkout: {
        url: `${origin}/diagnose?upgrade=success`,
      },
    });

    return NextResponse.json({ transactionId: transaction.id });
  } catch (err: any) {
    console.error("Paddle checkout error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
