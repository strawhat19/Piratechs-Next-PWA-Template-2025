import { NextResponse } from 'next/server';
import { stripePaymentsDisabledMessage, stripePaymentsEnabled } from '@/shared/scripts/payments';
import { createPendingStripeOrder, getStripeServerKey, normalizeStripeLineItems, setStripeMetadataParams, stripeApiVersion, stripeOrderMetadata } from '@/shared/server/stripe-orders';

type PaymentIntentRequest = {
    items?: PaymentIntentItem[];
    userID?: string;
    userEmail?: string;
    userName?: string;
};

type PaymentIntentItem = {
    id?: string | number;
    sku?: string;
    category?: string;
    name?: string;
    price?: number;
    quantity?: number;
};

export const POST = async (request: Request) => {
    try {
        if (!stripePaymentsEnabled) {
            return NextResponse.json({ ok: false, message: stripePaymentsDisabledMessage }, { status: 503 });
        }

        const stripeServerKey = getStripeServerKey();

        if (!stripeServerKey) {
            return NextResponse.json({
                ok: false,
                message: `Missing STRIPE_SECRET_KEY or STRIPE_RESTRICTED_KEY. Add a Stripe test server key to your environment to create payment intents.`,
            }, { status: 500 });
        }

        const body = await request.json() as PaymentIntentRequest;
        const order = await createPendingStripeOrder(body?.items, { userID: body?.userID, userEmail: body?.userEmail, userName: body?.userName }, `Stripe Payment Intent`);
        const lineItems = normalizeStripeLineItems(body?.items);
        const amount = lineItems.reduce((total, item) => total + item.amount, 0);
        const description = lineItems.map((item) => `${item.name} x${item.quantity}`).join(`, `).slice(0, 500);
        const metadataItems = JSON.stringify(lineItems.map((item) => ({
            name: item.name,
            amount: item.amount,
            quantity: item.quantity,
        }))).slice(0, 500);

        const params = new URLSearchParams({
            description,
            currency: `usd`,
            amount: String(amount),
            [`metadata[cart_items]`]: metadataItems,
            [`automatic_payment_methods[enabled]`]: `true`,
        });
        setStripeMetadataParams(params, stripeOrderMetadata(order));

        const stripeResponse = await fetch(`https://api.stripe.com/v1/payment_intents`, {
            method: `POST`,
            headers: {
                Authorization: `Bearer ${stripeServerKey}`,
                [`Content-Type`]: `application/x-www-form-urlencoded`,
                [`Stripe-Version`]: stripeApiVersion,
            },
            body: params,
        });

        const paymentIntent = await stripeResponse.json();

        if (!stripeResponse.ok) {
            return NextResponse.json({
                ok: false,
                message: paymentIntent?.error?.message || `Unable to create Stripe payment intent.`,
            }, { status: stripeResponse.status });
        }

        return NextResponse.json({
            ok: true,
            orderID: order.id,
            clientSecret: paymentIntent?.client_secret,
            id: paymentIntent?.id,
        });
    } catch (error) {
        return NextResponse.json({
            ok: false,
            message: error instanceof Error ? error.message : `Unable to create payment intent.`,
        }, { status: 500 });
    }
};
