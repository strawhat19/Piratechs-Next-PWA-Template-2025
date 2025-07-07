import { Metadata } from 'next';
import { constants } from '@/shared/scripts/constants';
import Container from '@/app/components/container/container';
import Styles from '@/app/components/sections/styles/styles';

export const metadata: Metadata = {
  title: `About | ${constants.titles.default}`,
};

export default function AboutPage() {
    return (
        <Container className={`aboutPage`}>
            <h1>About Page</h1>
            <Styles />
        </Container>
    )
}