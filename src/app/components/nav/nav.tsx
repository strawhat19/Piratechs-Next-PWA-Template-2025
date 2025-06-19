import Link from 'next/link';
import InfoIcon from '@mui/icons-material/Info';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';

export default function Nav({ iconSize = 24 }) {
    return (
        <nav className={`container`}>
            <ul className={`container row justifyEnd`}>
                <li>
                    <Link href={`/about`} className={`medFont colorwhite`}>
                        <InfoIcon className={`linkHover`} style={{ fontSize: iconSize }} />
                        About
                    </Link>
                </li>
                <li>
                    <Link href={`/styles`} className={`medFont colorwhite`}>
                        <FormatPaintIcon className={`linkHover`} style={{ fontSize: iconSize - 2 }} />
                        Styles
                    </Link>
                </li>
            </ul>
        </nav>
    )
}