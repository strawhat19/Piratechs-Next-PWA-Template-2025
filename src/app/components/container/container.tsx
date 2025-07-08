'use client';

import './container.scss';

import Logo from '../logo/logo';
import Header from '../headers/header/header';
import Footer from '../footers/footer/footer';
import { usePathname } from 'next/navigation';
import { createContext, useEffect, useMemo, useState } from 'react';
import { capWords, constants, debounce, devEnv } from '@/shared/scripts/constants';

export const State = createContext({});

export const defaultSizes = { window: 1920, headerEnd: 325, headerStart: 415 };

export const getPageName = (path: string) => {
    let pageName = `Home`;
    if (path != `/`) {
        pageName = capWords(path?.slice(1, path?.length))
    }
    return pageName;
}

export default function Container({ children, className = `containerComponent` }: any) {
    const pathname = usePathname();
    let [loaded, setLoaded] = useState<any>(false);
    let [isDevEnv, setDevEnv] = useState<any>(devEnv);
    let [smallScreen, setSmallScreen] = useState<any>(true);
    let [width, setWidth] = useState<any>(defaultSizes.window);
    let [menuExpanded, setMenuExpanded] = useState<any>(false);

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
        width, setWidth,
        loaded, setLoaded,
        isDevEnv, setDevEnv,
        smallScreen, setSmallScreen,
        menuExpanded, setMenuExpanded,
    }), [width, loaded, isDevEnv, menuExpanded, smallScreen]);

    return (
        <State.Provider value={state}>
            <body className={`${className} ${getPageName(pathname)} pageContainer ${(!loaded || width <= constants?.breakpoints?.mobile) ? `mobile` : ``}`}>
                <Header />
                <main className={`container`}>
                    <Logo label={getPageName(pathname)} />
                    {children}
                </main>
                <Footer />
            </body>
        </State.Provider>
    )
}