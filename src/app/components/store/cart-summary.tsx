'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import InternalCheckout from './internal-checkout';
import type { CartItem } from './use-store-cart';
import { Add, DeleteSweep, Remove, ShoppingCartCheckout, Storefront } from '@mui/icons-material';
import { constants } from '@/shared/scripts/constants';

const getCartItemImageURL = (item: CartItem) => (
    item?.attachments?.[0]?.value
    || item?.imageURL
    || item?.imageURLs?.[0]
    || item?.images?.[0]?.src
    || item?.images?.[0]?.url
    || constants?.images?.icons?.logo
);

const CartItemImage = ({ item }: { item: CartItem }) => {
    const [hasError, setHasError] = useState(false);
    const imageURL = getCartItemImageURL(item);

    if (!imageURL || hasError) {
        return (
            <div className={`storeCartItemImage storeCartItemImageEmpty`} aria-hidden={`true`}>
                {item?.name?.[0] || `P`}
            </div>
        );
    }

    return (
        <Image
            unoptimized
            width={48}
            height={48}
            alt={item?.name || `Product`}
            src={imageURL}
            className={`storeCartItemImage`}
            onError={() => setHasError(true)}
        />
    );
};

type CartSummaryProps = {
    cart: CartItem[];
    total: string;
    showFullCartLink?: boolean;
    onClearCart: () => void;
    onPaymentSuccess: () => void;
    onIncreaseQuantity?: (item: CartItem) => void;
    onDecreaseQuantity?: (item: CartItem) => void;
};

export default function CartSummary({
    cart,
    total,
    showFullCartLink = false,
    onClearCart,
    onPaymentSuccess,
    onIncreaseQuantity = () => {},
    onDecreaseQuantity = () => {},
}: CartSummaryProps) {
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <section className={`storeCartComponent`} aria-label={`Shopping cart`}>
            <div className={`storeCartHeader`}>
                <div>
                    <h2>Cart</h2>
                    <p>{cartCount} item{cartCount == 1 ? `` : `s`} ready for checkout</p>
                </div>
                <strong>{total}</strong>
            </div>

            <div className={`storeCartItems`}>
                {cart.length > 0 ? cart.map((item) => (
                    <div className={`storeCartItem`} key={item.id}>
                        <div className={`storeCartItemMain`}>
                            <CartItemImage item={item} />
                            <div className={`storeCartItemInfo`}>
                                <strong>{item.name}</strong>
                                <span>{item.sku} - {item.category}</span>
                            </div>
                        </div>
                        <div className={`storeCartItemMeta`}>
                            <div className={`storeCartQuantityControls`}>
                                <button
                                    type={`button`}
                                    className={`storeCartQuantityButton storeCartQuantityButtonMinus`}
                                    onClick={() => onDecreaseQuantity(item)}
                                    aria-label={`Decrease ${item.name} quantity`}
                                    title={`Decrease quantity`}
                                >
                                    <Remove fontSize={`small`} />
                                </button>
                                <strong>{item.quantity}</strong>
                                <button
                                    type={`button`}
                                    className={`storeCartQuantityButton storeCartQuantityButtonPlus`}
                                    onClick={() => onIncreaseQuantity(item)}
                                    aria-label={`Increase ${item.name} quantity`}
                                    title={Number(item.stock || 0) > 0 && item.quantity < Number(item.stock || 0) ? `Increase quantity` : `Max stock reached`}
                                    disabled={Number(item.stock || 0) <= item.quantity}
                                >
                                    <Add fontSize={`small`} />
                                </button>
                            </div>
                            <span>Qty {item.quantity} / {Number(item.stock || 0)}</span>
                            <strong>{item.lineTotal}</strong>
                        </div>
                    </div>
                )) : (
                    <div className={`emptyCart`}>Add products from the table to build a checkout cart.</div>
                )}
            </div>

            <div className={`storeCartActions`}>
                {showFullCartLink ? (
                    <Link href={`/cart`} className={`cartLinkButton`}>
                        <Storefront fontSize={`small`} />
                        View Full Cart
                    </Link>
                ) : null}
                <button type={`button`} onClick={onClearCart} disabled={cart.length == 0}>
                    <DeleteSweep fontSize={`small`} />
                    Clear Cart
                </button>
                <button type={`button`} className={`checkoutCartButton`} onClick={() => setCheckoutOpen(!checkoutOpen)} disabled={cart.length == 0}>
                    <ShoppingCartCheckout fontSize={`small`} />
                    {checkoutOpen ? `Hide Checkout` : `Checkout`}
                </button>
            </div>

            {checkoutOpen ? (
                <InternalCheckout
                    cart={cart}
                    total={total}
                    onSuccess={() => {
                        setCheckoutOpen(false);
                        onPaymentSuccess();
                    }}
                />
            ) : null}
        </section>
    );
}
