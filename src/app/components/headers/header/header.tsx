'use client';

import Link from 'next/link';
import { useContext } from 'react';
import Logo from '../../logo/logo';
import { Home } from '@mui/icons-material';
import Nav, { routes } from '../../nav/nav';
import { StateGlobals } from '@/shared/global-context';
import { constants } from '@/shared/scripts/constants';
import Icon_Button from '../../buttons/icon-button/icon-button';

export const defaultHeight = 60;

export default function Header() {
    let { width, loaded, menuExpanded } = useContext<any>(StateGlobals);

    return (
        <header 
            className={`containerX ${(menuExpanded && (width <= constants?.breakpoints?.mobile)) ? `menuExpanded` : `menuCollapsed`}`}
            style={{ 
                paddingBottom: menuExpanded ? 0 : undefined, 
                height: menuExpanded ? defaultHeight + (
                    Object.values(routes).length * (38 + (Object.values(routes)?.length >= 3 
                    ? (0.44 * Object.values(routes)?.length) 
                    : 0))
                ) : defaultHeight, 
            }} 
        >
            <div className={`headerInner gridContainer w95i`} style={{ gridTemplateColumns: `auto 1fr` }}>
                <div className={`headerStart flex alignCenter gap15`}>
                    <Icon_Button disabled={!loaded} title={`Home`} url={`/`}>
                        <Home className={`homeIcon`} style={{ fontSize: 20 }} />
                    </Icon_Button>
                    <Link href={`/`} aria-disabled={!loaded} className={`logoLink largeFont colorwhite`}>
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