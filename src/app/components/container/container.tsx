'use client';

import 'react-toastify/dist/ReactToastify.css';

import './container.scss';

import Logo from '../logo/logo';
import TopBar from '../topbar/topbar';
import Loader from '../loaders/loader';
import { useContext, useEffect } from 'react';
import Header from '../headers/header/header';
import Footer from '../footers/footer/footer';
import { usePathname } from 'next/navigation';
import DialogComponent from '../dialog/dialog';
import { ToastContainer } from 'react-toastify';
import { constants, devEnv } from '@/shared/scripts/constants';
import { getPageName, StateGlobals } from '@/shared/global-context';
import HorizontalScroller from '../horizontal-scroller/horizontal-scroller';

const BodyClassManager = ({ className }: { className: string }) => {
    useEffect(() => {
        document.body.className = className;
    }, [className]);
    return null;
}

// const announcementsBarComponent = (
//     <div className={`announcementsBarComponent`}>
//         {/* {(loading || stocks?.length == 0 || !stocks || !Array.isArray(stocks)) ? (
//                         <Loader height={35} label={`Stocks Loading`} className={`topBarLoader`} />
//                     ) : ( */}
//     </div>
// )

// const defaultTopBarComponent = ;

export default function Container({ 
    children, 
    logoLabel = ``, 
    topBarStyle = {},
    showPageLogo = true, 
    showPageFooter = true, 
    oveflowHidden = devEnv,
    mainClassName = `mainClassName`,
    className = `containerComponent`,
    topBarComponent = <HorizontalScroller />, 
    logoComponentClass = `logoComponentClass`,
    pageLogoComponentContainerEndComponent = null, 
    pageLogoComponentContainerStartComponent = null, 
}: any) {
    const pathname = usePathname();

    let { user, loaded, isPWA, width, announcements, announcementsLoading } = useContext<any>(StateGlobals);

    const bodyClassName = `${className} ${getPageName(pathname)} ${user == null ? `noUser` : `hasUser`} pageContainer ${isPWA ? `isPWA` : `isStandardPlatform`} ${oveflowHidden ? `overflowHidden` : `overflowDefault`} ${(!loaded || width <= constants?.breakpoints?.mobile) ? `mobile` : ``}`;

    return (
        <>
            <BodyClassManager className={bodyClassName} />
            {topBarComponent != null && (
                <TopBar style={topBarStyle}>
                    {(announcements && announcements?.length > 0 && !announcementsLoading) ? topBarComponent : (
                        <Loader height={35} label={`Announcement(s) Loading`} className={`topBarLoader`} />
                    )}
                </TopBar>
            )}
            <Header />
            <main className={`container ${mainClassName}`} aria-hidden={true}>
                {showPageLogo && (
                    <div className={`pageLogoComponentContainer`}>
                        {pageLogoComponentContainerStartComponent && (
                            <div className={`pageLogoComponentContainerStart pageLogoComponentContainerColumn`}>
                                {pageLogoComponentContainerStartComponent}
                            </div>
                        )}
                        <div className={`pageLogoComponentContainerCenter`}>
                            <Logo className={logoComponentClass} label={logoLabel != `` ? logoLabel : getPageName(pathname)} />
                        </div>
                        {pageLogoComponentContainerEndComponent && (
                            <div className={`pageLogoComponentContainerEnd pageLogoComponentContainerColumn`}>
                                {pageLogoComponentContainerEndComponent}
                            </div>
                        )}
                    </div>
                )}
                {children}
                <DialogComponent />
                <ToastContainer
                    draggable
                    rtl={false}
                    closeOnClick
                    theme={`dark`}
                    autoClose={3_500}
                    newestOnTop={true}
                    pauseOnHover={false}
                    hideProgressBar={false}
                    pauseOnFocusLoss={false}
                    style={{ marginTop: 75 }}
                    position={`bottom-right`}
                    // position={(isPWA || width <= constants?.breakpoints?.mobile) ? `bottom-right` : `top-right`}
                />
            </main>
            {showPageFooter && <Footer />}
        </>
    )
}
