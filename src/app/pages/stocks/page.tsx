import { Metadata } from 'next';
import Stocks from '@/app/components/stocks/stocks';
import { constants } from '@/shared/scripts/constants';
import Container from '@/app/components/container/container';

export const metadata: Metadata = {
  title: `Stocks | ${constants.titles.default}`,
};

export default function StocksPage() {
    return (
        <Container className={`stocksPage`}>
            <Stocks />
        </Container>
    )
}