'use client';

import Link from 'next/link';
import { useContext } from 'react';
import { State } from '../container/container';
import { capWords } from '@/shared/scripts/constants';

import { 
    Menu,
    Mail,
    Info, 
    Brush,
    Close,
    // Chat,
    // Login,
    // Person,
    // Settings,
    // PersonAdd,
    // Notifications,
} from '@mui/icons-material';

const size = 22;
export const routes = {
//   settings: {  icons: { fontAwesome: `fa-cog`, mui: <Settings style={{ fontSize: size }} className={`linkHover`} /> } },
//   chats: { icons: { fontAwesome: `fa-comments`, mui: <Chat style={{ fontSize: size }} className={`linkHover`} /> } },
//   profile: { icons: { fontAwesome: `fa-user`, mui: <Person style={{ fontSize: size }} className={`linkHover`} /> } },
//   notifications: { icons: { fontAwesome: `fa-bell`, mui: <Notifications style={{ fontSize: size }} className={`linkHover`} /> } },
//   signup: { icons: { fontAwesome: `fa-user-plus`, mui: <PersonAdd style={{ fontSize: size }} className={`linkHover`} /> } },
//   signin: { icons: { fontAwesome: `fa-sign-in-alt`, mui: <Login style={{ fontSize: size }} className={`linkHover`} /> } },
  styles: { icons: { fontAwesome: `fa-paint-brush`, mui: <Brush style={{ fontSize: size + 2 }} className={`linkHover`} /> } },
  contact: { icons: { fontAwesome: `fa-envelope`, mui: <Mail style={{ fontSize: size }} className={`linkHover`} /> } },
  about: { icons: { fontAwesome: `fa-info-circle`, mui: <Info style={{ fontSize: size }} className={`linkHover`} /> } },
}

export default function Nav({ iconSize = size, className = `navComponent` }) {
    let { menuExpanded, setMenuExpanded } = useContext<any>(State);

    return (
        <nav className={`container ${className}`}>
            <ul className={`container row justifyEnd`}>
                {className != `mobileNav` && (
                    <li className={`menuToggle showOnMobile`}>
                        {menuExpanded ? (
                            <Close 
                                style={{ fontSize: iconSize }} 
                                onClick={() => setMenuExpanded(!menuExpanded)}
                                className={`menuToggleIcon menuCloseIcon linkHover cursorPointer`} 
                            />
                        ) : (
                            <Menu 
                                style={{ fontSize: iconSize }} 
                                onClick={() => setMenuExpanded(!menuExpanded)}
                                className={`menuToggleIcon menuOpenIcon linkHover cursorPointer`} 
                            />
                        )}
                    </li>
                )}
                {Object.entries(routes).map(([path, config]) => (
                    <li key={path} className={`navigationLink hideOnMobile`}>
                        <Link href={`/${path}`} className={`medFont colorwhite flexContainer`}>
                            {config.icons.mui}
                            <span className={`linkText`}>
                                {capWords(path)}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    )
}