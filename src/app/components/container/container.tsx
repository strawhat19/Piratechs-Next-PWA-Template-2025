'use client';

import 'react-toastify/dist/ReactToastify.css';

import './container.scss';

import Logo from '../logo/logo';
import { useContext } from 'react';
import TopBar from '../topbar/topbar';
import Header from '../headers/header/header';
import Footer from '../footers/footer/footer';
import { usePathname } from 'next/navigation';
import DialogComponent from '../dialog/dialog';
import { ToastContainer } from 'react-toastify';
import { constants, devEnv } from '@/shared/scripts/constants';
import { getPageName, StateGlobals } from '@/shared/global-context';

export default function Container({ 
    children, 
    logoLabel = ``, 
    showPageLogo = true, 
    showPageFooter = true, 
    topBarComponent = null, 
    mainClassName = `mainClassName`,
    className = `containerComponent`,
    logoComponentClass = `logoComponentClass`,
    pageLogoComponentContainerEndComponent = null, 
    pageLogoComponentContainerStartComponent = null, 
}: any) {
    const pathname = usePathname();

    let { loaded, isPWA, width } = useContext<any>(StateGlobals);

    return (
        <body className={`${className} ${getPageName(pathname)} pageContainer ${isPWA ? `isPWA` : `isStandardPlatform`} ${devEnv ? `overflowHidden` : ``} ${(!loaded || width <= constants?.breakpoints?.mobile) ? `mobile` : ``}`}>
            {topBarComponent != null && (
                <TopBar>
                    {topBarComponent}
                </TopBar>
            )}
            <Header />
            <main className={`container ${mainClassName}`} aria-hidden={true}>
                <div className={`pageLogoComponentContainer`}>
                    {pageLogoComponentContainerStartComponent && (
                        <div className={`pageLogoComponentContainerStart pageLogoComponentContainerColumn`}>
                            {pageLogoComponentContainerStartComponent}
                        </div>
                    )}
                    <div className={`pageLogoComponentContainerCenter`}>
                        {showPageLogo && <Logo className={logoComponentClass} label={logoLabel != `` ? logoLabel : getPageName(pathname)} />}
                    </div>
                    {pageLogoComponentContainerEndComponent && (
                        <div className={`pageLogoComponentContainerEnd pageLogoComponentContainerColumn`}>
                            {pageLogoComponentContainerEndComponent}
                        </div>
                    )}
                </div>
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
                    position={(isPWA || width <= constants?.breakpoints?.mobile) ? `bottom-right` : `top-right`}
                />
            </main>
            {showPageFooter && <Footer />}
        </body>
    )
}