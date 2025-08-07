'use client';

import './stocks.scss';

import Slider from '../slider/slider';
import Loader from '../loaders/loader';
import { SwiperSlide } from 'swiper/react';
import { State } from '../container/container';
import StockSearch from './stock-search/stock-search';
import StockOrders from './stock-orders/stock-orders';
import { useContext, useEffect, useState } from 'react';
import StockAccount from './stock-account/stock-account';
import StockPositions from './stock-positions/stock-positions';
import { apiRoutes, constants, getAPIServerData, getRealStocks } from '@/shared/scripts/constants';

export default function Stocks({ className = `stocksComponent` }) {
    const { width, stocks, stocksAcc, stockPositions, setStockPositions, setStocksAcc, stockOrders, setStockOrders } = useContext<any>(State);

    const [loading, setLoading] = useState(true);

    const getStock = (symbol: string) => {
        let stock = stocks?.find((s: any) => s?.symbol == symbol);
        return stock;
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
            getAPIServerData(apiServerRoute)?.then(poss => {
                setStockPositions(poss);
                setLoading(false);
                console.log(`Positions`, poss);
            });
        } else {
            setLoading(false);
            console.log(`Positions`, stockPositions);
        }
    }
  
    const refreshStockOrders = () => {
        if (getRealStocks) {
            let apiServerRoute = apiRoutes?.stocks?.routes?.orders;
            getAPIServerData(apiServerRoute)?.then(ordrs => {
                setStockOrders(ordrs);
                setLoading(false);
                console.log(`Orders`, ordrs);
            });
        } else {
            setLoading(false);
            console.log(`Orders`, stockOrders);
        }
    }

    useEffect(() => {
        refreshStocksAccount();
        refreshStockPositions();
        refreshStockOrders();
    }, [])

    return (
        <div className={`stocksContainer w75 ${className}`}>

            <StockSearch {...{loading}} />

            {loading ? <Loader height={250} label={`Account Loading`} /> : <>

                <Slider showButtons={width > constants?.breakpoints?.mobile}>
                    <SwiperSlide>
                        <StockPositions {...{getStock}} />
                    </SwiperSlide>
                    <SwiperSlide>
                        <StockOrders {...{getStock}} />
                    </SwiperSlide>
                    <SwiperSlide>
                        <StockAccount />
                    </SwiperSlide>
                </Slider>

            </>}

        </div>
    )
}