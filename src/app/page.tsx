import { Metadata } from 'next';
import { constants } from '@/shared/scripts/constants';
import Styles from '@/app/components/sections/styles/styles';
import Container from '@/app/components/container/container';
import AuthForm from './components/authentication/forms/auth-form/auth-form';

export const metadata: Metadata = {
  title: `${constants.titles.default} | Official`,
};

export default function HomePage() {
  return (
    <Container className={`homePage`}>
      <AuthForm />
      <Styles />
    </Container>
  )
}