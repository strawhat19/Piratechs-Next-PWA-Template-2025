import Link from 'next/link';
import Nav from '../../nav/nav';
import Logo from '../../logo/logo';

export default function Header() {
    return (
        <header className={`container`}>
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
        </header>
    )
}