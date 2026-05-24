'use client';

import { toast } from 'react-toastify';
import { StateGlobals } from '@/shared/global-context';
import type { Product } from '@/shared/types/models/Product';
import { ProductStatus } from '@/shared/types/models/Product';
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

const normalizeCartQuantity = (quantity?: number | string | null) => {
    return Math.max(1, Math.floor(Number(quantity || 1)));
};

const getCartStockLimit = (product?: Partial<Product> | null) => {
    if (!product?.id) return 0;
    const status = String(product?.status || ``).toLowerCase();
    const activeStatus = ProductStatus.Active.toLowerCase();
    if (status != activeStatus) return 0;
    return Math.max(0, Math.floor(Number(product?.stock ?? product?.inventoryQuantity ?? product?.totalInventory ?? 0)));
};

const cartItemSignature = (item?: Partial<CartItem> | null) => [
    String(item?.id || ``),
    String(item?.name || ``),
    String(item?.sku || ``),
    String(item?.status || ``),
    String(Number(item?.stock ?? 0)),
    String(Number(item?.price ?? 0)),
    String(normalizeCartQuantity(item?.quantity)),
].join(`|`);

const mergeCartItem = (item: Partial<Product> & { quantity?: number }, liveProduct?: Partial<Product> | null): CartItem | null => {
    const source = liveProduct ? { ...item, ...liveProduct } : { ...item };
    const quantity = normalizeCartQuantity(source?.quantity);
    const quantityLimit = getCartStockLimit(source);
    if (quantityLimit <= 0) return null;
    const safeQuantity = Math.min(quantity, quantityLimit);
    if (safeQuantity <= 0) return null;
    return {
        ...source,
        quantity: safeQuantity,
        lineTotal: formatStorePrice(Number(source.price || 0) * safeQuantity),
    } as CartItem;
};

export const prepareCart = (items: Array<Partial<Product> & { quantity?: number }>): CartItem[] => {
    return items.map((item) => {
        const quantity = normalizeCartQuantity(item.quantity);
        return {
            ...item,
            quantity,
            lineTotal: formatStorePrice(Number(item.price || 0) * quantity),
        } as CartItem;
    });
};

