import { Metadata } from 'next';
import { constants } from '@/shared/scripts/constants';
import Container from '@/app/components/container/container';
import Styles from '@/app/components/sections/styles/styles';

export const metadata: Metadata = {
  title: `Settings | ${constants.titles.default}`,
};

export default function SettingsPage() {
    return (
        <Container className={`settingsPage`}>
            <h1>Settings Page</h1>
            <Styles />
        </Container>
    )
}