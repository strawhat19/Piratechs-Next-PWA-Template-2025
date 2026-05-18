'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Lock } from '@mui/icons-material';
import type { CartItem } from './use-store-cart';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    : null;

type InternalCheckoutProps = {
    cart: CartItem[];
    total: string;
    onSuccess: () => void;
};

type PaymentFormProps = InternalCheckoutProps & {
    clientSecret: string;
};

const PaymentForm = ({ cart, total, onSuccess }: PaymentFormProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(``);

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
            const errorMessage = result.error.message || `Payment could not be completed.`;
            setMessage(errorMessage);
            toast.error(errorMessage);
            setSubmitting(false);
            return;
        }

        if (result.paymentIntent?.status == `succeeded`) {
            toast.success(`Payment Completed Successfully`);
            onSuccess();
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
    const [clientSecret, setClientSecret] = useState(``);
    const [message, setMessage] = useState(``);
    const [loading, setLoading] = useState(false);

    const cartSignature = useMemo(() => {
        return cart.map((item) => `${item.id}:${item.quantity}:${item.price}`).join(`|`);
    }, [cart]);

    useEffect(() => {
        const createPaymentIntent = async () => {
            if (cart.length == 0) {
                setClientSecret(``);
                return;
            }

            if (!stripePromise) {
                setMessage(`Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY. Add your Stripe publishable key to use internal checkout.`);
                return;
            }

            setLoading(true);
            setMessage(``);

            try {
                const response = await fetch(`/api/store/stripe/payment-intent`, {
                    method: `POST`,
                    headers: { [`Content-Type`]: `application/json` },
                    body: JSON.stringify({
                        items: cart.map((item) => ({
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity,
                        })),
                    }),
                });

                const paymentIntent = await response.json();

                if (!response.ok || !paymentIntent?.clientSecret) {
                    throw new Error(paymentIntent?.message || `Unable to start internal checkout.`);
                }

                setClientSecret(paymentIntent.clientSecret);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : `Unable to start internal checkout.`;
                setMessage(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        createPaymentIntent();
    }, [cartSignature]);

    if (cart.length == 0) return null;

    if (message) return <p className={`internalCheckoutMessage`}>{message}</p>;

    if (loading || !clientSecret || !stripePromise) {
        return <p className={`internalCheckoutMessage`}>Preparing secure checkout...</p>;
    }

    return (
        <Elements
            stripe={stripePromise}
            options={{
                clientSecret,
                appearance: {
                    theme: `night`,
                    variables: {
                        colorPrimary: `#13deb9`,
                        colorBackground: `#041b44`,
                        colorText: `#ffffff`,
                        borderRadius: `5px`,
                    },
                },
            }}
        >
            <PaymentForm cart={cart} total={total} clientSecret={clientSecret} onSuccess={onSuccess} />
        </Elements>
    );
}
