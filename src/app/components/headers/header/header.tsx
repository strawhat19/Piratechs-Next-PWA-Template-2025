'use client';

import Link from 'next/link';
import Logo from '../../logo/logo';
import { Home } from '@mui/icons-material';
import Nav, { routes } from '../../nav/nav';
import { useContext, useState } from 'react';
import { State } from '../../container/container';
import Icon_Button from '../../buttons/icon-button/icon-button';

export const defaultHeight = 60;

export default function Header() {
    let { menuExpanded } = useContext<any>(State);

    let [useMenuExpand, ] = useState(true);

    return (
        <header 
            className={`containerX ${menuExpanded ? `menuExpanded` : `menuCollapsed`}`}
            style={{ 
                paddingBottom: menuExpanded ? 0 : undefined, 
                height: menuExpanded ? (useMenuExpand ? (defaultHeight + (Object.values(routes).length * 38)) : `calc(100%)`) : defaultHeight 
            }} 
        >
            <div className={`headerInner gridContainer w95i`} style={{ gridTemplateColumns: `auto 1fr` }}>
                <div className={`headerStart flex alignCenter gap15`}>
                    <Icon_Button title={`Home`} url={`/`}>
                        <Home className={`homeIcon`} style={{ fontSize: 20 }} />
                    </Icon_Button>
                    <Link href={`/`} className={`logoLink largeFont colorwhite`}>
                        <Logo size={30} />
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