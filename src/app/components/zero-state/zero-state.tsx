'use client'

import Logo from '../logo/logo';
import { useContext } from 'react';
import { Types } from '@/shared/types/types';
import Styles from '../sections/styles/styles';
import { StateGlobals } from '@/shared/global-context';

export default function ZeroState({
    children,
    type = Types.Board,
    childrenTop = false,
}: any) {
    let { user } = useContext<any>(StateGlobals);
    return (
        user == null ? <>
            <Logo label={`${type}s`} />
            <h1>{type}s Page</h1>
            {(children && childrenTop == true) ? children : <></>}
            <Styles showStyles={!children || !children?.length} showAuth={true} type={type} />
            {(children && childrenTop == false) ? children : <></>}
        </> : <></>
    )
}