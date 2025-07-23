import { Metadata } from 'next';
import { constants } from '@/shared/scripts/constants';
import Styles from '@/app/components/sections/styles/styles';
import Container from '@/app/components/container/container';
import AuthForm from './components/authentication/forms/auth-form/auth-form';
import ReactBeautifulDNDDemo from './components/drag-and-drop/react-beautiful-dnd/demo/react-beautiful-dnd-demo';

export const metadata: Metadata = {
  title: `${constants.titles.default} | Official`,
};

export default function HomePage() {
  return (
    <Container className={`homePage`}>
      {/* <SwapyDemo /> */}
      <ReactBeautifulDNDDemo />
      <AuthForm />
      <Styles />
    </Container>
  )
}