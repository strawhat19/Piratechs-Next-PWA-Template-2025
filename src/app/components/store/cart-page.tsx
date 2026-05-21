'use client';

import CartSummary from './cart-summary';
import { useCheckoutReturnToast, useStoreCart } from './use-store-cart';

export default function CartPageComponent() {
    const { cart, cartTotal, clearCart, saveCart, increaseCartItemQuantity, decreaseCartItemQuantity } = useStoreCart();
    useCheckoutReturnToast(saveCart);

    return (
        <div className={`cartPageComponent w95`}>
            <CartSummary
                cart={cart}
                total={cartTotal}
                onClearCart={clearCart}
                onPaymentSuccess={() => saveCart([])}
                onIncreaseQuantity={increaseCartItemQuantity}
                onDecreaseQuantity={decreaseCartItemQuantity}
            />
        </div>
    );
}
