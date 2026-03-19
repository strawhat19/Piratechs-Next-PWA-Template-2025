'use client';

import './stocks.scss';

import Slider from '../slider/slider';
import Loader from '../loaders/loader';
import { SwiperSlide } from 'swiper/react';
import StockSearch from './stock-search/stock-search';
import StockOrders from './stock-orders/stock-orders';
import { StateGlobals } from '@/shared/global-context';
import { useContext, useEffect, useState } from 'react';
import StockAccount from './stock-account/stock-account';
import { Stock } from '@/shared/types/models/stocks/Stock';
import { Order } from '@/shared/types/models/stocks/Order';
import { RobinhoodAccountTypes } from '@/shared/types/types';
import StockPositions from './stock-positions/stock-positions';
import { Position } from '@/shared/types/models/stocks/Position';
import AuthForm from '../authentication/forms/auth-form/auth-form';
import { RobinhoodStockPosition } from '@/shared/types/models/stocks/robinhood/RobinhoodStockPosition';
import { apiRoutes, constants, errorToast, getAPIServerData, getRealStocks } from '@/shared/scripts/constants';

export const stockTableAlignmentCenter = false;

export const positionProfitLoss = (position: any) => position?.current_price - position?.avg_entry_price;

export default function Stocks({ className = `stocksComponent` }) {
    const { user, width, stocks, stocksAcc, stockPositions, setStockPositions, setStocksAcc, stockOrders, setStockOrders, robinhood, setRobinhood } = useContext<any>(StateGlobals);

    const [loading, setLoading] = useState(true);

    const getStock = (stk: Stock | Position | any) => {
        let symbol = stk?.symbol;
        let stck = stocks?.length > 0 ? stocks?.find((s: any) => s?.symbol == symbol) : stk;
        return stck;
    }

    const refreshStocksAccount = () => {
        if (getRealStocks) {
            let apiServerRoute = apiRoutes?.stocks?.routes?.account;
            getAPIServerData(apiServerRoute)?.then(acc => {
                setStocksAcc(acc);
                setLoading(false);
                console.log(`Account`, acc);
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
        let holdings = robinhoodAccounts?.flatMap(acc => acc?.holdings);
        let positions: Position[] = robinhoodAccounts?.flatMap(acc => acc?.positions)?.sort((a, b) => b?.totalProfitLoss - a?.totalProfitLoss);
        setStockPositions(positions);
        console.log(`Robinhood Holdings`, holdings);
        console.log(`Robinhood Positions`, positions);
        console.log(`Robinhood Accounts`, robinhoodAccounts);
        setLoading(false);
    }

    const refreshRobinhood = (getRealRobinhood = true) => {
        if (getRealRobinhood && getRealStocks) {
            let apiServerRoute = apiRoutes?.stocks?.routes?.robinhood;
            let serverRouteExtension = user != null ? `?id=${user?.robinhoodToken}` : ``;
            getAPIServerData(apiServerRoute, serverRouteExtension)?.then((robinhoodAccounts: any) => {
                if (Array.isArray(robinhoodAccounts)) {
                    let modAccs = robinhoodAccounts?.map((acc: any) => {
                        let account_type: RobinhoodAccountTypes | string = (RobinhoodAccountTypes as any)[acc?.account_type];
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
                    let { message: error } = robinhoodAccounts;
                    let checkTokenMsg = `Check Authorization Token`;
                    let errorMessage = `Error on GET Robinhood Accounts`;
                    errorToast(errorMessage + `, ${checkTokenMsg}`, error);
                    postGetRobinhood();
                }
            })?.catch(error => {
                let errorMessage = `Error on GET Robinhood Accounts`;
                errorToast(errorMessage, error);
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
        if (user != null && user?.email) {
            refreshRobinhood();
        }
    }, [user, stocks])

    return (
        <div className={`stocksContainer w95 ${className}`}>
            {(user == null && loading) ? <Loader height={250} label={`Stocks Loading`} /> : <>

                {loading == false ? (
                    user == null ? <>
                        <div className={`stocksSignIn`}>
                            <AuthForm style={{ width: `100%` }} extensionText={`To View Personalized Stocks Data`} />
                        </div>
                    </> : <></>
                ) : <></>}

                {stocks?.length > 0 && (
                    <StockSearch stcks={stocks} className={`mainStockSearch`} {...{loading}} />
                )}

                {loading == false ? (
                    user == null ? <>
                        <div className={`stocksDashboard`}>
                            {/* Stocks */}
                        </div>
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