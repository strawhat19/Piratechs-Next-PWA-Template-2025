'use client';

import './stocks-scroll.scss';

import Stock from '../stock/stock';
import Slider from '../../slider/slider';
import Loader from '../../loaders/loader';
import { SwiperSlide } from 'swiper/react';
import { StateGlobals } from '@/shared/global-context';
import { useContext, useEffect, useState } from 'react';
import { getAPIServerData, getRealStocks } from '@/shared/scripts/constants';

export default function StocksScroll({ className = `stocksScrollComponent` }) {
    const { stocks, setStocks } = useContext<any>(StateGlobals);

    const [loading, setLoading] = useState(true);

    const refreshStocks = () => {
        if (getRealStocks) {
            getAPIServerData()?.then(stocksData => {
                setStocks(stocksData);
                setLoading(false);
                console.log(`Stocks`, stocksData);
            });
        } else {
            setLoading(false);
            console.log(`Stocks`, stocks);
        }
    }

    useEffect(() => {
        refreshStocks();
    }, [])

    return (
        <div className={`stocksScrollContainer w100 h100 ${className}`}>
            {(loading || stocks?.length == 0) ? <Loader height={35} label={`Stocks Loading`} className={`topBarLoader`} /> : <>
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