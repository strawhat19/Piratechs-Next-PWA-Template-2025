import { NextResponse } from 'next/server';
import { stripePaymentsDisabledMessage, stripePaymentsEnabled } from '@/shared/scripts/payments';
import { getStripeServerKey, retrieveStripeCheckoutSession, retrieveStripePaymentIntent, syncStripeOrderFromPaymentIntent } from '@/shared/server/stripe-orders';

type CompleteOrderRequest = {
    paymentIntentID?: string;
    checkoutSessionID?: string;
    sessionID?: string;
};

export const POST = async (request: Request) => {
    try {
        if (!stripePaymentsEnabled) return NextResponse.json({ ok: false, message: stripePaymentsDisabledMessage }, { status: 503 });

        const stripeServerKey = getStripeServerKey();
        if (!stripeServerKey) return NextResponse.json({ ok: false, message: `Missing STRIPE_SECRET_KEY or STRIPE_RESTRICTED_KEY.` }, { status: 500 });

        const body = await request.json() as CompleteOrderRequest;
        const checkoutSessionID = body?.checkoutSessionID || body?.sessionID;

        if (checkoutSessionID) {
            const checkoutSession = await retrieveStripeCheckoutSession(stripeServerKey, checkoutSessionID);
            const paymentIntent = typeof checkoutSession?.payment_intent == `string`
                ? await retrieveStripePaymentIntent(stripeServerKey, checkoutSession.payment_intent)
                : checkoutSession?.payment_intent;
            const order = await syncStripeOrderFromPaymentIntent(paymentIntent, checkoutSession);
            return NextResponse.json({ ok: true, order });
        }

        if (!body?.paymentIntentID) return NextResponse.json({ ok: false, message: `paymentIntentID or checkoutSessionID is required.` }, { status: 400 });

        const paymentIntent = await retrieveStripePaymentIntent(stripeServerKey, body.paymentIntentID);
        const order = await syncStripeOrderFromPaymentIntent(paymentIntent);
        return NextResponse.json({ ok: true, order });
    } catch (error) {
        return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : `Unable to complete order.` }, { status: 500 });
    }
}
