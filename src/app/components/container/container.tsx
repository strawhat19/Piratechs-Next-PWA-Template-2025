'use client';

import './container.scss';

import Header from '../headers/header/header';
import Footer from '../footers/footer/footer';
import { debounce, devEnv } from '@/shared/scripts/constants';
import { createContext, useEffect, useMemo, useState } from 'react';
import Logo from '../logo/logo';

export const State = createContext({});

export default function Container({ children, className = `containerComponent` }: any) {
    let [width, setWidth] = useState<any>(1920);
    let [loaded, setLoaded] = useState<any>(false);
    let [isDevEnv, setDevEnv] = useState<any>(devEnv);
    let [menuExpanded, setMenuExpanded] = useState<any>(false);

    useEffect(() => {
        const onResize = () => {
            const newWidth = window?.innerWidth;
            setWidth((prevWidth?: number) => (prevWidth !== newWidth ? newWidth : prevWidth));
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

    return (
        <State.Provider value={state}>
            <body className={`${className} pageContainer`}>

                <Header />

                <main className={`container`}>

                    <Logo label={width < 330 ? `` : undefined} />
                
                    {loaded && isDevEnv ? `Window Width: ${width}px` : ``}

                    {children}

                </main>

                <Footer />

            </body>
        </State.Provider>
    )
}