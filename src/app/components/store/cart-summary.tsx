'use client';

import Link from 'next/link';
import { useState } from 'react';
import InternalCheckout from './internal-checkout';
import type { CartItem } from './use-store-cart';
import { DeleteSweep, ShoppingCartCheckout, Storefront } from '@mui/icons-material';

type CartSummaryProps = {
    cart: CartItem[];
    total: string;
    showFullCartLink?: boolean;
    onClearCart: () => void;
    onPaymentSuccess: () => void;
};

export default function CartSummary({
    cart,
    total,
    showFullCartLink = false,
    onClearCart,
    onPaymentSuccess,
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
                        <div>
                            <strong>{item.name}</strong>
                            <span>{item.sku} - {item.category}</span>
                        </div>
                        <div className={`storeCartItemMeta`}>
                            <span>Qty {item.quantity}</span>
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
