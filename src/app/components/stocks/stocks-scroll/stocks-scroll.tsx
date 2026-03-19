'use client';

import './stocks-scroll.scss';

import Stock from '../stock/stock';
import Slider from '../../slider/slider';
import Loader from '../../loaders/loader';
import { SwiperSlide } from 'swiper/react';
import { StateGlobals } from '@/shared/global-context';
import { useContext, useEffect, useState } from 'react';
import { Stock as StockModel } from '@/shared/types/models/stocks/Stock';
import { apiRoutes, errorToast, getAPIServerData, getRealStocks } from '@/shared/scripts/constants';

export default function StocksScroll({ className = `stocksScrollComponent` }) {
    const { user, stocks, setStocks } = useContext<any>(StateGlobals);
    const [loading, setLoading] = useState(true);
    // const socketRef = useRef<WebSocket | null>(null);

    const finishStocksLoading = (stocksFromAPI: any[] = []) => {
        let hasNewStocks = stocksFromAPI && stocksFromAPI?.length > 0;
        let stocksToSet = hasNewStocks ? stocksFromAPI : stocks;
        setStocks(stocksToSet);
        setLoading(false);
        console.log(`Stocks`, {
            stocks,
            stocksFromAPI,
        });
    }

    const refreshStocks = (getReal = false, getRobinhood = true) => {
        if (getReal && getRealStocks) {
            getAPIServerData()?.then(stocksData => {
                let stocksToSet = stocksData?.map((s: any) => new StockModel(s));
                setStocks(stocksToSet);
                setLoading(false);
                console.log(`Stocks`, stocksToSet);
            });
        } else {
            if (getRobinhood) {
                let apiServerRoute = apiRoutes?.stocks?.routes?.robinhoodStocks;
                let serverRouteExtension = user != null && user?.z_token_robinhood ? `?id=${user?.z_token_robinhood}` : ``;
                getAPIServerData(apiServerRoute, serverRouteExtension)?.then((robinhoodStocks: any) => {
                    if (Array.isArray(robinhoodStocks) && robinhoodStocks?.length > 0) {
                        let modStks = robinhoodStocks?.map((s: any) => new StockModel(s));
                        setStocks(modStks);
                        finishStocksLoading(modStks);
                    } else {
                        // let checkTokenMsg = `Check Authorization Token`;
                        // let errorMessage = `Error on GET Robinhood Stocks`;
                        // let defaultError = `Robinhood Error, ${checkTokenMsg}`;
                        // errorToast(errorMessage + `, ${checkTokenMsg}`, defaultError);
                        finishStocksLoading();
                    }
                })?.catch(error => {
                    let errorMessage = `Error on GET Robinhood Stocks`;
                    errorToast(errorMessage, error);
                    finishStocksLoading();
                });
            } else finishStocksLoading();
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

// Legacy Socket
// useEffect(() => {
//     if (!stocks?.length) return;

//     const ws = new WebSocket(`wss://api.robinhood.com/marketdata/streaming/legend/v2/`);
//     socketRef.current = ws;

//     ws.onopen = () => {
//         console.log(`Robinhood WS connected`);

//         // Replace this with the actual message Robinhood expects.
//         // Example only:
//         ws.send(JSON.stringify({
//             type: `subscribe`,
//             symbols: stocks.map((s: any) => s.symbol).filter(Boolean),
//         }));
//     };

//     ws.onmessage = (event) => {
//         try {
//             const data = JSON.parse(event.data);
//             console.log(`Robinhood WS message`, data);

//             // setStocks((prevStocks: any[] = []) => {
//             //     return prevStocks.map((stock: any) => {
//             //         const symbol = stock?.symbol;

//             //         // Adjust these fields to match Robinhood`s real payload
//             //         const update = Array.isArray(data)
//             //             ? data.find((item: any) => item?.symbol === symbol)
//             //             : data?.symbol === symbol
//             //                 ? data
//             //                 : null;

//             //         if (!update) return stock;

//             //         return new StockModel({
//             //             ...stock,
//             //             price: update.price ?? stock.price,
//             //             changes: update.changes ?? stock.changes,
//             //             last: update.last ?? stock.last,
//             //         });
//             //     });
//             // });
//         } catch (error) {
//             console.error(`Failed to parse WS message`, error, event.data);
//         }
//     };

//     ws.onerror = (error) => {
//         console.error(`Robinhood WS error`, error);
//     };

//     ws.onclose = (event) => {
//         console.log(`Robinhood WS closed`, {
//             code: event.code,
//             reason: event.reason,
//             wasClean: event.wasClean,
//         });
//     };

//     return () => {
//         ws.close();
//         socketRef.current = null;
//     };
// }, [stocks?.length]);