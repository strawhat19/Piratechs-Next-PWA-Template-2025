import { Metadata } from 'next';
import { constants } from '@/shared/scripts/constants';
import Container from '@/app/components/container/container';
import Styles from '@/app/components/sections/styles/styles';

export const metadata: Metadata = {
  title: `Notifications | ${constants.titles.default}`,
};

export default function NotificationsPage() {
    return (
        <Container className={`notificationsPage`}>
            <h1>Notifications Page</h1>
            <Styles />
        </Container>
    )
}