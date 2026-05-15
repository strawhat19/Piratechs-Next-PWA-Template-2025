'use client';

import './stocks-scroll.scss';

// import WebSocket from 'ws';
import Stock from '../stock/stock';
import Slider from '../../slider/slider';
import Loader from '../../loaders/loader';
import { SwiperSlide } from 'swiper/react';
// import { calcTotalProfitLoss } from '../stocks';
import { useContext, useEffect, useRef, useState } from 'react';
import { Position } from '@/shared/types/models/stocks/Position';
// import { DataSources, StockAPIs } from '@/shared/types/types';
import { minStocksLen, StateGlobals } from '@/shared/global-context';
import { Stock as StockModel } from '@/shared/types/models/stocks/Stock';
import { popularStocks } from '@/shared/server/database/samples/stocks/stocks';
import { apiRoutes, connectSymbolsOnWSConnect, dev, errorToast, getAPIServerData, getRealStocks, reconnectPeriodically } from '@/shared/scripts/constants';

const popularStockSymbols = [...Object.keys(popularStocks), `BRK.A`, `BRK.B`];
const uniquePopularStockSymbols = [...new Set(popularStockSymbols)]?.filter(Boolean)?.sort();

export default function StocksScroll({ className = `stocksScrollComponent` }) {
    const {
        user,
        stocksFullyLoaded,
        stocks, setStocks,
        realtime, setRealtime,
        stocksObj, setStocksObj,
        stockPositions, setStockPositions,
        webSocketConnected, setWebSocketConnected,
    } = useContext<any>(StateGlobals);

    const [updates, setUpdates] = useState(0);
    const [loading, setLoading] = useState(true);

    const sendJsonRef = useRef<any>(null);
    const channelsToRequestObjRef = useRef<any>(null);
    const subscribedSymbolsRef = useRef<string[]>([]);

    const socketRef = useRef<WebSocket | null>(null);
    const watchdogRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const updatesRef = useRef(0);
    const stocksRef = useRef<StockModel[]>([]);
    const stockPositionsRef = useRef<Position[]>([]);

    const intentionalCloseRef = useRef(false);
    const lastMessageAtRef = useRef(Date.now());
    const lastFeedDataAtRef = useRef(Date.now());

    useEffect(() => {
        stocksRef.current = stocks || [];
    }, [stocks]);

    useEffect(() => {
        stockPositionsRef.current = stockPositions || [];
    }, [stockPositions]);

    useEffect(() => {
        updatesRef.current = updates;
    }, [updates]);

    const onSocketStockDataUpdate = (channel: number, channelName: string, data: any[]) => {
        if (!Array.isArray(data) || !data.length) return;
        let updatedStocks: StockModel[] = [];
        let dataSymbols = data?.map(d => d?.eventSymbol?.toUpperCase()).filter(Boolean);
        if (!stocksRef.current?.length) return;
        setRealtime(true);
        setStocks((prevStocks: StockModel[]) => {
            let refreshedStocks = prevStocks?.map((stock: StockModel) => {
                if (dataSymbols?.includes(stock?.symbol?.toUpperCase())) {
                    const stk: StockModel = stock;
                    stk?.updateFromLiveEventsArray(data);
                    updatedStocks?.push(stk);
                    setStockPositions((prevPositions: Position[]) => {
                        if (!prevPositions?.length) return prevPositions;
                        let refreshedPositions = prevPositions?.map((position: Position) => {
                            if (dataSymbols?.includes(position?.symbol?.toUpperCase())) {
                                if (stk?.symbol?.toUpperCase() == position?.symbol?.toUpperCase()) {
                                    if (!position?.price) return position;
                                    let updPos = position;
                                    let price = Number(updPos?.price);
                                    let newPrice = Number(stk?.price);
                                    if (price != newPrice) {
                                        updPos?.updateFromPrices(newPrice);
                                        return updPos;
                                    } else return updPos;
                                } else return position;
                            } else return position;
                        })?.sort((a: Position, b: Position) => {
                            return Number(b?.merged?.[0]?.totalProfitLoss) - Number(a?.merged?.[0]?.totalProfitLoss);
                        });
                        return refreshedPositions;
                    });
                    return stk;
                } else return stock;
            });
            return refreshedStocks;
        });
        setUpdates(prevUpdates => {
            let nextUpdates = prevUpdates + 1;
            updatesRef.current = nextUpdates;
            return nextUpdates;
        });
    };

    const finishStocksLoading = (stocksFromAPI: any[] = []) => {
        // let token = user?.z_token_robinhood;
        let hasNewStocks = stocksFromAPI && stocksFromAPI?.length > 0;
        let stocksToSet = hasNewStocks ? stocksFromAPI : stocks;

        setStocks(stocksToSet);
        setLoading(false);

        if (hasNewStocks) {
            console.log(`Stocks`, stocksFromAPI);
        }
    };

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
                        finishStocksLoading();
                    }
                })?.catch(error => {
                    let errorMessage = `Error on GET Robinhood Stocks`;

                    errorToast(errorMessage, error);
                    finishStocksLoading();
                });
            } else finishStocksLoading();
        }
    };

    const reconnectSocket = () => {
        if (!reconnectPeriodically) return;
        if (reconnectTimerRef.current) return;

        reconnectTimerRef.current = setTimeout(() => {
            reconnectTimerRef.current = null;

            if (
                stocksFullyLoaded &&
                user?.z_token_robinhood &&
                user?.z_token_robinhood_socket &&
                stocksRef.current?.length
            ) {
                startRealtimeUpdates();
            }
        }, 3000);
    };

    const updateRealtimeSymbol = (symbol: string, connect: boolean = true, extraData: any = {}) => {
        if (!symbol) return;
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
        if (!sendJsonRef.current) return;
        if (!channelsToRequestObjRef.current) return;

        const alreadySubscribed = subscribedSymbolsRef.current.includes(symbol);

        if (connect && alreadySubscribed) return;
        if (!connect && !alreadySubscribed) return;

        Object.values(channelsToRequestObjRef.current).forEach((channelObj: any) => {
            sendJsonRef.current({
                channel: channelObj.channel,
                type: `FEED_SUBSCRIPTION`,
                ...(connect
                    ? { add: [{ type: channelObj?.name, symbol }] }
                    : { remove: [{ type: channelObj?.name, symbol }] }),
            });
        });

        subscribedSymbolsRef.current = connect
            ? [...new Set([...subscribedSymbolsRef?.current, symbol])].sort()
            : subscribedSymbolsRef?.current?.filter(s => s !== symbol);

        dev() && console.log(connect ? `Realtime Symbol Added` : `Realtime Symbol Removed`, {
            symbol,
            subscribedSymbols: subscribedSymbolsRef?.current,
            ...extraData,
        });
    };

    const startRealtimeUpdates = () => {
        if (
            socketRef.current &&
            socketRef.current.readyState !== WebSocket.CLOSED &&
            socketRef.current.readyState !== WebSocket.CLOSING
        ) {
            return {
                ws: socketRef.current,
            };
        }

        const channelsRequested: number[] = [];
        const channelsSubscribed: number[] = [];

        const token = user?.z_token_robinhood;
        const socket_token = user?.z_token_robinhood_socket;
        const symbols = uniquePopularStockSymbols.filter(Boolean);

        const ws = new WebSocket(`wss://api.robinhood.com/marketdata/streaming/legend/v2/`, [`bearer`, token]);

        socketRef.current = ws;
        intentionalCloseRef.current = false;
        lastMessageAtRef.current = Date.now();
        lastFeedDataAtRef.current = Date.now();

        let didAuth = false;

        const sendJson = (payload: any) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(payload));
            }
        };

        sendJsonRef.current = sendJson;

        const authenticate = () => {
            if (!didAuth && ws.readyState === WebSocket.OPEN) {
                sendJson({
                    type: `AUTH`,
                    channel: 0,
                    token: socket_token,
                });
            }
        };

        const startKeepAlive = () => {
            if (keepAliveRef.current) return;

            keepAliveRef.current = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    sendJson({
                        type: `KEEPALIVE`,
                        channel: 0,
                    });
                }
            }, 30_000);
        };

        const startWatchdog = () => {
            if (!reconnectPeriodically) return;
            if (watchdogRef.current) return;

            watchdogRef.current = setInterval(() => {
                let secondsSinceLastFeedData = (Date.now() - lastFeedDataAtRef.current) / 1000;

                if (secondsSinceLastFeedData > 45) {
                    console.warn(`Robinhood WS feed stale, reconnecting`, {
                        secondsSinceLastFeedData,
                        readyState: socketRef.current?.readyState,
                    });

                    intentionalCloseRef.current = false;

                    if (socketRef.current) {
                        socketRef.current.close();
                    } else {
                        reconnectSocket();
                    }
                }
            }, 15_000);
        };

        ws.onopen = () => {
            sendJson({
                channel: 0,
                type: `SETUP`,
                keepaliveTimeout: 60,
                acceptKeepaliveTimeout: 60,
                version: `0.1-DXF-JS/0.5.1`,
            });
        };

        const channelsToRequestObj = {
            1: {
                channel: 1,
                name: `Trade`,
                add: connectSymbolsOnWSConnect ? symbols.map((symbol: string) => ({ type: `Trade`, symbol })) : [],
                acceptEventFields: {
                    Trade: [
                        `price`,
                        `size`,
                        `dayVolume`,
                        `dayTurnover`,
                        `tickDirection`,
                        `extendedTradingHours`,
                        `eventSymbol`,
                        `eventType`,
                        `time`,
                        `sequence`,
                    ],
                },
            },
            7: {
                channel: 7,
                resets: true,
                name: `Quote`,
                add: connectSymbolsOnWSConnect ? symbols.map((symbol: string) => ({ type: `Quote`, symbol })) : [],
                acceptEventFields: {
                    Quote: [
                        `askPrice`,
                        `askSize`,
                        `askTime`,
                        `bidPrice`,
                        `bidSize`,
                        `bidTime`,
                        `askExchangeCode`,
                        `bidExchangeCode`,
                        `eventSymbol`,
                        `eventType`,
                        `sequence`,
                        `timeNanoPart`,
                    ],
                },
            },
            11: {
                channel: 11,
                resets: true,
                name: `Summary`,
                add: connectSymbolsOnWSConnect ? symbols.map((symbol: string) => ({ type: `Summary`, symbol })) : [],
                acceptEventFields: {
                    Summary: [
                        `dayClosePrice`,
                        `dayOpenPrice`,
                        `dayHighPrice`,
                        `dayLowPrice`,
                        `dayVolume`,
                        `dayTurnover`,
                        `prevDayClosePrice`,
                        `prevDayVolume`,
                        `openInterest`,
                        `eventSymbol`,
                        `eventType`,
                    ],
                },
            },
            13: {
                channel: 13,
                resets: true,
                name: `Profile`,
                add: connectSymbolsOnWSConnect ? symbols.map((symbol: string) => ({ type: `Profile`, symbol })) : [],
                acceptEventFields: {
                    Profile: [
                        `eventSymbol`,
                        `eventType`,
                        `description`,
                        `shortSaleRestriction`,
                        `tradingStatus`,
                        `statusReason`,
                        `haltStartTime`,
                        `haltEndTime`,
                        `high52WeekPrice`,
                        `low52WeekPrice`,
                        `shares`,
                        `beta`,
                        `earningsPerShare`,
                        `dividendFrequency`,
                        `exDividendAmount`,
                        `exDividendDayId`,
                    ],
                },
            },
        };

        channelsToRequestObjRef.current = channelsToRequestObj;

        const channelsToRequest = Object.values(channelsToRequestObj);

        ws.onmessage = (event: MessageEvent) => {
            lastMessageAtRef.current = Date.now();

            let data: any = event?.data;

            try {
                data = JSON.parse(data);
            } catch {}

            if (typeof data?.channel == `number`) {
                let type = data?.type;
                let typeLC = type?.toLowerCase();
                let channel: number = Number(data?.channel);
                let channelName = (channelsToRequestObj as any)?.[channel]?.name;

                if (channelName) {
                    let dataD = data?.data;
                    let isData = typeLC == `feed_data` && dataD && Array.isArray(dataD);

                    if (isData) {
                        lastFeedDataAtRef.current = Date.now();

                        // dev() && console.log(`Robinhood Feed Data`, {
                        //     channel,
                        //     channelName,
                        //     count: dataD.length,
                        //     time: new Date().toLocaleTimeString(),
                        // });

                        onSocketStockDataUpdate(channel, channelName, dataD);
                    }
                }

                if (data?.type === `SETUP` && data?.channel == 0) {
                    authenticate();
                    return;
                }

                if (data?.type === `AUTH_STATE` && data?.channel == 0) {
                    if (data?.state == `AUTHORIZED`) {
                        didAuth = true;
                        startKeepAlive();
                        startWatchdog();

                        channelsToRequest?.forEach(ch => {
                            if (!channelsRequested?.includes(ch?.channel)) {
                                sendJson({
                                    channel: ch?.channel,
                                    parameters: { contract: `AUTO` },
                                    service: `FEED`,
                                    type: `CHANNEL_REQUEST`,
                                });

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
                            sendJson({
                                type: `FEED_SETUP`,
                                channel,
                                acceptDataFormat: `FULL`,
                                acceptAggregationPeriod: 0.25,
                                acceptEventFields: channelObj?.acceptEventFields,
                            });

                            if (!channelsSubscribed?.includes(channel)) {
                                sendJson({
                                    channel,
                                    add: channelObj?.add,
                                    type: `FEED_SUBSCRIPTION`,
                                    ...(channelObj?.resets ? { reset: true } : {}),
                                });

                                channelsSubscribed?.push(channel);
                            }
                        }

                        return;
                    }
                }
            }
        };

        ws.onerror = (error: Event) => {
            errorToast(
                `Please Refresh your Robinhood Socket Authorization Token to get Latest Realtime Stocks Data`,
                {
                    error,
                    token: socket_token,
                    source: `Robinhood WS Error`,
                    message: `Stock Socket Sync Needed`,
                },
                undefined,
                `warn`
            );

            authenticate();
        };

        ws.onclose = (event: CloseEvent) => {
            console.warn(`Robinhood WS closed`, {
                code: event.code,
                reason: event.reason,
                wasClean: event.wasClean,
                intentional: intentionalCloseRef.current,
            });

            if (keepAliveRef.current) {
                clearInterval(keepAliveRef.current);
                keepAliveRef.current = null;
            }

            if (watchdogRef.current) {
                clearInterval(watchdogRef.current);
                watchdogRef.current = null;
            }

            socketRef.current = null;

            if (!intentionalCloseRef.current && reconnectPeriodically) {
                reconnectSocket();
            }
        };

        return {
            ws,
        };
    };

    useEffect(() => {
        refreshStocks();
    }, [user?.z_token_robinhood]);

    useEffect(() => {
        if (loading) return;
        if (socketRef.current) return;
        if (!stocksFullyLoaded) return;
        if (!user?.z_token_robinhood) return;
        if (!user?.z_token_robinhood_socket) return;
        if (!uniquePopularStockSymbols?.length) return;
        if (!stockPositions || !stockPositions?.length || stockPositions?.length == 0) return;
        if (!stocks || !stocks?.length || stocks?.length == 0 || ((stocks?.length ?? 0) < minStocksLen)) return;

        setWebSocketConnected(true);

        let { ws } = startRealtimeUpdates();

        return () => {
            intentionalCloseRef.current = true;

            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = null;
            }

            if (keepAliveRef.current) {
                clearInterval(keepAliveRef.current);
                keepAliveRef.current = null;
            }

            if (watchdogRef.current) {
                clearInterval(watchdogRef.current);
                watchdogRef.current = null;
            }

            ws.close();
            socketRef.current = null;
        };
    }, [
        stocks?.length,
        stocksFullyLoaded,
        user?.z_token_robinhood,
        user?.z_token_robinhood_socket,
    ]);

    useEffect(() => {
        if (!webSocketConnected) return;
        if (connectSymbolsOnWSConnect) return;

        const visibleSymbols = new Set<string>();
        const updateVisibleSymbols = () => {
            const symbols = Array.from(visibleSymbols).sort();
            setStocksObj((prev: any) => ({ ...prev, 2: symbols, }));
        };

        const observer = new IntersectionObserver((entries) => {
            let changed = false;
            entries.forEach(entry => {
                const symbol = (entry.target as HTMLElement)?.id?.replaceAll(`stock_`, ``);
                if (!symbol) return;
                if (entry.isIntersecting) {
                    if (!visibleSymbols.has(symbol)) {
                        visibleSymbols.add(symbol);
                        updateRealtimeSymbol(symbol, true, { stocksObj, visibleSymbols });
                        changed = true;
                    }
                } else {
                    if (visibleSymbols.has(symbol)) {
                        visibleSymbols.delete(symbol);
                        updateRealtimeSymbol(symbol, false, { stocksObj, visibleSymbols });
                        changed = true;
                    }
                }
            });
            if (changed) {
                updateVisibleSymbols();
            }
        },
        { threshold: 0.1, });

        const stockEls = document.querySelectorAll<HTMLElement>(`.stockComponent`);
        stockEls.forEach(el => observer.observe(el));
        return () => {
            observer.disconnect();
        };
    }, [
        stocks?.length,
        stocksFullyLoaded,
        webSocketConnected,
        user?.z_token_robinhood,
        user?.z_token_robinhood_socket,
    ])

    return (
        <div className={`stocksScrollContainer w100 h100 ${className}`}>
            {(loading || stocks?.length == 0 || !stocks || !Array.isArray(stocks)) ? (
                <Loader height={35} label={`Stocks Loading`} className={`topBarLoader`} />
            ) : (
                <>
                    <Slider className={`stocksCarousel`} autoplay slidesPerView={12} spaceBetween={15} showButtons={false}>
                        {stocks?.map((stock: any, stockIndex: number) => (
                            <SwiperSlide key={stockIndex} className={`stockSlide`}>
                                <Stock {...stock} />
                            </SwiperSlide>
                        ))}
                    </Slider>
                </>
            )}
        </div>
    );
}