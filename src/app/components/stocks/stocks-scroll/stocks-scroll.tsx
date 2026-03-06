'use client';

import './stocks-scroll.scss';

import Stock from '../stock/stock';
import Slider from '../../slider/slider';
import Loader from '../../loaders/loader';
import { SwiperSlide } from 'swiper/react';
import { StateGlobals } from '@/shared/global-context';
import { useContext, useEffect, useState } from 'react';
import { Stock as StockModel } from '@/shared/types/models/stocks/Stock';
import { getAPIServerData, getRealStocks } from '@/shared/scripts/constants';
import { popularStocks } from '@/shared/server/database/samples/stocks/stocks';

export default function StocksScroll({ className = `stocksScrollComponent` }) {
    const { stocks, setStocks } = useContext<any>(StateGlobals);

    const [loading, setLoading] = useState(true);

    const refreshStocks = (getReal = false) => {
        if (getReal && getRealStocks) {
            getAPIServerData()?.then(stocksData => {
                let stocksToSet = stocksData?.map((s: any) => new StockModel(s));
                setStocks(stocksToSet);
                setLoading(false);
                console.log(`Stocks`, stocksToSet);
            });
        } else {
            // let apiServerRoute = apiRoutes?.stocks?.routes?.robinhoodStocks;
            // getAPIServerData(apiServerRoute)?.then((stks: any) => {
            //     let modStks = stks?.map((s: any) => new StockModel(s));
                setLoading(false);
                console.log(`Stocks`, {
                    stocks,
                    popularStocks,
                });
            // })
        }
    }

    useEffect(() => {
        refreshStocks();
    }, [])

    return (
        <div className={`stocksScrollContainer w100 h100 ${className}`}>
            {(loading || stocks?.length == 0 || !stocks || !Array.isArray(stocks)) ? <Loader height={35} label={`Stocks Loading`} className={`topBarLoader`} /> : <>
                <Slider className={`stocksCarousel`} autoplay slidesPerView={12} spaceBetween={15} showButtons={false}>
                    {stocks?.map((stock: any, stockIndex: number) => (
                        <SwiperSlide key={stockIndex} className={`stockSlide`}>
                            <Stock {...stock} />
                        </SwiperSlide>
                    ))}
                </Slider>
            </>}
        </div>
    )
}