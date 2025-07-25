'use client';

import './stocks-scroll.scss';

import Stock from '../stock/stock';
import Slider from '../../slider/slider';
import Loader from '../../loaders/loader';
import { SwiperSlide } from 'swiper/react';
import { State } from '../../container/container';
import { useContext, useEffect, useState } from 'react';
import { getAPIServerData } from '@/shared/scripts/constants';

export default function StocksScroll({ className = `stocksScrollComponent` }) {
    const { stocks, setStocks } = useContext<any>(State);

    const [loading, setLoading] = useState(true);

    const refreshStocks = () => {
        getAPIServerData()?.then(stocksData => {
            setStocks(stocksData);
            setLoading(false);
            console.log(`Stocks`, stocksData);
        });
    }

    useEffect(() => {
        refreshStocks();
    }, [])

    return (
        <div className={`stocksScrollContainer w100 h100 ${className}`}>
            {loading ? <Loader height={35} label={`Stocks Loading`} className={`topBarLoader`} /> : <>
                <Slider className={`stocksCarousel`} autoplay slidesPerView={12} spaceBetween={15} showButtons={false}>
                    {stocks?.map((stock: any, stockIndex: number) => {
                        let { symbol, price } = stock;
                        return (
                            <SwiperSlide key={stockIndex}>
                                <Stock symbol={symbol} price={price} />
                            </SwiperSlide>
                        )
                    })}
                </Slider>
            </>}
        </div>
    )
}