import { auth } from '@/app/(auth)/auth';
import { createSubs } from '@/lib/db/queries';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(request: Request) {
    const { sessionId } = await request.json();
    const userSession = await auth();

    if (!userSession?.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        console.log("session", session);
        if (session.payment_status !== 'paid') {
            return NextResponse.json(
                { error: 'Payment not completed yet.' },
                { status: 400 }
            );
        }
        const stripeSubscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        // 3️⃣ Extract what you need
        const stripeCustomerId = session.customer as string;
        const stripeSubscriptionId = stripeSubscription.id;

        // **pull the first `subscription_item`**
        const priceItem = stripeSubscription.items.data[0];
        const priceId = priceItem.price.id;
        const quantity = priceItem.quantity ?? 1;

        // **dates live on the item** in your sample:
        const currentPeriodStart = new Date(
            priceItem.current_period_start * 1000
        );
        const currentPeriodEnd = new Date(
            priceItem.current_period_end * 1000
        );

        // cancellation flags still on the subscription itself:
        const cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
        const cancelAt = stripeSubscription.cancel_at
            ? new Date(stripeSubscription.cancel_at * 1000)
            : null;

        const now = new Date();
        const userId = userSession?.user.id;
        if (!userId) {
            return new Response('Unauthorized', { status: 401 });
        }
        if (session.payment_status === 'paid') {
            // Update your database to mark the user as subscribed
            await createSubs(stripeCustomerId, stripeSubscriptionId, userId, priceId, quantity, cancelAtPeriodEnd, currentPeriodStart, currentPeriodEnd, cancelAt);
        }

        return NextResponse.json({ session });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 400 });
    }
}