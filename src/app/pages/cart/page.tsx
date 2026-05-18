import { Metadata } from 'next';
import CartPageComponent from '@/app/components/store/cart-page';
import { constants } from '@/shared/scripts/constants';
import Container from '@/app/components/container/container';

export const metadata: Metadata = {
  title: `Cart | ${constants.titles.default}`,
};

export default function CartPage() {
    return (
        <Container className={`cartPage`}>
            <CartPageComponent />
        </Container>
    );
}
