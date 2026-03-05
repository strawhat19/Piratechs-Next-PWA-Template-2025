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
import StockPositions from './stock-positions/stock-positions';
import { Position } from '@/shared/types/models/stocks/Position';
import { RobinhoodStockPosition } from '@/shared/types/models/stocks/robinhood/RobinhoodStockPosition';
import { apiRoutes, constants, dev, getAPIServerData, getRealStocks } from '@/shared/scripts/constants';

export const stockTableAlignmentCenter = false;

export const positionProfitLoss = (position: any) => position?.current_price - position?.avg_entry_price;

export default function Stocks({ className = `stocksComponent` }) {
    const { width, stocks, stocksAcc, stockPositions, setStockPositions, setStocksAcc, stockOrders, setStockOrders, robinhood, setRobinhood } = useContext<any>(StateGlobals);

    const [loading, setLoading] = useState(true);

    const getStock = (stk: Stock | any) => {
        let symbol = stk?.symbol;
        let stck = stocks?.length > 0 ? stocks?.find((s: any) => s?.symbol == symbol) : stk;
        return stck;
    }

    const refreshRobinhood = () => {
        if (getRealStocks) {
            let apiServerRoute = apiRoutes?.stocks?.routes?.robinhood;
            getAPIServerData(apiServerRoute)?.then(acc => {
                let modPositions = acc?.positions?.map((p: RobinhoodStockPosition) => new RobinhoodStockPosition(p));
                let updPosiitons = modPositions?.map((mp: RobinhoodStockPosition) => new Position(mp, getStock(mp)));
                let ac = { ...acc, positions: updPosiitons };
                setRobinhood(ac);
                setLoading(false);
                console.log(`Robinhood Account`, acc);
            });
        } else {
            setLoading(false);
            console.log(`Robinhood Account`, robinhood);
        }
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
                let positions = alpaca_positions?.map((p: Position) => new Position(p));
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

    useEffect(() => {
        refreshRobinhood();
        refreshStocksAccount();
        refreshStockPositions();
        refreshStockOrders();
    }, [])

    return (
        <div className={`stocksContainer w95 ${className}`}>
            <StockSearch stcks={stocks} className={`mainStockSearch`} {...{loading}} />
            {loading ? <Loader height={250} label={`Account Loading`} /> : <>
                <Slider className={`stocksComponentSlider`} showButtons={width > constants?.breakpoints?.tabletSmall}>
                    {/* {!dev() && <SwiperSlide>
                        <StockAccount />
                    </SwiperSlide>} */}
                    <SwiperSlide>
                        <StockPositions {...{getStock}} />
                    </SwiperSlide>
                    <SwiperSlide>
                        <StockOrders {...{getStock}} />
                    </SwiperSlide>
                </Slider>
            </>}
        </div>
    )
}