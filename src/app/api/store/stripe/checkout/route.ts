import { NextRequest, NextResponse } from 'next/server';
import { stripePaymentsDisabledMessage, stripePaymentsEnabled } from '@/shared/scripts/payments';
import { createPendingStripeOrder, getStripeServerKey, normalizeStripeLineItems, setStripeMetadataParams, stripeApiVersion, stripeOrderMetadata } from '@/shared/server/stripe-orders';

type CheckoutRequest = {
    amount?: number;
    items?: CheckoutItem[];
    name?: string;
    quantity?: number;
    returnPath?: string;
    userID?: string;
    userEmail?: string;
    userName?: string;
};

type CheckoutItem = {
    id?: string | number;
    sku?: string;
    category?: string;
    name?: string;
    price?: number;
    quantity?: number;
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
        if (!stripePaymentsEnabled) {
            return NextResponse.json({ ok: false, message: stripePaymentsDisabledMessage }, { status: 503 });
        }

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

        const order = await createPendingStripeOrder(checkoutItems, { userID: body?.userID, userEmail: body?.userEmail, userName: body?.userName }, `Stripe Checkout`);
        const lineItems = normalizeStripeLineItems(checkoutItems);

        const baseUrl = getBaseUrl(request);
        const returnPath = getReturnPath(body?.returnPath);
        const params = new URLSearchParams({
            mode: `payment`,
            client_reference_id: String(order.id),
            success_url: `${baseUrl}${returnPath}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}${returnPath}?checkout=canceled`,
        });
        if (body?.userEmail) params.set(`customer_email`, body.userEmail);
        const metadata = stripeOrderMetadata(order);
        setStripeMetadataParams(params, metadata);
        setStripeMetadataParams(params, metadata, `payment_intent_data[metadata]`);

        lineItems.forEach((item, index) => {
            params.set(`line_items[${index}][quantity]`, String(item.quantity));
            params.set(`line_items[${index}][price_data][currency]`, `usd`);
            params.set(`line_items[${index}][price_data][unit_amount]`, String(item.price));
            params.set(`line_items[${index}][price_data][product_data][name]`, item.name);
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
            orderID: order.id,
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
