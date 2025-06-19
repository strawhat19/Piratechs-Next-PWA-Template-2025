'use client';

import Link from 'next/link';
import { useContext } from 'react';
import { State } from '../container/container';
import InfoIcon from '@mui/icons-material/Info';
import { Close, Menu } from '@mui/icons-material';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';

export default function Nav({ iconSize = 24, className = `navComponent` }) {
    let { menuExpanded, setMenuExpanded } = useContext<any>(State);
    return (
        <nav className={`container ${className}`}>
            <ul className={`container row justifyEnd`}>
                <li className={`showOnMobile`}>
                    {menuExpanded ? (
                        <Close 
                            style={{ fontSize: iconSize }} 
                            className={`linkHover cursorPointer`} 
                            onClick={() => setMenuExpanded(!menuExpanded)}
                        />
                    ) : (
                        <Menu 
                            style={{ fontSize: iconSize }} 
                            className={`linkHover cursorPointer`} 
                            onClick={() => setMenuExpanded(!menuExpanded)}
                        />
                    )}
                </li>
                <li className={`hideOnMobile`}>
                    <Link href={`/about`} className={`medFont colorwhite`}>
                        <InfoIcon className={`linkHover`} style={{ fontSize: iconSize }} />
                        About
                    </Link>
                </li>
                <li className={`hideOnMobile`}>
                    <Link href={`/styles`} className={`medFont colorwhite`}>
                        <FormatPaintIcon className={`linkHover`} style={{ fontSize: iconSize - 2 }} />
                        Styles
                    </Link>
                </li>
            </ul>
        </nav>
    )
}