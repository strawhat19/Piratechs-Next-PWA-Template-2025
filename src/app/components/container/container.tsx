'use client';

import './container.scss';

import Header from '../headers/header/header';
import Footer from '../footers/footer/footer';
import { createContext, useState } from 'react';

export const State = createContext({});

export default function Container({ children, className = `containerComponent` }: any) {
    let [menuExpanded, setMenuExpanded] = useState<any>(false);
    return (
        <State.Provider value={{
            menuExpanded, setMenuExpanded, 
        }}>
            <body className={`${className} pageContainer`}>
                <Header />
                <main className={`container`}>
                    {children}
                </main>
                <Footer />
            </body>
        </State.Provider>
    )
}