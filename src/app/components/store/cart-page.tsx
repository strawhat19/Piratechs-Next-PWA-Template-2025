'use client';

import CartSummary from './cart-summary';
import { useCheckoutReturnToast, useStoreCart } from './use-store-cart';

export default function CartPageComponent() {
    const { cart, cartTotal, checkingOut, checkoutCart, clearCart, saveCart } = useStoreCart();
    useCheckoutReturnToast(saveCart);

    return (
        <div className={`cartPageComponent w95`}>
            <CartSummary
                cart={cart}
                total={cartTotal}
                checkingOut={checkingOut}
                onCheckout={checkoutCart}
                onClearCart={clearCart}
            />
        </div>
    );
}
