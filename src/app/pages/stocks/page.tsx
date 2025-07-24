import { Metadata } from 'next';
import { constants } from '@/shared/scripts/constants';
import Container from '@/app/components/container/container';

export const metadata: Metadata = {
  title: `Stocks | ${constants.titles.default}`,
};

export default function StocksPage() {
    return (
        <Container className={`stocksPage`}>
            <h1>Stocks Page</h1>
        </Container>
    )
}