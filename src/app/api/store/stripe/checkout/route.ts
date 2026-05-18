import { NextRequest, NextResponse } from 'next/server';

type CheckoutRequest = {
    amount?: number;
    name?: string;
    quantity?: number;
};

const stripeApiVersion = `2025-04-30.basil`;

const getStripeServerKey = () => {
    return process.env.STRIPE_SECRET_KEY || process.env.STRIPE_RESTRICTED_KEY;
};

const getBaseUrl = (request: NextRequest) => {
    const origin = request.headers.get(`origin`);
    if (origin) return origin;

    const host = request.headers.get(`host`);
    const protocol = process.env.NODE_ENV == `development` ? `http` : `https`;
    return host ? `${protocol}://${host}` : `http://localhost:3000`;
};

export const POST = async (request: NextRequest) => {
    try {
        const stripeServerKey = getStripeServerKey();

        if (!stripeServerKey) {
            return NextResponse.json({
                ok: false,
                message: `Missing STRIPE_SECRET_KEY or STRIPE_RESTRICTED_KEY. Add a Stripe test server key to your environment to create checkout sessions.`,
            }, { status: 500 });
        }

        const body = await request.json() as CheckoutRequest;
        const amount = Number(body?.amount ?? 999);
        const quantity = Math.max(1, Math.min(10, Number(body?.quantity ?? 1)));
        const productName = body?.name?.trim() || `Piratechs Test Payment`;

        if (!Number.isInteger(amount) || amount < 50 || amount > 999999) {
            return NextResponse.json({
                ok: false,
                message: `Amount must be a whole number of cents between 50 and 999999.`,
            }, { status: 400 });
        }

        const baseUrl = getBaseUrl(request);
        const params = new URLSearchParams({
            mode: `payment`,
            success_url: `${baseUrl}/store?checkout=success`,
            cancel_url: `${baseUrl}/store?checkout=canceled`,
            [`line_items[0][quantity]`]: String(quantity),
            [`line_items[0][price_data][currency]`]: `usd`,
            [`line_items[0][price_data][unit_amount]`]: String(amount),
            [`line_items[0][price_data][product_data][name]`]: productName,
        });

        const stripeResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions`, {
            method: `POST`,
            headers: {
                Authorization: `Bearer ${stripeServerKey}`,
                [`Content-Type`]: `application/x-www-form-urlencoded`,
                [`Stripe-Version`]: stripeApiVersion,
            },
            body: params,
        });

        const session = await stripeResponse.json();

        if (!stripeResponse.ok) {
            return NextResponse.json({
                ok: false,
                message: session?.error?.message || `Unable to create Stripe checkout session.`,
            }, { status: stripeResponse.status });
        }

        return NextResponse.json({
            ok: true,
            id: session?.id,
            url: session?.url,
        });
    } catch (error) {
        return NextResponse.json({
            ok: false,
            message: `Unable to start checkout. Please try again.`,
        }, { status: 500 });
    }
};
