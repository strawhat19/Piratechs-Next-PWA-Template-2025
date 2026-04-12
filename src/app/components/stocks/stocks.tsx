'use client';

import './stocks.scss';

import Logo from '../logo/logo';
import Slider from '../slider/slider';
import Loader from '../loaders/loader';
import { SwiperSlide } from 'swiper/react';
import StockSearch from './stock-search/stock-search';
import StockOrders from './stock-orders/stock-orders';
import { StateGlobals } from '@/shared/global-context';
import StockAccount from './stock-account/stock-account';
import { Stock } from '@/shared/types/models/stocks/Stock';
import { Order } from '@/shared/types/models/stocks/Order';
import StockPositions from './stock-positions/stock-positions';
import { useContext, useEffect, useRef, useState } from 'react';
import { updateUserInDatabase } from '@/shared/server/firebase';
import { Position } from '@/shared/types/models/stocks/Position';
import AuthForm from '../authentication/forms/auth-form/auth-form';
import { DataSources, RobinhoodAccountTypes } from '@/shared/types/types';
import { RobinhoodStockPosition } from '@/shared/types/models/stocks/robinhood/RobinhoodStockPosition';
import { apiRoutes, constants, errorToast, getAPIServerData, getRealStocks, withinXSeconds } from '@/shared/scripts/constants';

export const stockTableAlignmentCenter = false;

export const positionProfitLoss = (position: any) => position?.current_price - position?.avg_entry_price;

