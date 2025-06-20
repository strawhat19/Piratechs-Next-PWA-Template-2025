'use client';

import Link from 'next/link';
import Logo from '../../logo/logo';
import { useContext } from 'react';
import Nav, { routes } from '../../nav/nav';
import { State } from '../../container/container';

export const defaultHeight = 60;

export default function Header() {
    let { menuExpanded } = useContext<any>(State);
    return (
        <header style={{ height: menuExpanded ? (defaultHeight + (Object.values(routes).length * 43)) : defaultHeight }} className={`containerX ${menuExpanded ? `menuExpanded` : `menuCollapsed`}`}>
            <div className={`headerInner gridContainer w95i`} style={{ gridTemplateColumns: `auto 1fr` }}>
                <div className={`headerStart`}>
                    <Link href={`/`} className={`logoLink largeFont colorwhite`}>
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