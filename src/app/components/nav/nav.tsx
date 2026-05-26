'use client';

import Link from 'next/link';
import CartDrawer from '../store/cart-drawer';
import MenuTrigger from '../menu/menu-trigger';
import { useContext, useMemo, useState } from 'react';
import { useStoreCart } from '../store/use-store-cart';
import { StateGlobals } from '@/shared/global-context';
import { useRouter, usePathname } from 'next/navigation';
import Icon_Button from '../buttons/icon-button/icon-button';
import Notification from '../notifications/notification/notification';
import { AnnouncementStatus } from '@/shared/types/models/Announcement';
import { statusColors } from '../store/product-form/product-select-field';
import { capWords, dev, sortByCreatedNewest } from '@/shared/scripts/constants';
import { announcementIcons } from '../store/announcement-form/announcement-select-field';
import { Menu, Close, Campaign, BarChart, Settings, PermMedia, Checklist, Notifications, ShoppingCart, Person, Logout, Storefront, DeleteSweep } from '@mui/icons-material';

const size = 20;
const devEnv = dev();
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
    store: { icons: { fontAwesome: `fa-store`, mui: <Storefront style={{ fontSize: size - 2 }} className={`linkHover`} /> } },
    board: { icons: { fontAwesome: `fa-list-check`, mui: <Checklist style={{ fontSize: size }} className={`linkHover`} /> } },
    gallery: { icons: { fontAwesome: `fa-images`, mui: <PermMedia style={{ fontSize: size - 2 }} className={`linkHover`} /> } },
    stocks: { icons: { fontAwesome: `fa-bars`, mui: <BarChart style={{ fontSize: size }} className={`linkHover`} /> } },
}

