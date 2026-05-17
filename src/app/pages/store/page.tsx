import { Metadata } from 'next';
import { constants } from '@/shared/scripts/constants';
import Container from '@/app/components/container/container';
import Styles from '@/app/components/sections/styles/styles';

export const metadata: Metadata = {
  title: `Store | ${constants.titles.default}`,
};

export default function StorePage() {
    return (
        <Container className={`storePage`}>
            <h1>Store Page</h1>
            <Styles showAuth={true} />
        </Container>
    )
}