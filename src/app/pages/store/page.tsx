import { Metadata } from 'next';
import Store from '@/app/components/store/store';
import { constants } from '@/shared/scripts/constants';
import Container from '@/app/components/container/container';

export const metadata: Metadata = {
  title: `Store | ${constants.titles.default}`,
};

export default function StorePage() {
    return (
        <Container
            showPageLogo={false}
            oveflowHidden={false}
            className={`storePage`}
            topBarStyle={{ padding: 0 }}
        >
            <Store />
        </Container>
    )
}
