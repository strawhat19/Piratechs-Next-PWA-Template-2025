'use client';

import './stocks.scss';

import Logo from '../logo/logo';
import Slider from '../slider/slider';
import Loader from '../loaders/loader';
import { toast } from 'react-toastify';
import { SwiperSlide } from 'swiper/react';
import StockOrders from './stock-orders/stock-orders';
import { StateGlobals } from '@/shared/global-context';
// import StockSearch from './stock-search/stock-search';
import StockAccount from './stock-account/stock-account';
import { Stock } from '@/shared/types/models/stocks/Stock';
import { Order } from '@/shared/types/models/stocks/Order';
import StockPositions from './stock-positions/stock-positions';
import { useContext, useEffect, useRef, useState } from 'react';
import { updateUserInDatabase } from '@/shared/server/firebase';
import { Position } from '@/shared/types/models/stocks/Position';
import AuthForm from '../authentication/forms/auth-form/auth-form';
import { DataSources, RobinhoodAccountTypes, StockAPIs } from '@/shared/types/types';
import { RobinhoodStockPosition } from '@/shared/types/models/stocks/robinhood/RobinhoodStockPosition';
import { apiRoutes, constants, dev, errorToast, getAPIServerData, getRealStocks, withinXSeconds } from '@/shared/scripts/constants';

const devEnv = dev();

export const stockTableAlignmentCenter = false;

export const positionProfitLoss = (position: any) => position?.current_price - position?.avg_entry_price;

export const calcTotalProfitLoss = (position: Position | null | any, stock: Stock | null | any) => {
    if (position) {
        if (stock) {
            let { price } = stock;
            let { average, quantity, current, equity } = position;
            if (typeof price == `number` && typeof average == `number`) {
                equity = quantity * average;
                current = quantity * price;
                let totalProfitLoss = Number(current - equity);
                return totalProfitLoss;
            }
        } else return Number(position?.totalProfitLoss);
    } else return Number(position?.totalProfitLoss);
}

