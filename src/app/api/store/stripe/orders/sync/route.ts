import { NextResponse } from 'next/server';
import { tokenRequired } from '@/shared/scripts/constants';
import { stripePaymentsDisabledMessage, stripePaymentsEnabled } from '@/shared/scripts/payments';
import { getStripeServerKey, syncRecentStripeOrders } from '@/shared/server/stripe-orders';

type SyncOrdersRequest = {
    limit?: number;
};

export const POST = async (request: Request) => {
    try {
        const authCheck = tokenRequired(request, false);
        if (!authCheck) return NextResponse.json({ ok: false, message: `Missing Bearer Token` }, { status: 401 });
        if (!stripePaymentsEnabled) return NextResponse.json({ ok: false, message: stripePaymentsDisabledMessage }, { status: 503 });

        const stripeServerKey = getStripeServerKey();
        if (!stripeServerKey) return NextResponse.json({ ok: false, message: `Missing STRIPE_SECRET_KEY or STRIPE_RESTRICTED_KEY.` }, { status: 500 });

        const body = await request.json().catch(() => ({})) as SyncOrdersRequest;
        const orders = await syncRecentStripeOrders(stripeServerKey, body?.limit || 25);
        return NextResponse.json({ ok: true, count: orders.length, orders });
    } catch (error) {
        return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : `Unable to sync Stripe orders.` }, { status: 500 });
    }
}
