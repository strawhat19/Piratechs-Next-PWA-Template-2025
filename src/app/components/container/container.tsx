'use client';

import 'react-toastify/dist/ReactToastify.css';

import './container.scss';

import Logo from '../logo/logo';
import TopBar from '../topbar/topbar';
import Header from '../headers/header/header';
import Footer from '../footers/footer/footer';
import { usePathname } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import { AuthStates } from '@/shared/types/types';
import { User } from '@/shared/types/models/User';
import { createContext, useEffect, useMemo, useState } from 'react';
import { capWords, constants, debounce, devEnv } from '@/shared/scripts/constants';
import { sampleStockAccount, sampleStocks } from '@/shared/server/database/samples/stocks/stocks';

export const State = createContext({});

export const defaultSizes = { window: 1920, headerEnd: 325, headerStart: 415 };

export const getPageName = (path: string) => {
    let pageName = `Home`;
    if (path != `/`) {
        pageName = capWords(path?.slice(1, path?.length));
    }
    return pageName;
}

export default function Container({ 
    children, 
    logoLabel = ``, 
    showPageLogo = true, 
    topBarComponent = null, 
    className = `containerComponent`,
}: any) {
    const pathname = usePathname();

    let [users, setUsers] = useState<any>([]);
    let [loaded, setLoaded] = useState<any>(false);
    let [isDevEnv, setDevEnv] = useState<any>(devEnv);
    let [user, setUser] = useState<User | null>(null);
    
    let [smallScreen, setSmallScreen] = useState<any>(true);
    let [width, setWidth] = useState<any>(defaultSizes.window);
    let [menuExpanded, setMenuExpanded] = useState<any>(false);
    let [authState, setAuthState] = useState<AuthStates>(AuthStates.Next);
    
    let [histories, setHistories] = useState([]);
    let [stocks, setStocks] = useState(sampleStocks);
    let [stockOrders, setStockOrders] = useState([]);
    let [stockPositions, setStockPositions] = useState([]);
    let [stocksAcc, setStocksAcc] = useState<any>(sampleStockAccount);

    useEffect(() => {
        const onResize = () => {
            const windowWidth = window?.innerWidth;
            setSmallScreen(windowWidth <= constants?.breakpoints?.mobile);
            setWidth((prevWidth?: number) => prevWidth !== windowWidth ? windowWidth : prevWidth);
        }

        const debouncedResize = debounce(onResize, 5);

        onResize();
        setLoaded(true);

        window?.addEventListener(`resize`, debouncedResize);
        return () => window?.removeEventListener(`resize`, debouncedResize);
    }, []);

    const state = useMemo(() => ({
        user, setUser,
        users, setUsers,
        width, setWidth,
        loaded, setLoaded,
        isDevEnv, setDevEnv,
        authState, setAuthState,
        smallScreen, setSmallScreen,
        menuExpanded, setMenuExpanded,
        
        stocks, setStocks,
        stocksAcc, setStocksAcc,
        histories, setHistories,
        stockOrders, setStockOrders,
        stockPositions, setStockPositions,
    }), [user, users, width, loaded, isDevEnv, authState, menuExpanded, smallScreen, stocks, histories, stockOrders, stocksAcc, stockPositions]);

    return (
        <State.Provider value={state}>
            <body className={`${className} ${getPageName(pathname)} pageContainer ${devEnv ? `overflowHidden` : ``} ${(!loaded || width <= constants?.breakpoints?.mobile) ? `mobile` : ``}`}>
                {topBarComponent != null && (
                    <TopBar>
                        {topBarComponent}
                    </TopBar>
                )}
                <Header />
                <main className={`container`}>
                    {showPageLogo && <Logo label={logoLabel != `` ? logoLabel : getPageName(pathname)} />}
                    {children}
                    <ToastContainer
                        draggable
                        rtl={false}
                        closeOnClick
                        theme={`dark`}
                        autoClose={3_500}
                        newestOnTop={true}
                        pauseOnHover={false}
                        position={`top-right`}
                        hideProgressBar={false}
                        pauseOnFocusLoss={false}
                        style={{ marginTop: 55 }}
                    />
                </main>
                <Footer />
            </body>
        </State.Provider>
    )
}