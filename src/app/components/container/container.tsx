'use client';

import 'react-toastify/dist/ReactToastify.css';

import './container.scss';

import Logo from '../logo/logo';
import TopBar from '../topbar/topbar';
import { Item } from '../board/item/item';
import Header from '../headers/header/header';
import Footer from '../footers/footer/footer';
import { usePathname } from 'next/navigation';
import DialogComponent from '../dialog/dialog';
import { ToastContainer } from 'react-toastify';
import { User } from '@/shared/types/models/User';
import { AuthStates, Types } from '@/shared/types/types';
import { createContext, useEffect, useMemo, useState } from 'react';
import { imagesObject } from '../slider/images-carousel/images-carousel';
import { sampleStockAccount, sampleStocks } from '@/shared/server/database/samples/stocks/stocks';
import { capWords, constants, debounce, devEnv, genID, isInStandaloneMode, randomNumber } from '@/shared/scripts/constants';

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
    showPageFooter = true, 
    topBarComponent = null, 
    className = `containerComponent`,
}: any) {
    const pathname = usePathname();

    let [users, setUsers] = useState<any>([]);
    let [loaded, setLoaded] = useState<any>(false);
    let [isDevEnv, setDevEnv] = useState<any>(devEnv);
    let [user, setUser] = useState<User | null>(null);

    let [isPWA, setIsPWA] = useState(false);
    let [selected, setSelected] = useState<any>(null);
    let [smallScreen, setSmallScreen] = useState<any>(true);
    let [width, setWidth] = useState<any>(defaultSizes.window);
    let [menuExpanded, setMenuExpanded] = useState<any>(false);
    let [authState, setAuthState] = useState<AuthStates>(AuthStates.Next);
    
    let [histories, setHistories] = useState([]);
    let [stocks, setStocks] = useState(sampleStocks);
    let [stockOrders, setStockOrders] = useState([]);
    let [stockPositions, setStockPositions] = useState([]);
    let [stocksAcc, setStocksAcc] = useState<any>(sampleStockAccount);

    let type = Types.Item;
    let imageURLs = Object.values(imagesObject.vertical);
    let [boardForm, setBoardForm] = useState<Partial<Item | any>>({ name: ``, description: ``, imageURL: `` });
    let [boardItems, setBoardItems] = useState<Item[]>(() => [
        new Item({ 
            number: 1, 
            name: `First Item`, 
            id: genID(type, 1, `First`)?.id, 
            imageURLs: [imageURLs[randomNumber(imageURLs?.length)]], 
            description: `This is First Item in the Board List Component`, 
        }),
        new Item({ 
            number: 2, 
            name: `Second Item`, 
            id: genID(type, 2, `Second`)?.id, 
            imageURLs: [imageURLs[randomNumber(imageURLs?.length)]], 
            description: `This is Second Item in the Board List Component`, 
        }),
        new Item({ 
            number: 3, 
            name: `Third Item`, 
            id: genID(type, 3, `Third`)?.id, 
            imageURLs: [imageURLs[randomNumber(imageURLs?.length)]], 
            description: `This is Third Item in the Board List Component`,
        }),
    ]);

    useEffect(() => {
        if (typeof window != `undefined`) {
            let isOnPWA = isInStandaloneMode();
            setIsPWA(isOnPWA);
        }

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

        isPWA, setIsPWA,
        loaded, setLoaded,
        isDevEnv, setDevEnv,
        selected, setSelected,
        authState, setAuthState,
        smallScreen, setSmallScreen,
        menuExpanded, setMenuExpanded,
        
        stocks, setStocks,
        stocksAcc, setStocksAcc,
        histories, setHistories,
        stockOrders, setStockOrders,
        stockPositions, setStockPositions,

        boardForm, setBoardForm,
        boardItems, setBoardItems,
    }), [
        user, users, width, selected, loaded, isDevEnv, 
        isPWA, authState, menuExpanded, smallScreen, 
        stocks, histories, stockOrders, stocksAcc, stockPositions,
        boardForm, boardItems,
    ]);

    return (
        <State.Provider value={state}>
            <body className={`${className} ${getPageName(pathname)} pageContainer ${isPWA ? `isPWA` : `isStandardPlatform`} ${devEnv ? `overflowHidden` : ``} ${(!loaded || width <= constants?.breakpoints?.mobile) ? `mobile` : ``}`}>
                {topBarComponent != null && (
                    <TopBar>
                        {topBarComponent}
                    </TopBar>
                )}
                <Header />
                <main className={`container`} aria-hidden={true}>
                    {showPageLogo && <Logo label={logoLabel != `` ? logoLabel : getPageName(pathname)} />}
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
                        position={`top-right`}
                        hideProgressBar={false}
                        pauseOnFocusLoss={false}
                        style={{ marginTop: 75 }}
                    />
                </main>
                {showPageFooter && <Footer />}
            </body>
        </State.Provider>
    )
}