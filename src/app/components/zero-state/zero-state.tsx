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
    showPageTitle = true,
    pageTitle = `${type}s Page`,
}: any) {
    let { user } = useContext<any>(StateGlobals);
    return (
        user == null ? <>
            <div className={`pageTitleLogo`}>
                <Logo label={`${type}s`} />
                {showPageTitle ? <h1>{pageTitle}</h1> : ``}
            </div>
            {(children && childrenTop == true) ? children : <></>}
            <Styles showStyles={!children || !children?.length} showAuth={true} type={type} />
            {(children && childrenTop == false) ? children : <></>}
        </> : <></>
    )
}