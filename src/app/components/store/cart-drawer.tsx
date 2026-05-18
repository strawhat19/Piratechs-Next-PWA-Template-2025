'use client';

import Drawer from '@mui/material/Drawer';
import CartSummary from './cart-summary';
import type { CartItem } from './use-store-cart';

type CartDrawerProps = {
    open: boolean;
    cart: CartItem[];
    total: string;
    onClose: () => void;
    onClearCart: () => void;
    onPaymentSuccess: () => void;
};

export default function CartDrawer({
    open,
    cart,
    total,
    onClose,
    onClearCart,
    onPaymentSuccess,
}: CartDrawerProps) {
    return (
        <Drawer
            anchor={`right`}
            open={open}
            onClose={onClose}
            className={`cartDrawerComponent`}
            slotProps={{ paper: { className: `cartDrawerPaper` } }}
        >
            <CartSummary
                cart={cart}
                total={total}
                showFullCartLink
                onClearCart={onClearCart}
                onPaymentSuccess={onPaymentSuccess}
            />
        </Drawer>
    );
}