export default function Stocks({ className = `stocksComponent` }) {
    const { user, width, stocks, stocksAcc, stockPositions, setStockPositions, setStocksAcc, stockOrders, setStockOrders, robinhood, setRobinhood } = useContext<any>(StateGlobals);

    let robinhoodTokenField = useRef(null);

    const [loading, setLoading] = useState(true);
    const [errored, setErrored] = useState(false);
    const [refreshing, setRefreshing] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date()?.toLocaleString());
    const [robinhoodToken, setRobinhoodToken] = useState(user == null ? `` : user?.z_token_robinhood);

    const getStock = (stk: Stock | Position | any) => {
        let symbol = stk?.symbol;
        let stck = stocks?.length > 0 ? stocks?.find((s: any) => s?.symbol == symbol) : stk;
        return stck;
    }

    const refreshStocksAccount = () => {
        if (getRealStocks) {
            let apiServerRoute = apiRoutes?.stocks?.routes?.account;
            getAPIServerData(apiServerRoute)?.then(acc => {
                let account = { ...acc, dataSource: DataSources.api };
                setStocksAcc(account);
                setLoading(false);
                console.log(`Account`, account);
            });
        } else {
            setLoading(false);
            console.log(`Account`, stocksAcc);
        }
    }
    
    const refreshStockPositions = () => {
        if (getRealStocks) {
            let apiServerRoute = apiRoutes?.stocks?.routes?.positions;
            getAPIServerData(apiServerRoute)?.then((alpaca_positions: Position[]) => {
                let positions = alpaca_positions?.map((p: Position) => new Position({ ...p, stock: getStock(p) }));
                let sortedPositions = positions?.sort((posA: Position, posB: Position) => positionProfitLoss(posB) - positionProfitLoss(posA));
                setStockPositions(sortedPositions);
                setLoading(false);
                console.log(`Positions`, sortedPositions);
            });
        } else {
            setLoading(false);
            console.log(`Positions`, stockPositions);
        }
    }
  
    const refreshStockOrders = () => {
        if (getRealStocks) {
            let apiServerRoute = apiRoutes?.stocks?.routes?.orders;
            getAPIServerData(apiServerRoute)?.then((alpaca_orders: Order[]) => {
                let orders = alpaca_orders?.map((p: Order) => new Order(p));
                setStockOrders(orders);
                setLoading(false);
                console.log(`Orders`, orders);
            });
        } else {
            setLoading(false);
            console.log(`Orders`, stockOrders);
        }
    }

    const postGetRobinhood = (robinhoodAccounts: any[] = robinhood) => {
        let token = user?.z_token_robinhood;
        let holdings = robinhoodAccounts?.flatMap(acc => acc?.holdings);
        let positions: Position[] = robinhoodAccounts?.flatMap(acc => acc?.positions)?.sort((a, b) => b?.totalProfitLoss - a?.totalProfitLoss);
        setStockPositions(positions);
        setLoading(false);
        setRefreshing(false);
        let validRobinHoodData = Array.isArray(holdings) && Array.isArray(positions) && Array.isArray(robinhoodAccounts);
        let validRobinHoodDataFilled = validRobinHoodData && (holdings?.length > 0 && positions?.length > 0 && robinhoodAccounts?.length > 0);
        // let validRobinHoodDataFilledFromAPI = validRobinHoodDataFilled && (
        //     holdings?.some(a => a?.dataSource == DataSources.api) 
        //     && positions?.some(a => a?.dataSource == DataSources.api) 
        //     && robinhoodAccounts?.some(a => a?.dataSource == DataSources.api)
        // );
        if (validRobinHoodDataFilled) {
            setRefreshing(false);
        }
        if (errored == false) {
            console.log(`Robinhood Holdings`, holdings);
            console.log(`Robinhood Positions`, positions);
            console.log(`Robinhood Accounts`, robinhoodAccounts);
        }
        console.log(`Refresh Robinhood Finish`, {
            token,
            lastUpdate,
            robinhoodToken,
        });
    }

    const onRobinhoodTokenUpdate = (e: any) => {
        if (loading || refreshing || user == null || robinhoodToken?.length < 900) return;
        let val = e?.target?.value;
        if (val && val?.length > 0) {
            setRobinhoodToken(val);
        }
    }

    const onRobinhoodTokenSubmit = (e: any) => {
        if (loading || refreshing || user == null || robinhoodToken?.length < 900) return;
        e?.preventDefault();
        updateUserInDatabase(user?.id, { z_token_robinhood: robinhoodToken });
    }

    const refreshRobinhood = (token = user?.z_token_robinhood, getRealRobinhood: boolean = true) => {
        if (getRealRobinhood && getRealStocks && (token && token?.length > 0)) {
            setRefreshing(true);
            setRobinhoodToken(token);
            console.log(`Refresh Robinhood`, {
                token,
                lastUpdate,
                robinhoodToken,
            });
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

    useEffect(() => {
        let recentlyUpdated = withinXSeconds(lastUpdate, 4);
        if (!recentlyUpdated) {
            if (user != null && user?.email && errored == false) {
                refreshRobinhood();
                setLastUpdate(new Date()?.toLocaleString());
            }
        }
    }, [user?.z_token_robinhood, stocks, errored])

    return (
        <div className={`stocksContainer w95 ${className}`}>
            {(user == null && loading) ? <Loader height={250} label={`Stocks Loading`} /> : <>

                {loading == false ? (
                    user == null ? <>
                        <div className={`stocksSignIn`}>
                            <AuthForm style={{ width: `100%` }} extensionText={`To View Portfolio`} />
                        </div>
                    </> : <></>
                ) : <></>}

                {stocks?.length > 0 && <>
                    <div className={`customPageTop mh40 flex alignCenter gap5 spaceBetween w100 relative`} style={{ top: -10 }}>
                        <Logo label={`Stocks`} />
                        {user != null && (
                            <form className={`fieldGroup mh40 flex alignCenter gap5 spaceBetween robinhoodTokenFieldGroup`} onInput={(e) => onRobinhoodTokenUpdate(e)} onSubmit={(e) => onRobinhoodTokenSubmit(e)}>
                                <input 
                                    required
                                    type={`text`} 
                                    name={`robinhood_token`}
                                    className={`b0 br4 mh40`} 
                                    ref={robinhoodTokenField} 
                                    id={`robinhood_token_field`}
                                    placeholder={`Robinhood Token`} 
                                    defaultValue={user?.z_token_robinhood} 
                                    disabled={loading || refreshing || user == null} 
                                    style={{ top: 0, width: `84%`, marginLeft: `auto` }} 
                                />
                                <button 
                                    type={`submit`} 
                                    disabled={loading || refreshing || user == null || user?.z_token_robinhood?.length < 900} 
                                    className={`br4 mh40 mw180 ${(loading || refreshing || user == null || user?.z_token_robinhood?.length < 900) ? `disabled` : ``}`} 
                                >
                                    {(loading || refreshing || user == null) ? `Refreshing` : `Refresh`} Stocks
                                </button>
                            </form>
                        )}
                    </div>
                    <StockSearch stcks={stocks} className={`mainStockSearch`} {...{loading}} />
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