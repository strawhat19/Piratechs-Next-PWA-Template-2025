'use client';

import { toast } from 'react-toastify';
import { StateGlobals } from '@/shared/global-context';
import type { Product } from '@/shared/types/models/Product';
import { useContext, useEffect, useMemo, useState } from 'react';
import { stripePaymentsDisabledMessage, stripePaymentsEnabled } from '@/shared/scripts/payments';

export type CartItem = Product & {
    quantity: number;
    lineTotal: string;
};

export const cartStorageKey = `store-cart`;
export const cartUpdatedEvent = `store-cart-updated`;

export const formatStorePrice = (price: number) => {
    return new Intl.NumberFormat(`en-US`, {
        style: `currency`,
        currency: `USD`,
    }).format(price / 100);
};

export const prepareCart = (items: Array<Product & { quantity?: number }>): CartItem[] => {
    return items.map((item) => {
        const quantity = Math.max(1, Number(item.quantity || 1));
        return {
            ...item,
            quantity,
            lineTotal: formatStorePrice(item.price * quantity),
        };
    });
};

export const readStoreCart = (): CartItem[] => {
    if (typeof window == `undefined`) return [];

    try {
        return prepareCart(JSON.parse(localStorage.getItem(cartStorageKey) || `[]`));
    } catch {
        return [];
    }
};

export const writeStoreCart = (items: CartItem[]) => {
    localStorage.setItem(cartStorageKey, JSON.stringify(items));
    window.dispatchEvent(new Event(cartUpdatedEvent));
};

export const useStoreCart = () => {
    const { user } = useContext<any>(StateGlobals);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [checkingOut, setCheckingOut] = useState(false);

    const cartCount = useMemo(() => cart.reduce((count, item) => count + item.quantity, 0), [cart]);
    const cartTotal = useMemo(() => {
        return formatStorePrice(cart.reduce((total, item) => total + (item.price * item.quantity), 0));
    }, [cart]);

    const saveCart = (items: CartItem[]) => {
        setCart(items);
        writeStoreCart(items);
    };

    const addToCart = (product: Product) => {
        const itemIndex = cart.findIndex((item) => item.id == product.id);
        const nextCart = [...cart];

        if (itemIndex >= 0) {
            const quantity = nextCart[itemIndex].quantity + 1;
            nextCart[itemIndex] = {
                ...nextCart[itemIndex],
                quantity,
                lineTotal: formatStorePrice(product.price * quantity),
            };
        } else {
            nextCart.push(...prepareCart([{ ...product, quantity: 1 }]));
        }

        saveCart(nextCart);
    };

    const clearCart = () => {
        saveCart([]);
        toast.info(`Cart Cleared`);
    };

    const checkoutCart = async () => {
        if (!stripePaymentsEnabled) {
            toast.info(stripePaymentsDisabledMessage);
            return;
        }

        if (cart.length == 0) {
            toast.error(`Add Product(s) Before Checkout`);
            return;
        }

        setCheckingOut(true);

        try {
            const response = await fetch(`/api/store/stripe/checkout`, {
                method: `POST`,
                headers: { [`Content-Type`]: `application/json` },
                body: JSON.stringify({
                    returnPath: window.location.pathname,
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

            const checkout = await response.json();

            if (!response.ok || !checkout?.url) {
                throw new Error(checkout?.message || `Stripe Checkout Unavailable`);
            }

            window.location.href = checkout.url;
        } catch (error) {
            toast.error(error instanceof Error ? error.message : `Stripe Checkout Unavailable`);
            setCheckingOut(false);
        }
    };

    useEffect(() => {
        const syncCart = () => setCart(readStoreCart());

        syncCart();
        window.addEventListener(`storage`, syncCart);
        window.addEventListener(cartUpdatedEvent, syncCart);

        return () => {
            window.removeEventListener(`storage`, syncCart);
            window.removeEventListener(cartUpdatedEvent, syncCart);
        };
    }, []);

    return {
        cart,
        cartCount,
        cartTotal,
        checkingOut,
        addToCart,
        clearCart,
        checkoutCart,
        saveCart,
    };
};

export const useCheckoutReturnToast = (saveCart: (items: CartItem[]) => void) => {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const checkout = params.get(`checkout`);
        const sessionID = params.get(`session_id`);

        const completeCheckout = async () => {
            if (checkout == `success`) {
                if (sessionID) {
                    const response = await fetch(`/api/store/stripe/order/complete`, {
                        method: `POST`,
                        headers: { [`Content-Type`]: `application/json` },
                        body: JSON.stringify({ checkoutSessionID: sessionID }),
                    });
                    const result = await response.json();
                    if (!response.ok || !result?.ok) throw new Error(result?.message || `Payment completed, but order sync failed.`);
                }
                saveCart([]);
                toast.success(`Payment Completed Successfully`);
            } else if (checkout == `canceled`) {
                toast.error(`Payment Checkout Canceled`);
            }
        }

        completeCheckout().catch(error => toast.error(error instanceof Error ? error.message : `Payment Completed, Order Sync Failed`));

        if (checkout) {
            params.delete(`checkout`);
            params.delete(`session_id`);
            const query = params.toString();
            const cleanUrl = `${window.location.pathname}${query ? `?${query}` : ``}`;
            window.history.replaceState({}, ``, cleanUrl);
        }
    }, []);
};
