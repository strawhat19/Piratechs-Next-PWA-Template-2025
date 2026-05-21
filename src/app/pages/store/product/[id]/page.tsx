import { Metadata } from 'next';
import Store from '@/app/components/store/store';
import { constants } from '@/shared/scripts/constants';
import Container from '@/app/components/container/container';
import HorizontalScroller from '@/app/components/horizontal-scroller/horizontal-scroller';

export const metadata: Metadata = {
  title: `Product Details | ${constants.titles.default}`,
};

export default function StoreProductPage() {
    return (
        <Container
            className={`storePage`}
            topBarStyle={{ padding: 0 }}
            topBarComponent={<HorizontalScroller />}
        >
            <Store />
        </Container>
    )
}
