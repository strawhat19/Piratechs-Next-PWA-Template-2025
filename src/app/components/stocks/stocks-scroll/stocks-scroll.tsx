'use client';

import './stocks-scroll.scss';

// import WebSocket from 'ws';
import Stock from '../stock/stock';
import Slider from '../../slider/slider';
import Loader from '../../loaders/loader';
import { SwiperSlide } from 'swiper/react';
import { StateGlobals } from '@/shared/global-context';
import { DataSources, StockAPIs } from '@/shared/types/types';
import { useContext, useEffect, useRef, useState } from 'react';
import { Position } from '@/shared/types/models/stocks/Position';
import { Stock as StockModel } from '@/shared/types/models/stocks/Stock';
import { popularStocks } from '@/shared/server/database/samples/stocks/stocks';
import { apiRoutes, errorToast, getAPIServerData, getRealStocks } from '@/shared/scripts/constants';

const popularStockSymbols = [...Object.keys(popularStocks), `BRK.A`, `BRK.B`];
const uniquePopularStockSymbols = [ ...new Set(popularStockSymbols) ];

export default function StocksScroll({ className = `stocksScrollComponent` }) {
    const { user, stocks, setStocks, stockPositions } = useContext<any>(StateGlobals);
    
    const [updates, setUpdates] = useState(0);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef<WebSocket | null>(null);

    const onSocketStockDataUpdate = (channel: number, channelName: string, data: any[]) => {
        if (data && Array.isArray(data) && data?.length > 0) {
            if (!Array.isArray(data) || !data.length) return;
            let updatedStocks: StockModel[] = [];
            let dataSymbols = data?.map(d => d?.eventSymbol?.toUpperCase());
            if (!stocks || !stocks?.length || stocks?.length == 0) return;
            if (!stockPositions || !stockPositions?.length || stockPositions?.length == 0) return;
            
            let firstUpdate = updates == 0;
            let robinHoodStockPositions = stockPositions?.some((p: Position) => p?.api == StockAPIs.Robinhood && p?.dataSource == DataSources.robinhood);

            if (firstUpdate || robinHoodStockPositions) {
                setStocks((prevStocks: StockModel[]) => {
                    let refreshedStocks = prevStocks.map((stock: StockModel) => {
                        if (dataSymbols?.includes(stock?.symbol?.toUpperCase())) {
                            const next = stock;
                            next.updateFromLiveEventsArray(data);
                            updatedStocks?.push(next);
                            return next;
                        } else return stock;
                    });
                    // console.log(`Refreshed Stocks`, {
                    //     stockPositions,
                    //     refreshedStocks,
                    // });
                    return refreshedStocks;
                });
                setUpdates(prevUpdates => prevUpdates + 1);
            }

            // updatedStocks?.forEach(s => {
            //     setStockPositions((prevPositions: Position[]) => {
            //         return prevPositions.map((position: Position) => {
            //             if (dataSymbols?.includes(position?.symbol?.toUpperCase())) {
            //                 const nextPos = new Position(position);
            //                 nextPos.updateFromPrices(Number(s?.price));
            //                 return nextPos;
            //             } else return position;
            //         });
            //     });
            // })
        }
    }

    const finishStocksLoading = (stocksFromAPI: any[] = []) => {
        // let token = user?.z_token_robinhood;
        let hasNewStocks = stocksFromAPI && stocksFromAPI?.length > 0;
        let stocksToSet = hasNewStocks ? stocksFromAPI : stocks;
        setStocks(stocksToSet);
        setLoading(false);
        if (hasNewStocks) {
            console.log(`Robinhood Stocks`, stocksFromAPI);
        }
    }

    const refreshStocks = (getReal = false, getRobinhood = true, token = user?.z_token_robinhood) => {
        if (getReal && getRealStocks) {
            getAPIServerData()?.then(stocksData => {
                let stocksToSet = stocksData?.map((s: any) => new StockModel(s));
                setStocks(stocksToSet);
                setLoading(false);
                console.log(`Stocks`, stocksToSet);
            });
        } else {
            if (getRobinhood && !loading && token?.length > 0) {
                let apiServerRoute = apiRoutes?.stocks?.routes?.robinhoodStocks;
                let serverRouteExtension = user != null && token ? `?id=${token}` : ``;
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
    }, [user?.z_token_robinhood]);

    useEffect(() => {
        if (!user?.z_token_robinhood) return;
        if (!user?.z_token_robinhood_socket) return;
        if (!uniquePopularStockSymbols?.length) return;
        if (!stocks || !stocks?.length || stocks?.length == 0) return;

        const channelsRequested: number[] = [];
        const channelsSubscribed: number[] = [];

        const token = user?.z_token_robinhood;
        const socket_token = user?.z_token_robinhood_socket;
        const symbols = uniquePopularStockSymbols.filter(Boolean);

        const ws = new WebSocket(`wss://api.robinhood.com/marketdata/streaming/legend/v2/`, [`bearer`, token]);

        socketRef.current = ws;

        let keepAliveInterval: ReturnType<typeof setInterval> | null = null;

        let didAuth = false;

        const sendJson = (payload: any) => { ws.send(JSON.stringify(payload)); };
        const authenticate = () => { if (!didAuth && ws.readyState === WebSocket.OPEN) sendJson({ type: `AUTH`, channel: 0, token: socket_token }); };

        const startKeepAlive = () => {
            if (keepAliveInterval) return;
            keepAliveInterval = setInterval(() => { if (ws.readyState === WebSocket.OPEN) sendJson({ type: `KEEPALIVE`, channel: 0, }); }, 30_000);
        };

        ws.onopen = () => {
            sendJson({ channel: 0, type: `SETUP`, keepaliveTimeout: 60, acceptKeepaliveTimeout: 60, version: `0.1-DXF-JS/0.5.1`, });
        };

        // const otherChannelsToRequestObj = {
            // 3: { channel: 3, name: `TradeETH`, resets: true, add: symbols.map((symbol: string) => ({ type: `TradeETH`, symbol, })), acceptEventFields: { TradeETH: [ `price`, `dayVolume`, `eventSymbol`, `eventType`, `time`, ], } },
            // 5: { channel: 5, name: `Candle`, add: symbols.map((symbol: string) => ({ type: `Candle`, symbol, })), acceptEventFields: { Candle: [ `close`, `eventFlags`, `eventSymbol`, `eventType`, `eventTime`, `high`, `impVolatility`, `low`, `open`, `openInterest`, `time`, `volume`, `vwap`, `sequence`, `count` ], } },
        // };

        const channelsToRequestObj = {
            1: { channel: 1, name: `Trade`, add: symbols.map((symbol: string) => ({ type: `Trade`, symbol, })), acceptEventFields: { 
                Trade: [ `price`, `size`, `dayVolume`, `dayTurnover`, `tickDirection`, `extendedTradingHours`, `eventSymbol`, `eventType`, `time`, `sequence`, ], 
            } },
            7: { channel: 7, name: `Quote`, resets: true, add: symbols.map((symbol: string) => ({ type: `Quote`, symbol, })), acceptEventFields: { 
                Quote: [ `askPrice`, `askSize`, `askTime`, `bidPrice`, `bidSize`, `bidTime`, `askExchangeCode`, `bidExchangeCode`, `eventSymbol`, `eventType`, `sequence`, `timeNanoPart`, ], 
            } },
            11: { channel: 11, name: `Summary`, resets: true, add: symbols.map((symbol: string) => ({ type: `Summary`, symbol, })), acceptEventFields: { 
                Summary: [ `dayClosePrice`, `dayOpenPrice`, `dayHighPrice`, `dayLowPrice`, `dayVolume`, `dayTurnover`, `prevDayClosePrice`, `prevDayVolume`, `openInterest`, `eventSymbol`, `eventType`, ], 
            } },
            13: { channel: 13, name: `Profile`, resets: true, add: symbols.map((symbol: string) => ({ type: `Profile`, symbol, })), acceptEventFields: { 
                Profile: [  `eventSymbol`, `eventType`, `description`, `shortSaleRestriction`, `tradingStatus`, `statusReason`, `haltStartTime`, `haltEndTime`, `high52WeekPrice`, `low52WeekPrice`, `shares`, `beta`, `earningsPerShare`, `dividendFrequency`, `exDividendAmount`, `exDividendDayId`, ], 
            } },
        };

        const channelsToRequest = Object.values(channelsToRequestObj);

        ws.onmessage = (event: MessageEvent) => {
            let data: any = event?.data;

            try {
                data = JSON.parse(data);
            } catch {}

            if (typeof data?.channel == `number`) {

                let type = data?.type;
                let typeLC = type?.toLowerCase();
                let channel: number= Number(data?.channel);
                let channelName = (channelsToRequestObj as any)?.[channel]?.name;

                if (channelName && channelName != undefined) {
                    let dataD = data?.data;
                    let isData = typeLC == `feed_data` && (dataD && Array.isArray(dataD));
                    if (isData) {
                        onSocketStockDataUpdate(channel, channelName, dataD);
                    } else console.log(`Robinhood WS ${channelName}`, { ...data, channel, channelName, type });
                } else {
                    console.log(`Robinhood WS Data`, { ...data, channel, type });
                }
    
                if (data?.type === `SETUP` && data?.channel == 0) {
                    authenticate();
                    return;
                }
    
                if (data?.type === `AUTH_STATE` && data?.channel == 0) {
                    if (data?.state == `AUTHORIZED`) {
                        didAuth = true;
                        startKeepAlive();
                        channelsToRequest?.forEach(ch => {
                            if (!channelsRequested?.includes(ch?.channel)) {
                                sendJson({ channel: ch?.channel, parameters: { contract: `AUTO`, }, service: `FEED`, type: `CHANNEL_REQUEST`, });
                                channelsRequested?.push(ch?.channel);
                            }
                        });
                        return;
                    } else if (data?.state == `UNAUTHORIZED`) {
                        authenticate();
                    }
                }
    
                if (didAuth && data?.type === `CHANNEL_OPENED` && data?.service === `FEED`) {
                    let channelNums = Object.keys(channelsToRequestObj)?.map(s => Number(s));
                    if (channelNums?.includes(data?.channel)) {
                        let channel: number = data?.channel;
                        let channelObj = (channelsToRequestObj as any)?.[channel as any];
                        if (channelObj) {
                            sendJson({ type: `FEED_SETUP`, channel: channel, acceptDataFormat: `FULL`, acceptAggregationPeriod: 0.25, acceptEventFields: channelObj?.acceptEventFields, });
                            channelsToRequest?.forEach(ch => {
                                if (!channelsSubscribed?.includes(ch?.channel)) {
                                    let tChannelObj = (channelsToRequestObj as any)?.[ch?.channel as any];
                                    if (tChannelObj) {
                                        sendJson({ channel: ch?.channel, add: tChannelObj?.add, type: `FEED_SUBSCRIPTION`, ...(tChannelObj?.resets ? { reset: true, } : {}), });
                                        channelsSubscribed?.push(ch?.channel);
                                    }
                                }
                            });
                        }
                        return;
                    }
                }
            }
        };

        ws.onerror = (error: Event) => {
            errorToast(`Please Refresh your Robinhood Socket Authorization Token to get Latest Realtime Stocks Data`, {
                error,
                token: socket_token,
                source: `Robinhood WS Error`,
                message: `Stock Socket Sync Needed`,
            }, undefined, `warn`);
            authenticate();
        };

        ws.onclose = (event: CloseEvent) => {
            let close = { code: event.code, reason: event.reason, wasClean: event.wasClean, };
            errorToast(`Please Refresh your Robinhood Socket Authorization Token to get Latest Realtime Stocks Data`, {
                close,
                token: socket_token,
                source: `Robinhood WS Close`,
                message: `Stock Socket Sync Needed`,
            }, undefined, `warn`);
            authenticate();
            if (keepAliveInterval) {
                clearInterval(keepAliveInterval);
                keepAliveInterval = null;
            }
        };

        return () => {
            if (keepAliveInterval) {
                clearInterval(keepAliveInterval);
                keepAliveInterval = null;
            }
            ws.close();
            socketRef.current = null;
        };
    }, [stocks?.length, user?.z_token_robinhood, uniquePopularStockSymbols, user?.z_token_robinhood_socket]);

    //                 setTimeout(() => {
    //                     sendJson({ channel: 3, parameters: { contract: `AUTO` }, service: `FEED`, type: `CHANNEL_REQUEST`, })
    //                     sendJson({ channel: 5, parameters: { contract: `AUTO` }, service: `FEED`, type: `CHANNEL_REQUEST`, })
    //                     sendJson({ channel: 9, parameters: { contract: `AUTO` }, service: `FEED`, type: `CHANNEL_REQUEST`, })
    //                     sendJson({ channel: 15, parameters: { contract: `AUTO` }, service: `FEED`, type: `CHANNEL_REQUEST`, })
    //                     // sendJson({ channel: 17, parameters: { contract: `AUTO` }, service: `FEED`, type: `CHANNEL_REQUEST`, })
    //                     // sendJson({ channel: 19, parameters: { contract: `AUTO` }, service: `FEED`, type: `CHANNEL_REQUEST`, })
  
    //                 acceptEventFields: {
    //                     Underlying: [
    //                         "callVolume",
    //                         "eventSymbol",
    //                         "eventType",
    //                         "putVolume",
    //                         "time",
    //                         "volatility"
    //                     ],
    //                     TradeETH: [
    //                         "price",
    //                         "dayVolume",
    //                         "eventSymbol",
    //                         "eventType",
    //                         "time"
    //                     ]

    //             sendJson({
    //                 reset: true,
    //                 channel: data?.channel,
    //                 type: `FEED_SUBSCRIPTION`,
    //                 add: uniquePopularStockSymbols?.map(s => ({ symbol: s, type: `Underlying` })),
    //             });
    //             sendJson({
    //                 reset: true,
    //                 channel: data?.channel,
    //                 type: `FEED_SUBSCRIPTION`,
    //                 add: uniquePopularStockSymbols?.map(s => ({ symbol: s, type: `TradeETH` })),
    //             });

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