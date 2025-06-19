'use client';

import Link from 'next/link';
import Nav from '../../nav/nav';
import Logo from '../../logo/logo';
import { useContext } from 'react';
import { State } from '../../container/container';

export default function Header() {
    let { menuExpanded } = useContext<any>(State);
    return (
        <header className={`containerX ${menuExpanded ? `menuExpanded` : `menuCollapsed`}`}>
            <div className={`headerInner gridContainer w95i`} style={{ gridTemplateColumns: `auto 1fr` }}>
                <div className={`headerStart`}>
                    <Link href={`/`} className={`largeFont colorwhite`}>
                        <Logo />
                    </Link>
                </div>
                <div className={`headerEnd justifyEnd`}>
                    <Nav />
                </div>
            </div>
            <div className={`mobileNavContainer showOnMobile`}>
                <Nav className={`mobileNav`} />
            </div>
        </header>
    )
}