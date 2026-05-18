'use client';

import { useEffect, useMemo, useState } from 'react';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LockIcon from '@mui/icons-material/Lock';
import { toast } from 'react-toastify';

type CheckoutStatus = `idle` | `loading` | `success` | `error`;

const testProduct = {
    name: `Piratechs Test Order`,
    amount: 999,
};

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export default function TestPayment() {
    const [quantity, setQuantity] = useState(1);
    const [status, setStatus] = useState<CheckoutStatus>(`idle`);
    const [message, setMessage] = useState(``);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const checkout = params.get(`checkout`);

        if (checkout == `success`) {
            toast.success(`Payment Completed Successfully`);
        } else if (checkout == `canceled`) {
            toast.error(`Payment checkout was canceled.`);
        }

        if (checkout) {
            params.delete(`checkout`);
            const query = params.toString();
            const cleanUrl = `${window.location.pathname}${query ? `?${query}` : ``}`;
            window.history.replaceState({}, ``, cleanUrl);
        }
    }, []);

    const total = useMemo(() => {
        return new Intl.NumberFormat(`en-US`, {
            style: `currency`,
            currency: `USD`,
        }).format((testProduct.amount * quantity) / 100);
    }, [quantity]);

    const startCheckout = async () => {
        setStatus(`loading`);
        setMessage(``);

        try {
            if (!stripePublishableKey) {
                throw new Error(`Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY. Add your Stripe test publishable key to continue.`);
            }

            const response = await fetch(`/api/store/stripe/checkout`, {
                method: `POST`,
                headers: { [`Content-Type`]: `application/json` },
                body: JSON.stringify({
                    quantity,
                    amount: testProduct.amount,
                    name: testProduct.name,
                }),
            });

            const checkout = await response.json();

            if (!response.ok || !checkout?.url) {
                throw new Error(checkout?.message || `Stripe checkout is unavailable.`);
            }

            setStatus(`success`);
            window.location.href = checkout.url;
        } catch (error) {
            setStatus(`error`);
            setMessage(error instanceof Error ? error.message : `Stripe checkout is unavailable.`);
        }
    };

    return (
        <section className={`testPaymentComponent`} aria-label={`Stripe test payment`}>
            <div className={`testPaymentSummary`}>
                <div className={`testPaymentIcon`}>
                    <CreditCardIcon fontSize={`small`} />
                </div>
                <div>
                    <h2>Test Payment</h2>
                    <p>Stripe Checkout test flow for a sample store order.</p>
                </div>
            </div>

            <div className={`testPaymentControls`}>
                <label className={`quantityField`}>
                    <span>Qty</span>
                    <input
                        min={1}
                        max={10}
                        type={`number`}
                        value={quantity}
                        onChange={(event) => setQuantity(Math.max(1, Math.min(10, Number(event.target.value) || 1)))}
                    />
                </label>

                <div className={`testPaymentTotal`}>
                    <span>Total</span>
                    <strong>{total}</strong>
                </div>

                <button
                    type={`button`}
                    className={`stripeCheckoutButton`}
                    onClick={startCheckout}
                    disabled={status == `loading`}
                >
                    <LockIcon fontSize={`small`} />
                    {status == `loading` ? `Starting...` : `Pay with Stripe`}
                </button>
            </div>

            {message ? <p className={`testPaymentMessage errorMessage`}>{message}</p> : null}
        </section>
    );
}
