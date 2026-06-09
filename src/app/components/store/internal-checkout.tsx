'use client';

import { toast } from 'react-toastify';
import { Lock } from '@mui/icons-material';
import type { Stripe } from '@stripe/stripe-js';
import type { CartItem } from './use-store-cart';
import { StateGlobals } from '@/shared/global-context';
import { FormEvent, useContext, useEffect, useMemo, useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { stripeAdvancedFraudSignalsEnabled, stripePaymentsDisabledMessage, stripePaymentsEnabled, stripePublishableKey, stripePublishableKeyMissingMessage } from '@/shared/scripts/payments';

let stripePromise: Promise<Stripe | null> | null = null;
let stripeLoadParametersSet = false;

const getStripePromise = async () => {
    if (stripePromise) return stripePromise;
    const { loadStripe } = await import('@stripe/stripe-js/pure');
    if (!stripeAdvancedFraudSignalsEnabled && !stripeLoadParametersSet) {
        loadStripe.setLoadParameters({ advancedFraudSignals: false });
        stripeLoadParametersSet = true;
    }
    stripePromise = loadStripe(stripePublishableKey);
    return stripePromise;
}

type InternalCheckoutProps = {
    cart: CartItem[];
    total: string;
    onSuccess: () => void;
};

type PaymentFormProps = InternalCheckoutProps & {
    clientSecret: string;
    onPaymentConfirmed: (paymentIntentID: string) => Promise<void>;
};

const PaymentForm = ({ cart, total, onSuccess, onPaymentConfirmed }: PaymentFormProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(``);
    const [submitting, setSubmitting] = useState(false);

    const submitPayment = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        setSubmitting(true);
        setMessage(``);

        const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}${window.location.pathname}?checkout=success`,
            },
            redirect: `if_required`,
        });

        if (result.error) {
            const errorMessage = result.error.message || `Payment Could Not Be Completed`;
            setMessage(errorMessage);
            toast.error(errorMessage);
            setSubmitting(false);
            return;
        }

        if (result.paymentIntent?.status == `succeeded`) {
            try {
                await onPaymentConfirmed(result.paymentIntent.id);
                toast.success(`Payment Completed Successfully`);
                onSuccess();
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : `Payment Completed, Order Sync Failed`;
                setMessage(errorMessage);
                toast.error(errorMessage);
            }
            setSubmitting(false);
            return;
        }

        setMessage(`Payment status: ${result.paymentIntent?.status || `processing`}.`);
        setSubmitting(false);
    };

    return (
        <form className={`internalCheckoutForm`} onSubmit={submitPayment}>
            <div className={`internalCheckoutHeader`}>
                <div>
                    <h3>Secure Checkout</h3>
                    <p>{cart.length} line item{cart.length == 1 ? `` : `s`} - {total}</p>
                </div>
                <Lock fontSize={`small`} />
            </div>
            <PaymentElement />
            {message ? <p className={`internalCheckoutMessage`}>{message}</p> : null}
            <button type={`submit`} className={`checkoutCartButton`} disabled={!stripe || !elements || submitting}>
                {submitting ? `Processing...` : `Pay ${total}`}
            </button>
        </form>
    );
};

export default function InternalCheckout({ cart, total, onSuccess }: InternalCheckoutProps) {
    const { user } = useContext<any>(StateGlobals);
    const [clientSecret, setClientSecret] = useState(``);
    const [message, setMessage] = useState(``);
    const [loading, setLoading] = useState(false);
    const [checkoutStripe, setCheckoutStripe] = useState<Stripe | null>(null);

    const cartSignature = useMemo(() => {
        return cart.map((item) => `${item.id}:${item.quantity}:${item.price}`).join(`|`);
    }, [cart]);

    useEffect(() => {
        let active = true;

        const createPaymentIntent = async () => {
            if (cart.length == 0) {
                setClientSecret(``);
                return;
            }

            if (!stripePaymentsEnabled) {
                setMessage(stripePaymentsDisabledMessage);
                return;
            }

            if (!stripePublishableKey) {
                setMessage(stripePublishableKeyMissingMessage);
                return;
            }

            setLoading(true);
            setMessage(``);

            try {
                const nextStripe = await getStripePromise();
                if (!active) return;
                setCheckoutStripe(nextStripe);

                const response = await fetch(`/api/store/stripe/payment-intent`, {
                    method: `POST`,
                    headers: { [`Content-Type`]: `application/json` },
                    body: JSON.stringify({
                        userID: user?.id,
                        userEmail: user?.email,
                        userName: user?.name,
                        items: cart.map((item) => ({
                            id: item.id,
                            sku: item.sku,
                            name: item.name,
                            price: item.price,
                            category: item.category,
                            quantity: item.quantity,
                        })),
                    }),
                });

                const paymentIntent = await response.json();

                if (!response.ok || !paymentIntent?.clientSecret) {
                    throw new Error(paymentIntent?.message || `Unable To Start Internal Checkout`);
                }

                setClientSecret(paymentIntent.clientSecret);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : `Unable To Start Internal Checkout`;
                setMessage(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        createPaymentIntent();
        return () => {
            active = false;
        };
    }, [cartSignature, user?.id]);

    const onPaymentConfirmed = async (paymentIntentID: string) => {
        const response = await fetch(`/api/store/stripe/order/complete`, {
            method: `POST`,
            headers: { [`Content-Type`]: `application/json` },
            body: JSON.stringify({ paymentIntentID }),
        });
        const result = await response.json();
        if (!response.ok || !result?.ok) throw new Error(result?.message || `Payment Completed, Order Sync Failed`);
    }

    if (cart.length == 0) return null;

    if (message) return <p className={`internalCheckoutMessage`}>{message}</p>;

    if (loading || !clientSecret || !checkoutStripe) {
        return (
            <p className={`internalCheckoutMessage`}>
                Preparing secure checkout...
            </p>
        );
    }

    return (
        <Elements
            stripe={checkoutStripe}
            options={{
                clientSecret,
                appearance: {
                    theme: `night`,
                    variables: {
                        borderRadius: `5px`,
                        colorText: `#ffffff`,
                        colorPrimary: `#13deb9`,
                        colorBackground: `#041b44`,
                    },
                },
            }}
        >
            <PaymentForm cart={cart} total={total} clientSecret={clientSecret} onSuccess={onSuccess} onPaymentConfirmed={onPaymentConfirmed} />
        </Elements>
    );
}