export default function Stocks({ className = `stocksComponent` }) {
    const { user, width, stocks, stocksAcc, stockPositions, setStockPositions, setAlpacaPositions, setStocksAcc, stockOrders, setStockOrders, robinhood, setRobinhood, robinhoodAccountTypes, setRobinhoodAccountTypes, realtime, alpacaPositions, stocksFullyLoaded, setStocksFullyLoaded, } = useContext<any>(StateGlobals);

    let robinhoodTokenField = useRef(null);
    let robinhoodSocketTokenField = useRef(null);

    const [loaded, setloaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errored, setErrored] = useState(false);
    const [refreshing, setRefreshing] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date()?.toLocaleString());
    const [robinhoodToken, setRobinhoodToken] = useState(user == null ? `` : user?.z_token_robinhood);
    const [robinhoodSocketToken, setRobinhoodSocketToken] = useState(user == null ? `` : user?.z_token_robinhood_socket);

    const getStock = (stk: Stock | Position | any) => {
        let symbol = stk?.symbol;
        let stck = stocks?.length > 0 ? stocks?.find((s: any) => s?.symbol == symbol) : stk;
        return stck;
    }

    const refreshStocksAccount = () => {
        if (getRealStocks) {
            let apiServerRoute = apiRoutes?.stocks?.routes?.account;
            getAPIServerData(apiServerRoute)?.then(acc => {
                let account = { ...acc, dataSource: DataSources.api, api: StockAPIs.Alpaca };
                setStocksAcc(account);
                setLoading(false);
                console.log(`Alpaca Account`, account);
            });
        } else {
            setLoading(false);
            console.log(`Alpaca Account`, stocksAcc);
        }
    }
    
    const refreshStockPositions = () => {
        if (getRealStocks) {
            let apiServerRoute = apiRoutes?.stocks?.routes?.positions;
            getAPIServerData(apiServerRoute)?.then((alpaca_positions: Position[]) => {
                let positions = alpaca_positions?.map((p: Position) => {
                    let stock: Stock = getStock(p);
                    let totalProfitLoss = calcTotalProfitLoss(p, stock);
                    let newPos = new Position({ ...p, stock, price: stock?.price, totalProfitLoss, dataSource: DataSources.api, api: StockAPIs.Alpaca });
                    return newPos;
                });
                let sortedPositions = positions?.sort((posA: Position | any, posB: Position | any) => (calcTotalProfitLoss(posB, posB?.stock) as number) - (calcTotalProfitLoss(posA, posA?.stock) as number));
                setAlpacaPositions(sortedPositions);
                setStockPositions(sortedPositions);
                setLoading(false);
                console.log(`Alpaca Positions`, sortedPositions);
            });
        } else {
            setLoading(false);
            console.log(`Alpaca Positions`, stockPositions);
        }
    }
  
    const refreshStockOrders = () => {
        if (getRealStocks) {
            let apiServerRoute = apiRoutes?.stocks?.routes?.orders;
            getAPIServerData(apiServerRoute)?.then((alpaca_orders: Order[]) => {
                let orders = alpaca_orders?.map((p: Order) => new Order(p));
                setStockOrders(orders);
                setLoading(false);
                console.log(`Alpaca Orders`, orders);
            });
        } else {
            setLoading(false);
            console.log(`Alpaca Orders`, stockOrders);
        }
    }

    const postGetRobinhood = (robinhoodAccounts: any[] = robinhood) => {
        let positionsObj = {};
        // let token = user?.z_token_robinhood;
        let holdings = robinhoodAccounts?.flatMap(acc => acc?.holdings);
        let positions: Position[] = robinhoodAccounts?.flatMap(acc => acc?.positions)?.sort((a, b) => b?.totalProfitLoss - a?.totalProfitLoss);

        let alPositions: Position[] = alpacaPositions?.map((alp: Position) => {
            let stock: Stock = stocks?.find((s: Stock) => s?.symbol == alp?.symbol);
            let updAlp: Position = new Position({ ...alp, stock, });
            let copy = new Position({ ...updAlp });
            updAlp.merged = [copy];
            return updAlp;
        });

        let positionsCopy = [ ...positions, ...alPositions ];

        positions?.forEach(p => {
            let aKey = RobinhoodAccountTypes.alpaca;
            let iKey = RobinhoodAccountTypes.individual;
            let tKey = RobinhoodAccountTypes.ira_traditional;
            let stock: Stock = stocks?.find((s: Stock) => s?.symbol == p?.symbol);
            let matchPs = positionsCopy?.filter(pos => pos?.symbol == p?.symbol);
            let aPos = matchPs?.find(pos => pos?.account_type == aKey) ?? null;
            let iPos = matchPs?.find(pos => pos?.account_type == iKey) ?? null;
            let tPos = matchPs?.find(pos => pos?.account_type == tKey) ?? null;
            let merged = [aPos, iPos, tPos]?.filter(Boolean)?.map(ps => ({ ...ps, stock }))?.sort((a: any, b: any) => b?.totalProfitLoss - a?.totalProfitLoss);
            p.merged = merged;
            p.loaded = merged?.length > 0;
            Object.assign(positionsObj, { [p?.symbol]: p });
        });

        let positionsBySymbol = Object.values(positionsObj);
        let mergedPositionsUnique = positionsBySymbol?.length > 0 ? (
            positionsBySymbol?.sort((a: any, b: any) => b?.merged?.[0]?.totalProfitLoss - a?.merged?.[0]?.totalProfitLoss)
        ) : positions;

        setStockPositions(mergedPositionsUnique);
        setLoading(false);
        setloaded(true);

        let validRobinHoodData = Array.isArray(holdings) && Array.isArray(mergedPositionsUnique) && Array.isArray(robinhoodAccounts);
        let validRobinHoodDataFilled = validRobinHoodData && (holdings?.length > 0 && mergedPositionsUnique?.length > 0 && robinhoodAccounts?.length > 0);
        if (validRobinHoodDataFilled) {
            setRefreshing(false);
        }

        setLastUpdate(new Date()?.toLocaleString());
        
        if (errored == false) {
            console.log(`Robinhood Accounts`, robinhoodAccounts);
            console.log(`Robinhood Holdings`, holdings);
            console.log(`Positions`, mergedPositionsUnique);
        }

        setStocksFullyLoaded(mergedPositionsUnique?.some((p: Position | any) => p?.merged?.length >= 3));
    }

    const onRobinhoodTokenUpdate = (e: any) => {
        if (loading || refreshing || user == null) return;
        let id = e?.target?.id;
        let val = e?.target?.value;
        let socketField = id == `robinhood_socket_token_field`;
        if (val && val?.length > 0) {
            if (socketField) {
                setRobinhoodSocketToken(val);
            } else {
                setRobinhoodToken(val);
            }
        }
    }

    const onRobinhoodTokenSubmit = (e: any) => {
        if (loading || refreshing || user == null) return;
        e?.preventDefault();
        // let id = e?.target?.id;
        // let socketField = id == `robinhood_socket_token_field`;
        // console.log({ e, robinhoodToken, robinhoodSocketToken });
        updateUserInDatabase(user?.id, { z_token_robinhood: robinhoodToken, z_token_robinhood_socket: robinhoodSocketToken });
        toast.warn(`Refreshing...`, { position: `top-right` });
        window?.location?.reload();
    }

    const refreshRobinhood = (token = user?.z_token_robinhood, getRealRobinhood: boolean = true) => {
        if (getRealRobinhood && getRealStocks && (token && token?.length > 0)) {
            setRefreshing(true);
            setRobinhoodToken(token);
            let apiServerRoute = apiRoutes?.stocks?.routes?.robinhood;
            let serverRouteExtension = user != null && token ? `?id=${token}` : ``;
            getAPIServerData(apiServerRoute, serverRouteExtension)?.then((robinhoodAccountsFromAPI: any) => {
                if (Array.isArray(robinhoodAccountsFromAPI)) {
                    let sourcedFromDB = robinhoodAccountsFromAPI?.some(rba => rba?.dataSource == DataSources.database);
                    if (sourcedFromDB) {
                        errorToast(`Please Refresh your Robinhood Authorization Token to get Latest Stocks Data`, {
                            token,
                            serverRouteExtension,
                            message: `Stock Sync Needed`,
                        }, undefined, `warn`);
                    }
                    let modAccs = robinhoodAccountsFromAPI?.map((acc: any) => {
                        let accType = acc?.account_type;
                        let account_type: RobinhoodAccountTypes | string = (RobinhoodAccountTypes as any)[accType];
                        let modPositions = Array.isArray(acc?.positions) && acc?.positions?.length > 0 ? (
                            acc?.positions?.map((p: RobinhoodStockPosition) => {
                                let modPosition = { ...p, account_type };
                                return new RobinhoodStockPosition(modPosition);
                            })
                        ) : [];
                        let updPosiitons = Array.isArray(modPositions) && modPositions?.length > 0 ? (
                            modPositions?.map((mp: RobinhoodStockPosition) => {
                                let modPosition = { ...mp, account_type };
                                let positionModel = new Position(modPosition, getStock(modPosition));
                                positionModel.stock = positionModel?.getStock(stocks);
                                return positionModel;
                            })
                        ) : [];
                        let ac = { ...acc, positions: updPosiitons };
                        return ac;
                    });
                    setRobinhood(modAccs);
                    postGetRobinhood(modAccs);
                } else {
                    let { message: error } = robinhoodAccountsFromAPI;
                    let checkTokenMsg = `Check Authorization Token`;
                    let errorMessage = `Error on GET Robinhood Accounts`;
                    errorToast(errorMessage + `, ${checkTokenMsg}`, error);
                    setErrored(true);
                    postGetRobinhood();
                }
            })?.catch(error => {
                let errorMessage = `Error on GET Robinhood Accounts`;
                errorToast(errorMessage, error);
                setErrored(true);
                postGetRobinhood();
            });
        } else postGetRobinhood();
    }

    useEffect(() => {
        refreshStocksAccount();
        refreshStockPositions();
        refreshStockOrders();
    }, [])

    // useEffect(() => {
    //     setRobinhoodToken(user?.z_token_robinhood);
    //     setRobinhoodSocketToken(user?.z_token_robinhood_socket);
    // }, [user])

    useEffect(() => {
        let canRefresh = alpacaPositions?.length > 0;
        let recentlyUpdated = withinXSeconds(lastUpdate, 4);
        let shouldRefresh = !recentlyUpdated || !loaded;
        if (shouldRefresh) {
            canRefresh = user != null && user?.email && errored == false;
            if (canRefresh) {
                setRobinhoodToken(user?.z_token_robinhood);
                setRobinhoodSocketToken(user?.z_token_robinhood_socket);
                refreshRobinhood();
            }
        }
    }, [alpacaPositions?.length, user?.z_token_robinhood, errored, user?.z_token_robinhood_socket])

    return (
        <div className={`stocksContainer w95 ${className}`}>
            {/* {(user == null && loading || !stocksFullyLoaded) ? <Loader height={250} label={`Stocks Loading`} /> : <> */}
            {(user == null && loading) ? <Loader height={250} label={`Stocks Loading`} /> : <>

                {loading == false ? (
                    user == null ? <>
                        <div className={`stocksSignIn`}>
                            <AuthForm style={{ width: `100%` }} type={`Stocks`} extensionText={`To View Portfolio`} />
                        </div>
                    </> : <></>
                ) : <></>}

                {/* {(stocksFullyLoaded && ((user != null && !loading) && stocks?.length > 0)) && <> */}
                {(((user != null && !loading) && stocks?.length > 0)) && <>
                    <div className={`customPageTop mh40 flex alignCenter gap5 spaceBetween w100 relative`} style={{ top: -10 }}>
                        <Logo label={`Stocks`} style={{ marginRight: 5 }} />
                        {user != null && <>
                            {realtime == true && (
                                Object.values(RobinhoodAccountTypes)?.map((rba: RobinhoodAccountTypes, rbi: number) => (
                                    <button 
                                        key={rbi}
                                        className={`br4 mh40 mw180 ${!robinhoodAccountTypes?.includes(rba) ? `activeButton` : `inactiveButton`}`} 
                                        onClick={(e: any) => setRobinhoodAccountTypes((prevTypes: RobinhoodAccountTypes[]) => {
                                            return robinhoodAccountTypes?.includes(rba) ? prevTypes?.filter((pt: RobinhoodAccountTypes) => pt != rba) : [ ...prevTypes, rba ];
                                        })} 
                                    >
                                        {rba}
                                    </button>
                                ))
                            )}
                            <form className={`fieldGroup mh40 flex alignCenter gap5 spaceBetween robinhoodTokenFieldGroup`} onInput={(e) => onRobinhoodTokenUpdate(e)} onSubmit={(e) => onRobinhoodTokenSubmit(e)}>
                                <input 
                                    required
                                    type={`text`} 
                                    name={`robinhood_socket_token`}
                                    ref={robinhoodSocketTokenField} 
                                    id={`robinhood_socket_token_field`}
                                    placeholder={`Robinhood Socket Token`} 
                                    defaultValue={user?.z_token_robinhood_socket} 
                                    disabled={refreshing == true || user == null} 
                                    className={`b0 br4 mh40 robinhoodTokenFieldInput`} 
                                    style={{ top: 0, width: `84%`, marginLeft: `auto` }} 
                                />
                                <input 
                                    required
                                    type={`text`} 
                                    name={`robinhood_token`}
                                    ref={robinhoodTokenField} 
                                    id={`robinhood_token_field`}
                                    placeholder={`Robinhood Token`} 
                                    defaultValue={user?.z_token_robinhood} 
                                    disabled={refreshing == true || user == null} 
                                    className={`b0 br4 mh40 robinhoodTokenFieldInput`} 
                                    style={{ top: 0, width: `84%`, marginLeft: `auto` }} 
                                />
                                <button 
                                    type={`submit`} 
                                    disabled={(!robinhoodToken || !robinhoodSocketToken) || refreshing == true || user == null} 
                                    className={`br4 mh40 mw180 ${((!robinhoodToken || !robinhoodSocketToken) || refreshing == true || user == null) ? `disabled` : ``}`} 
                                >
                                    {(refreshing == true || user == null) ? `Refreshing` : `Refresh`} Stocks
                                </button>
                            </form>
                        </>}
                    </div>
                    {/* <StockSearch stcks={stocks} className={`mainStockSearch`} {...{loading}} /> */}
                </>}

                {loading == false ? (
                    user == null ? <>
                        <Slider className={`stocksDashboardSlider stocksComponentSlider`} showButtons={width > constants?.breakpoints?.tabletSmall}>
                            <SwiperSlide>
                                <div className={`stocksDashboard`}>
                                    {/* Stocks */}
                                </div>
                            </SwiperSlide>
                        </Slider>
                    </> : <>
                        <Slider className={`stocksComponentSlider`} showButtons={width > constants?.breakpoints?.tabletSmall}>
                            <SwiperSlide>
                                <StockPositions {...{getStock}} />
                            </SwiperSlide>
                            <SwiperSlide>
                                <StockAccount />
                            </SwiperSlide>
                            <SwiperSlide>
                                <StockOrders {...{getStock}} />
                            </SwiperSlide>
                        </Slider>
                    </>
                ) : <></>}

            </>}
        </div>
    )
}