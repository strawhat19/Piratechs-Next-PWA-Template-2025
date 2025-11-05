'use client';

import { toast } from 'react-toastify';
import { List } from './types/models/List';
import { Item } from './types/models/Item';
import { Task } from './types/models/Task';
import { Board } from './types/models/Board';
import { User } from '@/shared/types/models/User';
import { AuthStates } from '@/shared/types/types';
import { defaultBoardForm } from '@/app/components/board/form/board-form';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { sampleStockAccount, sampleStocks } from '@/shared/server/database/samples/stocks/stocks';
import { apiRoutes, capWords, constants, debounce, dev, devEnv, isInStandaloneMode, logToast } from '@/shared/scripts/constants';
import { auth, renderFirebaseAuthErrorMessage, Tables, db, boardConverter, userConverter, listConverter, itemConverter, taskConverter } from '@/shared/server/firebase';

export const StateGlobals = createContext({});

export const defaultSizes = { window: 1920, headerEnd: 325, headerStart: 415, windowH: 1080, };

export const getPageName = (path: string) => {
    let pageName = `Home`;
    if (path != `/`) {
        pageName = capWords(path?.slice(1, path?.length));
    }
    return pageName;
}

export default function GlobalProvider({ children }: { children: React.ReactNode }) {    
    let [users, setUsers] = useState<any>([]);
    let [loaded, setLoaded] = useState<any>(false);
    let [isDevEnv, setDevEnv] = useState<any>(devEnv);
    let [user, setUser] = useState<User | null>(null);
    let [usersLoading, setUsersLoading] = useState(true);
    
    let [boards, setBoards] = useState<Board[]>([]);
    let [dataLoading, setDataLoading] = useState(true);

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

    // let type = Types.Item;
    // let imageURLs = Object.values(imagesObject.vertical);
    
    let [boardForm, setBoardForm] = useState<Partial<Item | any>>(defaultBoardForm);
    let [boardItems, setBoardItems] = useState<Item[]>(() => [
        // new Item({ 
        //     number: 1, 
        //     name: `First Item`, 
        //     id: genID(type, 1, `First`)?.id, 
        //     created: genID(type, 1, `First`)?.date, 
        //     updated: genID(type, 1, `First`)?.date, 
        //     imageURLs: [imageURLs[randomNumber(imageURLs?.length)]], 
        //     description: `This is First Item in the Board List Component`, 
        // }),
        // new Item({ 
        //     number: 2, 
        //     name: `Second Item`, 
        //     id: genID(type, 2, `Second`)?.id, 
        //     created: genID(type, 2, `Second`)?.date, 
        //     updated: genID(type, 2, `Second`)?.date, 
        //     imageURLs: [imageURLs[randomNumber(imageURLs?.length)]], 
        //     description: `This is Second Item in the Board List Component`, 
        // }),
        // new Item({ 
        //     number: 3, 
        //     name: `Third Item`, 
        //     id: genID(type, 3, `Third`)?.id, 
        //     created: genID(type, 3, `Third`)?.date, 
        //     updated: genID(type, 3, `Third`)?.date, 
        //     imageURLs: [imageURLs[randomNumber(imageURLs?.length)]], 
        //     description: `This is Third Item in the Board List Component`,
        // }),
    ]);

    const refreshUsers = async () => {
        setUsersLoading(true);
        try {
            const res = await fetch(apiRoutes.users.url, {
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

    const onResize = (force = false) => {
        const windowWidth = window?.innerWidth;
        const windowHeight = window?.innerHeight;
        setSmallScreen(windowWidth <= constants?.breakpoints?.mobile);
        if (force) {
            setWidth(windowWidth);
            setHeight(windowHeight);
        } else {
            setWidth((prevWidth?: number) => prevWidth !== windowWidth ? windowWidth : prevWidth);
            setHeight((prevHeight?: number) => prevHeight !== windowHeight ? windowHeight : prevHeight);
        }
    }

    const onSignIn = (usr: User, showSuccess = false) => {
        if (user != null) return;
        setUser(usr);
        setAuthState(AuthStates.Sign_Out);
        if (showSuccess && loaded == false) {
            logToast(`${usr?.name} Signed In Successfully`, ``, false, usr);
        }
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
                    dev() && console.log(`Found Existing User`, existingUser);
                } else onSignOut();
            }
        }).catch(error => onSignInError(error));
    }

    const boardsUnsubRef = useRef<null | (() => void)>(null);

    const stopBoardsListener = () => {
        if (boardsUnsubRef.current) {
            boardsUnsubRef.current();
            boardsUnsubRef.current = null;
        }
    };

    useEffect(() => {
        if (user != null) {
            if (!dataLoading) {
                if (user?.data?.board?.id) {
                    // dev() && console.log(`User`, user);
                }
            }
        }
    }, [user, dataLoading])

    const refreshUserBoards = (selectedBoard: Board, usr: User | null = user) => {
        setUser(prev => {
            let userToUse = usr ? usr : prev;
            let updBoards = { boards, board: selectedBoard };
            // dev() && boards?.length > 0 && console.log(`Boards`, updBoards);
            return userToUse ? new User({
                ...userToUse,
                data: { ...(userToUse as any).data, ...updBoards },
            }) : userToUse;
        });
        setUsersLoading(false);
        setDataLoading(false);
    }

    useEffect(() => {
        let selectedBoard: Board = user?.data?.board;
        if (!selectedBoard?.id) return;
        const listsRef = collection(db, Tables.lists).withConverter(listConverter);
        const listsQuery = query(listsRef, where(`boardIDs`, `array-contains`, selectedBoard?.id));
        const unsubLists = onSnapshot(listsQuery, listSnap => {
            const lists = listSnap.docs.map(d => new List({ ...d.data(), board: selectedBoard }));
            setUser(prev => prev ? ({ ...prev, data: { ...prev?.data, board: { ...prev?.data?.board, lists } } }) : prev);
            const unsubItemsArr = lists.map((list: List) => {
                const itemsRef = collection(db, Tables.items).withConverter(itemConverter);
                const itemsQuery = query(itemsRef, where(`listIDs`, `array-contains`, list?.id));
                return onSnapshot(itemsQuery, itemSnap => {
                    const items = itemSnap.docs.map(d => new Item({ ...d.data(), board: selectedBoard, list }));
                    const updatedLists = lists?.map(l => new List({ ...l, items: items?.filter(i => i?.listID == l?.id) }));
                    setUser(prev => prev ? ({ ...prev, data: { ...prev?.data, lists: updatedLists, items } }) : prev);
                    items.forEach((item: Item) => {
                        const tasksRef = collection(db, Tables.tasks).withConverter(taskConverter);
                        const tasksQuery = query(tasksRef, where(`itemIDs`, `array-contains`, item?.id));
                        onSnapshot(tasksQuery, taskSnap => {
                            const tasks = taskSnap.docs.map(d => new Task({ ...d.data(), board: selectedBoard, list, item }));
                            dev() && tasks?.length > 0 && console.log(`Tasks for Item "${item?.name}"`, tasks);
                        });
                    });
                    // dev() && items?.length > 0 && console.log(`Items for List "${list?.name}"`, items);
                });
            });
            // dev() && lists?.length > 0 && console.log(`Lists for Board "${selectedBoard?.name}"`, lists);
            return () => unsubItemsArr.forEach(unsub => unsub());
        });
        return () => unsubLists();
    }, [user?.data?.board?.id]);

    useEffect(() => {
        if (!user?.id) {
            stopBoardsListener();
            return;
        }

        const boardsDB = collection(db, Tables.boards).withConverter(boardConverter);
        const boardsDBQuery = query(boardsDB, where(`userIDs`, `array-contains`, user?.id));

        const boardsDBQueryListener = onSnapshot(boardsDBQuery, boardsDBDocs => {
            const boards = boardsDBDocs.docs.map(d => new Board(d.data()));
            setBoards(boards);
            const selectedBoard = boards.find(b => b?.id === (user as any)?.boardID) ?? boards[0];
            refreshUserBoards(selectedBoard);
            setLoaded(true);
        });

        boardsUnsubRef.current = boardsDBQueryListener;

        return () => stopBoardsListener();
    }, [user?.id, (user as any)?.boardID]);

    useEffect(() => {
        if (user != null) {
            const usersDB = collection(db, Tables.users).withConverter(userConverter);
            const usersDBQuery = query(usersDB, where(`userIDs`, `array-contains`, user?.id));

            const usersDBQueryListener = onSnapshot(usersDBQuery, usersDBDocs => {
                const dbUsers = usersDBDocs.docs.map(d => new User(d.data()));
                const dbUser = dbUsers.find(u => u?.id == user?.id) ?? null;
                const selectedBoard = boards.find(b => b?.id === (user as any)?.boardID) ?? boards[0];
                setUsers(dbUsers);
                let usr = dbUser;
                delete usr?.data;
                refreshUserBoards(selectedBoard, usr);
                setLoaded(true);
            });

            return () => {
                usersDBQueryListener();
            }
        }
    }, [user?.id, boards]);

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

        boards, setBoards,
        dataLoading, setDataLoading,

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
        boardForm, boardItems, boards, dataLoading,
    ]);

    return (
        <StateGlobals.Provider value={state}>
            {children}
        </StateGlobals.Provider>
    );
}
