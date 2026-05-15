import './stock.scss';

import Link from 'next/link';
import Img from '../../image/image';
import { Tooltip } from '@mui/material';
import IconText from '../../icon-text/icon-text';
import { dev } from '@/shared/scripts/constants';
import { minStocksLen, StateGlobals } from '@/shared/global-context';
import StockDetails from './stock-details/stock-details';
import { BarChart, PlayArrow } from '@mui/icons-material';
import { useContext, useEffect, useRef, useState } from 'react';
import { appleCompanyDescription } from '@/shared/server/database/samples/stocks/stocks';

export default function Stock({ 
    style = {},
    change = 0,
    zip = 95014,
    lastUpdated,
    dividend = 0,
    state = `CA`, 
    country = `US`,
    children = null,
    symbol = `AAPL`, 
    linkable = true,
    currency = `USD`,
    price = 99999.99, 
    low = price,
    high = price,
    volume = 53248283,
    employees = 164000,
    city = `Cupertino`, 
    exchange = `NASDAQ`,
    name = `Apple Inc.`,
    lastDividend = 1.01,
    sector = `Technology`,
    range = `169.21-260.1`,
    ipoDate = `1980-12-12`,
    ceo = `Timothy D. Cook`,
    showCompanyName = true,
    phone = `(408) 996-1010`,
    marketCap = 3195217187580,
    className = `stockComponent`, 
    linkClass = `stockLinkElement`,
    address = `One Apple Park Way`,
    industry = `Consumer Electronics`,
    description = appleCompanyDescription,
    website = `https://www.google.com/search?q=${symbol}`,
    logo = `https://images.financialmodelingprep.com/symbol/${symbol}.png`, 
}: any) {

    const {
        stocks,
        realtime,
        stockPositions,
        alpacaPositions,
        stocksFullyLoaded,
        webSocketConnected,
        stocksObj, setStocksObj,
    } = useContext<any>(StateGlobals);

    const stockRef = useRef<HTMLDivElement | null>(null);
    const [imageErrored, setImageErrored] = useState(false);

    const logStock = (e?: any, logMessage: string = `Stock`, extraData: any = {}) => {
        dev() && console.log(logMessage, {
            stocks,
            realtime,
            stocksObj,
            stockPositions,
            alpacaPositions,
            stocksFullyLoaded,
            webSocketConnected,
            ...extraData,
            [symbol]: {
                name,
                logo,
                change,
                website,
            }
        })
    }

    // const setStock = (interval: number = 1, message: string = `Stock`) => {
    //     setStocksObj((prevStocksObj: any) => { 
    //         const letter = symbol?.[0];
    //         const updatedLetter = { 
    //             ...prevStocksObj?.[letter], 
    //             [symbol]: (((prevStocksObj?.[letter]?.[symbol] ?? 0) + interval) <= 0 ? 0 : ((prevStocksObj?.[letter]?.[symbol] ?? 0) + interval)),
    //         };
    //         updatedLetter[1] = Object.keys(updatedLetter)?.filter(k => k != `1` && k != `2`)?.length;
    //         const updatedStocksObj = { ...prevStocksObj, [letter]: updatedLetter, };
    //         updatedStocksObj[1] = Object.keys(updatedStocksObj)?.filter(k => k != `1` && k != `2`)?.reduce((count, letterKey) => count + (updatedStocksObj?.[letterKey]?.[1] ?? 0), 0);
    //         updatedStocksObj[2] = updatedStocksObj?.[2] ? [...updatedStocksObj?.[2]] : [];
    //         if (interval >= 1) {
    //             if (!updatedStocksObj[2]?.includes(symbol)) {
    //                 updatedStocksObj[2].push(symbol);
    //             }
    //         } else {
    //             let symbolCount = updatedStocksObj?.[letter]?.[symbol] ?? 0;
    //             if (symbolCount <= 0) {
    //                 updatedStocksObj[2] = updatedStocksObj[2]?.filter((s: string) => s != symbol);
    //             }
    //         }
    //         if (Array.isArray(updatedStocksObj?.[2]) && updatedStocksObj?.[2]?.length > 0) {
    //             updatedStocksObj?.[2]?.sort();
    //         }
    //         if (stocksFullyLoaded) {
    //             let fullMsg = interval < 1 ? `${message} Leave` : message;
    //             logStock(undefined, fullMsg, { interval, stocksObj: updatedStocksObj });
    //         }
    //         return updatedStocksObj;
    //     });
    // }

    // useEffect(() => {
    //     if (!stocksFullyLoaded) return;
    //     if ((stocks?.length ?? 0) < minStocksLen) return;
    //     if (!stockPositions || !stockPositions?.length || stockPositions?.length == 0) return;
    //     return;
    //     // const el = stockRef.current;
    //     // if (!el) return;
    //     // let inView = false;
    //     // const observer = new IntersectionObserver(([entry]) => {
    //     //     const isVisible = entry?.isIntersecting;
    //     //     if (isVisible && !inView) {
    //     //         setStock();
    //     //         inView = true;
    //     //     } else if (!isVisible && inView) {
    //     //         setStock(-1);
    //     //         inView = false;
    //     //     }
    //     // }, { threshold: 0.1, });
    //     // // observer.observe(el);
    //     // return () => {
    //     //     observer.disconnect();
    //     // };
    // }, [symbol]);

    return (
        <div ref={stockRef} id={`stock_${symbol}`} className={`stockContainer stockComponent stock_${symbol} ${className}_container`} onClick={(e) => logStock(e)} style={style}>
            <Tooltip title={linkable ? <StockDetails {...{ address, city, state, country, zip, employees, ceo, low, high }} /> : ``} arrow>
                <Link href={website} onClick={(e) => linkable ? undefined : e?.preventDefault()} target={`_blank`} className={`stockLink smallFont colorwhite flexContainer ${linkClass} ${linkable ? `hoverLink` : `pointerEventsNone`}`}>
                    <div className={`stock ${className}`}>
                        <div className={`stockRow stockTopRow`}>
                            <div className={`stockRow stockSymbol stockText`}>
                                <strong>{symbol}</strong>
                            </div>
                            <div className={`stockImage`}>
                                {imageErrored ? <BarChart style={{ color: `var(--links)` }} /> : (
                                    <Img 
                                        src={logo} 
                                        alt={name} 
                                        height={20} 
                                        width={`auto`} 
                                        className={`logo`} 
                                        onImageError={() => setImageErrored(true)} 
                                    />
                                )}
                            </div>
                            <div className={`stockPrice stockText`}>
                                <IconText dollarSign number={price} className={`stockText`} />
                                {change != 0 && (
                                    <PlayArrow className={`changesIndicator change_${change < 0 ? `negative` : `positive`}`} style={{ 
                                        marginRight: -5,
                                        position: `relative`, 
                                        transformOrigin: `center`, 
                                        top: change < 0 ? -1 : 1, 
                                        color: change < 0 ? `red` : `var(--success)`, 
                                        transform: `rotate(${change < 0 ? `90` : `270`}deg)`,
                                    }} />
                                )}
                            </div>
                            {showCompanyName && (name != symbol) && (
                                <div className={`stockRow stockSymbol stockName stockText`}>
                                    {name}
                                </div>
                            )}
                            {children != null && (
                                <div className={`stockRow pointerEventsAuto stockText`}>
                                    {children}
                                </div>
                            )}
                        </div>
                        {/* <div className={`stockRow stockText`}>
                            {name}
                        </div> */}
                    </div>
                </Link>
            </Tooltip>
        </div>
    )
}