export default function Nav({ iconSize = size, className = `navComponent` }) {
    const router = useRouter();
    const pathname = usePathname();

    let { user, loaded, announcements = [], announcementsLoading = false, menuExpanded, setMenuExpanded, onSignOut } = useContext<any>(StateGlobals);

    let [cartDrawerOpen, setCartDrawerOpen] = useState(false);
    const { cart, cartCount, cartTotal, clearCart, saveCart, increaseCartItemQuantity, decreaseCartItemQuantity } = useStoreCart();

    const profileMenuItems = [
        {
            id: `profile`,
            label: `Profile`,
            icon: <Person fontSize={`small`} htmlColor={`var(--links)`} />,
            onClick: () => {
                router.push(`/profile`);
            },
        },
        {
            id: `signout`,
            label: `Sign Out`,
            icon: <Logout fontSize={`small`} style={{ fontSize: 18 }} htmlColor={statusColors.Unavailable} />,
            onClick: async () => {
                // toast.info(`Signing Out`);
                await onSignOut()?.then(() => {
                    // toast.info(`Signed Out`);
                    // router.push(`/`);
                });
            },
        },
    ];

    const cartMenuItems = [
        {
            id: `view-cart`,
            label: `View Cart`,
            onClick: () => setCartDrawerOpen(true),
            icon: <ShoppingCart fontSize={`small`} style={{ fontSize: 18 }} htmlColor={`var(--links)`} />,
        },
        {
            id: `clear-cart`,
            onClick: clearCart,
            label: `Clear Cart`,
            icon: <DeleteSweep fontSize={`small`} htmlColor={statusColors.Unavailable} />,
        },
        // {
        //     id: `go-store`,
        //     label: `To Store`,
        //     onClick: () => router.push(`/store`),
        //     icon: <Storefront htmlColor={`var(--success)`} />,
        // },
    ];

    const notificationMenuItems = useMemo(() => {
        if (announcementsLoading || !Array.isArray(announcements)) return [];
        const activeAnnouncements = announcements?.filter((announcement: any) => {
            const status = String(announcement?.status || (announcement?.active ? AnnouncementStatus.Active : AnnouncementStatus.Draft));
            return status?.toLowerCase?.() == AnnouncementStatus.Active.toLowerCase();
        });
        if (!activeAnnouncements?.length) {
            return [{
                id: `no-notifications`,
                label: (
                    <div className={`notificationMenuItemLabel`}>
                        <strong>No Notifications</strong>
                        <span>You are all caught up</span>
                    </div>
                ),
                icon: <Notifications fontSize={`small`} htmlColor={`var(--silver)`} />,
            }];
        }
        let announcementNotifications = sortByCreatedNewest(activeAnnouncements)?.map((announcement: any) => {
            return {
                className: `notificationMenuItem`,
                id: announcement?.id || announcement?.name,
                label: <Notification announcement={announcement} />,
                icon: announcementIcons?.[announcement?.icon] || <Campaign fontSize={`small`} htmlColor={`var(--yellow_neon)`} />,
            };
        });
        return announcementNotifications;
    }, [announcements, announcementsLoading]);

    const notificationCount = notificationMenuItems?.filter((item: any) => item?.id != `no-notifications`)?.length || 0;

    const renderRouteLink = (path: string, config: any) => {
        return (
            <Link href={`/${path}`} className={`smallFont colorwhite flexContainer`}>
                <span className={`navIconWrap`}>
                    {config.icons.mui}
                </span>
                <span className={`linkText`}>
                    {capWords(path)}
                </span>
            </Link>
        );
    };

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
                            <MenuTrigger
                                colors={true}
                                topOffset={1}
                                onHover={devEnv}
                                id={`profileMenuButton`}
                                menuItems={profileMenuItems}
                                renderTrigger={({ id, onClick }) => (
                                    <Icon_Button id={id} onClick={onClick} disabled={!loaded} title={`Profile`} className={`profileButton avatar iconImg`}>
                                        <span className={`letter`}>
                                            {user?.name?.[0]}
                                        </span>
                                        {/* <Person className={`settingsIcon`} style={{ fontSize: 20 }} /> */}
                                    </Icon_Button>
                                )}
                            />
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
                <li className={`menuButton notificationMenuButton`}>
                    <MenuTrigger
                        colors={true}
                        topOffset={1}
                        id={`notificationMenuButton`}
                        className={`notificationMenu`}
                        menuItems={notificationMenuItems}
                        targetID={`notificationMenuButton`}
                        renderTrigger={({ id, onClick }) => (
                            <Icon_Button id={id} onClick={onClick} disabled={!loaded} title={`Notifications`} className={`notificationButton iconImg`}>
                                <span className={`navIconWrap`}>
                                    <Notifications className={`settingsIcon`} style={{ fontSize: 20 }} />
                                    {notificationCount > 0 ? (
                                        <span className={`navBadge notificationNavBadge`}>
                                            {notificationCount}
                                        </span>
                                    ) : null}
                                </span>
                            </Icon_Button>
                        )}
                    />
                </li>
                <li className={`menuButton cartMenuButton`}>
                    <MenuTrigger
                        colors={true}
                        topOffset={1}
                        onHover={devEnv}
                        id={`cartMenuButton`}
                        className={`cartMenu`}
                        menuItems={cartMenuItems}
                        targetID={`cartMenuButton`}
                        renderTrigger={({ id, onClick }) => (
                            <Icon_Button id={id} onClick={onClick} disabled={!loaded} title={`Cart`} className={`cartButton iconImg`}>
                                <span className={`navIconWrap`}>
                                    <ShoppingCart className={`settingsIcon`} style={{ fontSize: 17 }} />
                                    {cartCount > 0 ? (
                                        <span className={`navBadge cartNavBadge`}>
                                            {cartCount}
                                        </span>
                                    ) : null}
                                </span>
                            </Icon_Button>
                        )}
                    />
                </li>
                {Object.entries(routes).map(([path, config]: any) => (
                    <li key={path} onClick={() => setMenuExpanded(false)} className={`navigationLink hideOnMobile ${pathname?.includes(path) ? `activeRoute` : ``}`}>
                        {renderRouteLink(path, config)}
                    </li>
                ))}
                {/* {className == `mobileNav` && (
                    <li>
                        <AuthForm />
                    </li>
                )} */}
            </ul>
            <CartDrawer
                open={cartDrawerOpen}
                cart={cart}
                total={cartTotal}
                onClose={() => setCartDrawerOpen(false)}
                onClearCart={clearCart}
                onPaymentSuccess={() => saveCart([])}
                onIncreaseQuantity={increaseCartItemQuantity}
                onDecreaseQuantity={decreaseCartItemQuantity}
            />
        </nav>
    )
}
