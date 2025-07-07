import { Metadata } from 'next';
import { constants } from '@/shared/scripts/constants';
import Container from '@/app/components/container/container';
import Styles from '@/app/components/sections/styles/styles';

export const metadata: Metadata = {
  title: `Sign In | ${constants.titles.default}`,
};

export default function SigninPage() {
    return (
        <Container className={`signinPage`}>
            <h1>Sign In Page</h1>
            <Styles />
        </Container>
    )
}