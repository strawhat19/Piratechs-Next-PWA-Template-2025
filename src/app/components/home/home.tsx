// 'use client';

// import { useContext } from 'react';
import Styles from '../sections/styles/styles';
// import { StateGlobals } from '@/shared/global-context';
// import AuthForm from '../authentication/forms/auth-form/auth-form';

export default function Home() {
    // let { user } = useContext<any>(StateGlobals);

    return <>
        {/* {user != null ? <></> : <AuthForm />} */}
        <Styles showAuth={true} />
    </>
}