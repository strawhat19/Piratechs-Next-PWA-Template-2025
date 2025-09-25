import './footer.scss';

import Link from 'next/link';
import Logo from '../../logo/logo';
import { useContext } from 'react';
import { Copyright } from '@mui/icons-material';
import { State } from '../../container/container';

export default function Footer({ full = false }: any) {
    let { isPWA } = useContext<any>(State);
    return (
        <footer className={`container footerContainer ${full ? `fullFooter` : `clippedFooter`} ${isPWA ? `isPWAFooter` : `standardWFooter`}`}>
            <div className={`footerInner`}>
                {/* <h1>Footer</h1> */}
                <Link href={`/`} className={`logoLink largeFont colorwhite`}>
                    <Logo size={30} />
                </Link>
                <span className={`copyright flex alignCenter gap5`}>
                    Copyright <Copyright style={{ color: `var(--links)` }} /> {new Date()?.getFullYear()}
                </span>
            </div>
        </footer>
    )
}