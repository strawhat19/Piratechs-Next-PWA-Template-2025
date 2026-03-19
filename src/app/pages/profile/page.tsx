import { Metadata } from 'next';
import { constants } from '@/shared/scripts/constants';
import Container from '@/app/components/container/container';
import Styles from '@/app/components/sections/styles/styles';
import ProfileForm from '@/app/components/authentication/forms/profile-form/profile-form';

export const metadata: Metadata = {
  title: `Profile | ${constants.titles.default}`,
};

export default function ProfilePage() {
    return (
        <Container className={`profilePage`}>
            <h1>Profile Page</h1>
            <ProfileForm />
            <Styles showAuth={true} />
        </Container>
    )
}