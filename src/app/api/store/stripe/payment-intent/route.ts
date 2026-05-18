import { NextResponse } from 'next/server';

type PaymentIntentRequest = {
    items?: PaymentIntentItem[];
};

type PaymentIntentItem = {
    name?: string;
    price?: number;
    quantity?: number;
};

const stripeApiVersion = `2025-04-30.basil`;

const getStripeServerKey = () => {
    return process.env.STRIPE_SECRET_KEY || process.env.STRIPE_RESTRICTED_KEY;
};

const getLineItems = (items?: PaymentIntentItem[]) => {
    if (!Array.isArray(items) || items.length == 0) {
        throw new Error(`Add at least one cart item before checkout.`);
    }

    return items.slice(0, 20).map((item) => {
        const amount = Number(item?.price);
        const quantity = Math.max(1, Math.min(99, Number(item?.quantity ?? 1)));
        const productName = item?.name?.trim() || `Piratechs Store Item`;

        if (!Number.isInteger(amount) || amount < 50 || amount > 999999) {
            throw new Error(`Each item price must be a whole number of cents between 50 and 999999.`);
        }

        return { amount, quantity, productName };
    });
};

export const POST = async (request: Request) => {
    try {
        const stripeServerKey = getStripeServerKey();

        if (!stripeServerKey) {
            return NextResponse.json({
                ok: false,
                message: `Missing STRIPE_SECRET_KEY or STRIPE_RESTRICTED_KEY. Add a Stripe test server key to your environment to create payment intents.`,
            }, { status: 500 });
        }

        const body = await request.json() as PaymentIntentRequest;
        const lineItems = getLineItems(body?.items);
        const amount = lineItems.reduce((total, item) => total + (item.amount * item.quantity), 0);
        const description = lineItems.map((item) => `${item.productName} x${item.quantity}`).join(`, `).slice(0, 500);
        const metadataItems = JSON.stringify(lineItems.map((item) => ({
            name: item.productName,
            quantity: item.quantity,
            amount: item.amount,
        }))).slice(0, 500);

        const params = new URLSearchParams({
            amount: String(amount),
            currency: `usd`,
            description,
            [`automatic_payment_methods[enabled]`]: `true`,
            [`metadata[cart_items]`]: metadataItems,
        });

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
