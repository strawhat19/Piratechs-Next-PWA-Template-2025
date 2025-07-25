import './footer.scss';

import Link from 'next/link';
import Logo from '../../logo/logo';
import { Copyright } from '@mui/icons-material';

export default function Footer({ full = false }: any) {
    return (
        <footer className={`container footerContainer ${full ? `fullFooter` : `clippedFooter`}`}>
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