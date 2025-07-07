import { Metadata } from 'next';
import { constants } from '@/shared/scripts/constants';
import Container from '@/app/components/container/container';
import Styles from '@/app/components/sections/styles/styles';

export const metadata: Metadata = {
  title: `Contact | ${constants.titles.default}`,
};

export default function ContactPage() {
    return (
        <Container className={`contactPage`}>
            <h1>Contact Page</h1>
            <Styles />
        </Container>
    )
}