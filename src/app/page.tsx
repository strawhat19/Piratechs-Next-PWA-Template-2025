import { Metadata } from 'next';
import Home from './components/home/home';
import { constants } from '@/shared/scripts/constants';
import Container from '@/app/components/container/container';

export const metadata: Metadata = {
  title: `${constants.titles.default} | Official`,
};

export default function HomePage() {
  return (
    <Container className={`homePage`}>
      <Home />
    </Container>
  )
}