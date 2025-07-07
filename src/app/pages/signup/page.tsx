import { Metadata } from 'next';
import { constants } from '@/shared/scripts/constants';
import Container from '@/app/components/container/container';
import Styles from '@/app/components/sections/styles/styles';

export const metadata: Metadata = {
  title: `Sign Up | ${constants.titles.default}`,
};

export default function SignupPage() {
    return (
        <Container className={`signupPage`}>
            <h1>Sign Up Page</h1>
            <Styles />
        </Container>
    )
}