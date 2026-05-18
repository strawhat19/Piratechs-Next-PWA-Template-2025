'use client';

import Drawer from '@mui/material/Drawer';
import CartSummary from './cart-summary';
import type { CartItem } from './use-store-cart';

type CartDrawerProps = {
    open: boolean;
    cart: CartItem[];
    total: string;
    checkingOut: boolean;
    onClose: () => void;
    onCheckout: () => void;
    onClearCart: () => void;
};

export default function CartDrawer({
    open,
    cart,
    total,
    checkingOut,
    onClose,
    onCheckout,
    onClearCart,
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
                checkingOut={checkingOut}
                showFullCartLink
                onCheckout={onCheckout}
                onClearCart={onClearCart}
            />
        </Drawer>
    );
}
