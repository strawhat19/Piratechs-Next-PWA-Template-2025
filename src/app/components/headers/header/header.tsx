'use client';

import Link from 'next/link';
import Logo from '../../logo/logo';
import { useContext } from 'react';
import { Home } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Nav, { routes } from '../../nav/nav';
import { State } from '../../container/container';
import { IconButton, Tooltip } from '@mui/material';

export const defaultHeight = 60;

export default function Header() {
    const router = useRouter();
    let { menuExpanded } = useContext<any>(State);

    return (
        <header style={{ height: menuExpanded ? (defaultHeight + (Object.values(routes).length * 43)) : defaultHeight }} className={`containerX ${menuExpanded ? `menuExpanded` : `menuCollapsed`}`}>
            <div className={`headerInner gridContainer w95i`} style={{ gridTemplateColumns: `auto 1fr` }}>
                <div className={`headerStart flex alignCenter gap15`}>
                    <Tooltip title={`Home`} arrow>
                        <IconButton 
                            size={`small`} 
                            className={`iconButton p0`} 
                            onClick={() => router.push(`/`)}
                        >
                            <Home className={`homeIcon`} />
                        </IconButton>
                    </Tooltip>
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