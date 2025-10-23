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
import { User } from '@/shared/types/models/User';
import { toast, ToastContainer } from 'react-toastify';
import { AuthStates, Types } from '@/shared/types/types';
import { createContext, useEffect, useMemo, useState } from 'react';
import { imagesObject } from '../slider/images-carousel/images-carousel';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { sampleStockAccount, sampleStocks } from '@/shared/server/database/samples/stocks/stocks';
import { updateUserInDatabase, auth, renderFirebaseAuthErrorMessage } from '@/shared/server/firebase';
import { capWords, constants, debounce, devEnv, genID, getIDParts, isInStandaloneMode, logToast, randomNumber } from '@/shared/scripts/constants';

export const State = createContext({});

export const defaultSizes = { window: 1920, headerEnd: 325, headerStart: 415, windowH: 1080, };

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
    let [usersLoading, setUsersLoading] = useState(true);

    let [isPWA, setIsPWA] = useState(false);
    let [selected, setSelected] = useState<any>(null);
    let [smallScreen, setSmallScreen] = useState<any>(true);
    let [width, setWidth] = useState<any>(defaultSizes.window);
    let [menuExpanded, setMenuExpanded] = useState<any>(false);
    let [height, setHeight] = useState<any>(defaultSizes.windowH);
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

    const refreshUsers = async () => {
        setUsersLoading(true);
        try {
            const res = await fetch(`/api/users`, {
                method: `GET`,
                cache: `no-store`,
                headers: { [`Accept`]: `application/json` },
            });

            if (!res.ok) {
                const msg = `Failed to Get Users (${res.status})`;
                logToast(msg, `Error`, true);
                return;
            }

            const data = (await res.json()) as unknown;

            if (!Array.isArray(data)) {
                logToast(`Error on Get Users`, `Error`, true);
                return;
            }

            const usersFromAPI = data.map((u) => new User({
                id: String((u as any).id ?? ``),
                ...u,
            })) as User[];

            setUsers(usersFromAPI);
        } catch (err: any) {
            logToast(`Error on Get Users`, `Error`, true, err);
        } finally {
            setUsersLoading(false);
        }
    }

    const onSignIn = (usr: User, showSuccess = false) => {
        if (user != null) return;
        setUser(usr);
        setAuthState(AuthStates.Sign_Out);
        if (showSuccess && loaded == false) {
            // logToast(`${usr?.name} Signed In Successfully`, ``, false, usr);
        }
        setLoaded(true);
    }

    const onSignOut = async () => {
        setUser(null);
        setAuthState(AuthStates.Next);
        await signOut(auth);
    }

    const onSignInError = (error: any): any => {
        onSignOut();
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorMessage) {
            toast.error(renderFirebaseAuthErrorMessage(errorMessage));
            console.log(`Error Signing In`, {
                error,
                errorCode,
                errorMessage,
            });
        }
        setAuthState(AuthStates.Sign_In);
        return;
    }

    const signInUser = async (email: string, password: string) => {
        signInWithEmailAndPassword(auth, email, password).then(async (userCredential: any) => {
            if (userCredential != null) {
                let existingUser = users.find((usr: User) => usr?.email?.toLowerCase() == email?.toLowerCase());
                if (existingUser) {
                    const { date } = getIDParts();
                    await updateUserInDatabase(existingUser?.id, { signedIn: true, lastSignIn: date, lastAuthenticated: date, updated: date, }).then(async () => {
                        // refreshUsers();
                        // let usr = users.find((usr: User) => usr?.email?.toLowerCase() == email?.toLowerCase());
                        // if (usr) {
                        //     onSignIn(usr);
                        // } else onSignOut();
                    }).catch(error => onSignInError(error));
                } else onSignOut();
            }
        }).catch(error => onSignInError(error));
    }

    useEffect(() => {
        let listenForUserAuthChanges: any = null;
        if (users?.length > 0) {
            if (listenForUserAuthChanges == null) listenForUserAuthChanges = onAuthStateChanged(auth, async (usr) => {
                if (usr) {
                    if (usr?.uid) {
                        let thisUser = users.find((us: User) => us?.uid == usr?.uid);
                        onSignIn(thisUser, true);
                    }
                } else {
                    console.log(`Users`, users);
                    setLoaded(true);
                }
            });
        } else if (listenForUserAuthChanges != null) {
            listenForUserAuthChanges();
            setLoaded(true);
        }
        return () => {
            if (listenForUserAuthChanges != null) {
                listenForUserAuthChanges();
                setLoaded(true);
            }
        };
    }, [users]);

    useEffect(() => {
        if (typeof window != `undefined`) {
            let isOnPWA = isInStandaloneMode();
            setIsPWA(isOnPWA);
        }

        const onResize = () => {
            const windowWidth = window?.innerWidth;
            const windowHeight = window?.innerHeight;
            setSmallScreen(windowWidth <= constants?.breakpoints?.mobile);
            setWidth((prevWidth?: number) => prevWidth !== windowWidth ? windowWidth : prevWidth);
            setHeight((prevHeight?: number) => prevHeight !== windowHeight ? windowHeight : prevHeight);
        }

        const debouncedResize = debounce(onResize, 5);

        onResize();

        refreshUsers();

        window?.addEventListener(`resize`, debouncedResize);
        return () => window?.removeEventListener(`resize`, debouncedResize);
    }, []);

    const state = useMemo(() => ({
        onSignOut,
        signInUser,
        user, setUser,
        users, setUsers,
        width, setWidth,
        height, setHeight,
        usersLoading, setUsersLoading,

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
        user, users, usersLoading, width, height, selected, loaded, isDevEnv, 
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