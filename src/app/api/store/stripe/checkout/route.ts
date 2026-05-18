import { NextRequest, NextResponse } from 'next/server';

type CheckoutRequest = {
    amount?: number;
    items?: CheckoutItem[];
    name?: string;
    quantity?: number;
    returnPath?: string;
};

type CheckoutItem = {
    name?: string;
    price?: number;
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

const getReturnPath = (returnPath?: string) => {
    if (!returnPath || !returnPath.startsWith(`/`) || returnPath.startsWith(`//`)) return `/store`;
    return returnPath.split(`?`)[0] || `/store`;
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
        const checkoutItems = Array.isArray(body?.items) && body.items.length > 0
            ? body.items.slice(0, 20)
            : [{
                name: body?.name,
                price: body?.amount,
                quantity: body?.quantity,
            }];

        const lineItems = checkoutItems.map((item) => {
            const amount = Number(item?.price ?? 999);
            const quantity = Math.max(1, Math.min(99, Number(item?.quantity ?? 1)));
            const productName = item?.name?.trim() || `Piratechs Store Item`;

            if (!Number.isInteger(amount) || amount < 50 || amount > 999999) {
                throw new Error(`Each item price must be a whole number of cents between 50 and 999999.`);
            }

            return { amount, quantity, productName };
        });

        const baseUrl = getBaseUrl(request);
        const returnPath = getReturnPath(body?.returnPath);
        const params = new URLSearchParams({
            mode: `payment`,
            success_url: `${baseUrl}${returnPath}?checkout=success`,
            cancel_url: `${baseUrl}${returnPath}?checkout=canceled`,
        });

        lineItems.forEach((item, index) => {
            params.set(`line_items[${index}][quantity]`, String(item.quantity));
            params.set(`line_items[${index}][price_data][currency]`, `usd`);
            params.set(`line_items[${index}][price_data][unit_amount]`, String(item.amount));
            params.set(`line_items[${index}][price_data][product_data][name]`, item.productName);
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
            message: error instanceof Error ? error.message : `Unable to start checkout. Please try again.`,
        }, { status: 500 });
    }
};