export const sanitizeCartItems = (
    items: Array<Partial<Product> & { quantity?: number }>,
    catalog: Product[] = [],
    catalogReady = true,
) => {
    if (!catalogReady) {
        return { cart: prepareCart(items), changed: false };
    }

    const catalogByID = new Map(catalog.map((product) => [String(product?.id || ``), product]));
    const nextCart: CartItem[] = [];
    let changed = false;

    for (const item of items) {
        const liveProduct = catalogByID.get(String(item?.id || ``)) || null;
        const mergedItem = mergeCartItem(item, liveProduct);
        if (!mergedItem) {
            changed = true;
            continue;
        }

        if (cartItemSignature(item) != cartItemSignature(mergedItem)) changed = true;
        nextCart.push(mergedItem);
    }

    return { cart: nextCart, changed };
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
    const { user, products = [], productsLoading = false } = useContext<any>(StateGlobals);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [checkingOut, setCheckingOut] = useState(false);
    const catalogByID = useMemo(() => new Map((Array.isArray(products) ? products : []).map((product: Product) => [String(product?.id || ``), product])), [products]);

    const cartCount = useMemo(() => cart.reduce((count, item) => count + item.quantity, 0), [cart]);
    const cartTotal = useMemo(() => {
        return formatStorePrice(cart.reduce((total, item) => total + (item.price * item.quantity), 0));
    }, [cart]);

    const saveCart = (items: CartItem[]) => {
        setCart(items);
        writeStoreCart(items);
    };

    const removeFromCart = (itemOrID: Product | CartItem | string) => {
        const itemID = String(typeof itemOrID == `string` ? itemOrID : itemOrID?.id || ``);
        if (!itemID) return false;
        const nextCart = cart.filter((item) => String(item?.id) != itemID);
        if (nextCart.length == cart.length) return false;
        saveCart(nextCart);
        return true;
    };

    const upsertCartItemQuantity = (item: Partial<Product> & { quantity?: number }, quantity: number) => {
        const itemID = String(item?.id || ``);
        if (!itemID) return false;

        const currentItemIndex = cart.findIndex((cartItem) => String(cartItem?.id) == itemID);
        const currentItem = currentItemIndex >= 0 ? cart[currentItemIndex] : null;
        const liveProduct = catalogByID.get(itemID) || null;
        const source = liveProduct ? { ...currentItem, ...item, ...liveProduct } : { ...currentItem, ...item };
        const stockLimit = getCartStockLimit(source);

        if (stockLimit <= 0) {
            return removeFromCart(itemID);
        }

        const safeQuantity = Math.max(0, Math.floor(Number(quantity || 0)));
        if (safeQuantity <= 0) {
            return removeFromCart(itemID);
        }

        const nextQuantity = Math.min(safeQuantity, stockLimit);
        const nextItem = mergeCartItem({ ...source, quantity: nextQuantity }, liveProduct || source);
        if (!nextItem) {
            return removeFromCart(itemID);
        }

        const currentSignature = currentItem ? cartItemSignature(currentItem) : ``;
        const nextSignature = cartItemSignature(nextItem);
        if (currentSignature == nextSignature) return false;

        const nextCart = currentItemIndex >= 0
            ? cart.map((cartItem, index) => index == currentItemIndex ? nextItem : cartItem)
            : [...cart, nextItem];

        saveCart(nextCart);
        return true;
    };

    const addToCart = (product: Product) => {
        const itemID = String(product?.id || ``);
        if (!itemID) return false;

        const currentItem = cart.find((item) => String(item?.id) == itemID) || null;
        const liveProduct = catalogByID.get(itemID) || null;
        const source = liveProduct ? { ...product, ...liveProduct } : { ...product };
        const stockLimit = getCartStockLimit(source);

        if (stockLimit <= 0) {
            toast.info(`${source?.name || `Product`} is unavailable`);
            return false;
        }

        const currentQuantity = currentItem ? normalizeCartQuantity(currentItem?.quantity) : 0;
        if (currentQuantity >= stockLimit) {
            toast.info(`${source?.name || `Product`} is limited to ${stockLimit} in cart`);
            return false;
        }

        return upsertCartItemQuantity(source as Product, currentQuantity + 1);
    };

    const increaseCartItemQuantity = (item: CartItem) => {
        const itemID = String(item?.id || ``);
        if (!itemID) return false;
        const currentItem = cart.find((cartItem) => String(cartItem?.id) == itemID) || item;
        const liveProduct = catalogByID.get(itemID) || null;
        const source = liveProduct ? { ...currentItem, ...liveProduct } : currentItem;
        const stockLimit = getCartStockLimit(source);
        const currentQuantity = normalizeCartQuantity(currentItem?.quantity || item?.quantity || 1);
        if (stockLimit <= 0) return removeFromCart(itemID);
        if (currentQuantity >= stockLimit) {
            toast.info(`${source?.name || `Product`} is limited to ${stockLimit} in cart`);
            return false;
        }
        return upsertCartItemQuantity(source as Product, currentQuantity + 1);
    };

    const decreaseCartItemQuantity = (item: CartItem) => {
        const itemID = String(item?.id || ``);
        if (!itemID) return false;
        const currentItem = cart.find((cartItem) => String(cartItem?.id) == itemID) || item;
        const currentQuantity = normalizeCartQuantity(currentItem?.quantity || item?.quantity || 1);
        if (currentQuantity <= 1) return removeFromCart(itemID);
        return upsertCartItemQuantity(currentItem as Product, currentQuantity - 1);
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

        const { cart: validatedCart, changed } = sanitizeCartItems(cart, products, !productsLoading);
        if (changed) saveCart(validatedCart);
        if (validatedCart.length == 0) {
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
                    items: validatedCart.map((item) => ({
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

    useEffect(() => {
        if (productsLoading) return;
        const { cart: nextCart, changed } = sanitizeCartItems(cart, products, true);
        if (changed) saveCart(nextCart);
    }, [cart, products, productsLoading]);

    return {
        cart,
        cartCount,
        cartTotal,
        checkingOut,
        addToCart,
        decreaseCartItemQuantity,
        clearCart,
        checkoutCart,
        increaseCartItemQuantity,
        upsertCartItemQuantity,
        removeFromCart,
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
