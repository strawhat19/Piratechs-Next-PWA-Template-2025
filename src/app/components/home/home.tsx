'use client';

import { useContext } from 'react';
import Styles from '../sections/styles/styles';
import { State } from '../container/container';
import AuthForm from '../authentication/forms/auth-form/auth-form';

export default function Home() {
    let { user } = useContext<any>(State);

    return <>
        {user != null ? <></> : <AuthForm />}
        <Styles />
    </>
}