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

export default function Container({ children, className = `containerComponent` }: any) {
    const pathname = usePathname();
    let [loaded, setLoaded] = useState<any>(false);
    let [isDevEnv, setDevEnv] = useState<any>(devEnv);
    let [width, setWidth] = useState<any>(defaultSizes.window);
    let [menuExpanded, setMenuExpanded] = useState<any>(false);
    // let [headerEndWidth, setHeaderEndWidth] = useState<any>(defaultSizes.headerEnd);
    // let [headerStartWidth, setHeaderStartWidth] = useState<any>(defaultSizes.headerStart);

    useEffect(() => {
        const onResize = () => {
            const windowWidth = window?.innerWidth;
            setWidth((prevWidth?: number) => prevWidth !== windowWidth ? windowWidth : prevWidth);
            
            // if (windowWidth < 768) {
            //     let headerStartWidth = defaultSizes.headerStart;
            //     let headerStart = document.querySelector(`.headerStart`);
            //     if (headerStart) {
            //         headerStartWidth = headerStart?.clientWidth;
            //         setHeaderStartWidth((prevWidth?: number) => prevWidth !== headerStartWidth ? headerStartWidth : prevWidth);
            //     }

            //     let headerEndWidth = defaultSizes.headerEnd;
            //     let headerEnd = document.querySelector(`.headerEnd`);
            //     if (headerEnd) {
            //         headerEndWidth = headerEnd?.clientWidth;
            //         setHeaderEndWidth((prevWidth?: number) => prevWidth !== headerEndWidth ? headerEndWidth : prevWidth);
            //     }
            // }
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
        menuExpanded, setMenuExpanded,
    }), [width, loaded, isDevEnv, menuExpanded]);

    const getPageName = (path = pathname) => {
        let pageName = `Home`;
        if (path != `/`) {
            pageName = capWords(path?.slice(1, path?.length))
        }
        return pageName;
    }

    return (
        <State.Provider value={state}>
            <body className={`${className} ${getPageName()} pageContainer ${(!loaded || width <= constants?.breakpoints?.mobile) ? `mobile` : ``}`}>

                <Header />

                <main className={`container`}>

                    <Logo label={getPageName()} />
                
                    {/* <div className={`grid gridRow w100 gap15`}>
                        <span className={`center`}>{loaded && isDevEnv ? `Window Width: ${width}px` : ``}</span>
                        {/* <span className={`center`}>{loaded && isDevEnv ? `Header Start Width: ${headerStartWidth}px` : ``}</span> */}
                        {/* <span className={`center`}>{loaded && isDevEnv ? `Header End Width: ${headerEndWidth}px` : ``}</span> */}
                    {/* </div> */}

                    {children}

                </main>

                <Footer />

            </body>
        </State.Provider>
    )
}