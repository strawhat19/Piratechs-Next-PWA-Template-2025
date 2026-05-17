'use client';

import Link from 'next/link';
import { useContext } from 'react';
import { usePathname } from 'next/navigation';
import { capWords } from '@/shared/scripts/constants';
import { StateGlobals } from '@/shared/global-context';
import Icon_Button from '../buttons/icon-button/icon-button';
// import AuthForm from '../authentication/forms/auth-form/auth-form';

import { 
    Menu,
    Close,
    Person,
    BarChart,
    Settings,
    PermMedia,
    Checklist,
    ShoppingCart,
} from '@mui/icons-material';

const size = 20;
export const routes = {
//   settings: {  icons: { fontAwesome: `fa-cog`, mui: <Settings style={{ fontSize: size }} className={`linkHover`} /> } },
//   chats: { icons: { fontAwesome: `fa-comments`, mui: <Chat style={{ fontSize: size }} className={`linkHover`} /> } },
//   profile: { icons: { fontAwesome: `fa-user`, mui: <Person style={{ fontSize: size }} className={`linkHover`} /> } },
//   notifications: { icons: { fontAwesome: `fa-bell`, mui: <Notifications style={{ fontSize: size }} className={`linkHover`} /> } },
//   signup: { icons: { fontAwesome: `fa-user-plus`, mui: <PersonAdd style={{ fontSize: size }} className={`linkHover`} /> } },
//   signin: { icons: { fontAwesome: `fa-sign-in-alt`, mui: <Login style={{ fontSize: size }} className={`linkHover`} /> } },
//   styles: { icons: { fontAwesome: `fa-paint-brush`, mui: <Brush style={{ fontSize: size }} className={`linkHover`} /> } },
//   contact: { icons: { fontAwesome: `fa-envelope`, mui: <Mail style={{ fontSize: size }} className={`linkHover`} /> } },
//   about: { icons: { fontAwesome: `fa-info-circle`, mui: <Info style={{ fontSize: size }} className={`linkHover`} /> } },
    store: { icons: { fontAwesome: `fa-list-shopping-cart`, mui: <ShoppingCart style={{ fontSize: size - 3 }} className={`linkHover`} /> } },
    board: { icons: { fontAwesome: `fa-list-check`, mui: <Checklist style={{ fontSize: size }} className={`linkHover`} /> } },
    gallery: { icons: { fontAwesome: `fa-images`, mui: <PermMedia style={{ fontSize: size - 2 }} className={`linkHover`} /> } },
    stocks: { icons: { fontAwesome: `fa-bars`, mui: <BarChart style={{ fontSize: size }} className={`linkHover`} /> } },
}

export default function Nav({ iconSize = size, className = `navComponent` }) {
    const pathname = usePathname();
    let { user, loaded, menuExpanded, setMenuExpanded } = useContext<any>(StateGlobals);

    return (
        <nav className={`container ${className}`}>
            <ul className={`container row justifyEnd`}>
                {className != `mobileNav` && <>
                    {user == null ? <>
                        {/* <AuthForm style={{ position: `relative`, right: -10 }} /> */}
                        <Icon_Button disabled={!loaded} title={`Settings`} url={`/settings`}>
                            <Settings className={`settingsIcon`} style={{ fontSize: 20 }} />
                        </Icon_Button>
                    </> : (
                        <li className={`menuButton`}>
                            {/* Welcome, {user?.name} */}
                            <Icon_Button disabled={!loaded} title={`Profile`} url={`/profile`} className={`profileButton`}>
                                <span className={`letter`}>
                                    {user?.name?.[0]}
                                </span>
                                {/* <Person className={`settingsIcon`} style={{ fontSize: 20 }} /> */}
                            </Icon_Button>
                        </li>
                    )}
                    <li className={`menuToggle showOnMobile`} onClick={() => setMenuExpanded(!menuExpanded)}>
                        {menuExpanded ? (
                            <Icon_Button disabled={!loaded} title={``}>
                                <Close style={{ fontSize: iconSize }} className={`menuToggleIcon menuCloseIcon linkHover cursorPointer`} />
                            </Icon_Button>
                        ) : (
                            <Icon_Button disabled={!loaded} title={``}>
                                <Menu style={{ fontSize: iconSize }} className={`menuToggleIcon menuOpenIcon linkHover cursorPointer`} />
                            </Icon_Button>
                        )}
                    </li>
                </>}
                {Object.entries(routes).map(([path, config]: any) => (
                    <li key={path} onClick={() => setMenuExpanded(false)} className={`navigationLink hideOnMobile ${pathname?.includes(path) ? `activeRoute` : ``}`}>
                        <Link href={`/${path}`} className={`smallFont colorwhite flexContainer`}>
                            {config.icons.mui}
                            <span className={`linkText`}>
                                {capWords(path)}
                            </span>
                        </Link>
                    </li>
                ))}
                {/* {className == `mobileNav` && (
                    <li>
                        <AuthForm />
                    </li>
                )} */}
            </ul>
        </nav>
    )
}