import './stock.scss';

import Link from 'next/link';
import { useState } from 'react';
import Img from '../../image/image';
import { Tooltip } from '@mui/material';
import IconText from '../../icon-text/icon-text';
import { BarChart, PlayArrow } from '@mui/icons-material';

export default function Stock({ 
    changes = 0,
    zip = 95014,
    state = `CA`, 
    country = `US`,
    children = null,
    symbol = `AAPL`, 
    linkable = true,
    currency = `USD`,
    price = 99999.99, 
    volume = 53248283,
    employees = 164000,
    city = `Cupertino`, 
    exchange = `NASDAQ`,
    name = `Apple Inc.`,
    lastDividend = 1.01,
    sector = `Technology`,
    range = `169.21-260.1`,
    IPODate = `1980-12-12`,
    ceo = `Timothy D. Cook`,
    showCompanyName = true,
    phone = `(408) 996-1010`,
    marketCap = 3195217187580,
    className = `stockComponent`, 
    address = `One Apple Park Way`,
    industry = `Consumer Electronics`,
    website = `https://www.apple.com`,
    logo = `https://images.financialmodelingprep.com/symbol/${symbol}.png`, 
    description = `Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, a line of smartphones; Mac, a line of personal computers; iPad, a line of multi-purpose tablets; and wearables, home, and accessories comprising AirPods, Apple TV, Apple Watch, Beats products, and HomePod. It also provides AppleCare support and cloud services; and operates various platforms, including the App Store that allow customers to discover and download applications and digital content, such as books, music, video, games, and podcasts, as well as advertising services include third-party licensing arrangements and its own advertising platforms. In addition, the company offers various subscription-based services, such as Apple Arcade, a game subscription service; Apple Fitness+, a personalized fitness service; Apple Music, which offers users a curated listening experience with on-demand radio stations; Apple News+, a subscription news and magazine service; Apple TV+, which offers exclusive original content; Apple Card, a co-branded credit card; and Apple Pay, a cashless payment service, as well as licenses its intellectual property. The company serves consumers, and small and mid-sized businesses; and the education, enterprise, and government markets. It distributes third-party applications for its products through the App Store. The company also sells its products through its retail and online stores, and direct sales force; and third-party cellular network carriers, wholesalers, retailers, and resellers. Apple Inc. was founded in 1976 and is headquartered in Cupertino, California.`,
}: any) {

    const [imageErrored, setImageErrored] = useState(false);

    return (
        <div className={`stockContainer ${className}_container`}>
            <Tooltip title={linkable ? <StockDetails {...{ address, city, state, country, zip, employees, ceo }} /> : ``} arrow>
                <Link href={website} onClick={(e) => linkable ? undefined : e?.preventDefault()} target={`_blank`} className={`stockLink smallFont colorwhite flexContainer ${linkable ? `hoverLink` : `pointerEventsNone`}`}>
                    <div className={`stock ${className}`}>
                        <div className={`stockRow stockTopRow`}>
                            <div className={`stockRow stockSymbol stockText`}>
                                {symbol}
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
                                {changes != 0 && (
                                    <PlayArrow className={`changesIndicator change_${changes < 0 ? `negative` : `positive`}`} style={{ 
                                        marginRight: -5,
                                        position: `relative`, 
                                        transformOrigin: `center`, 
                                        top: changes < 0 ? -1 : 1, 
                                        color: changes < 0 ? `red` : `var(--success)`, 
                                        transform: `rotate(${changes < 0 ? `90` : `270`}deg)`,
                                    }} />
                                )}
                            </div>
                            {showCompanyName && (
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

export function StockDetails({ city, state, country, employees, ceo }: any) {
    return (
        <div className={`stockDetails w100 flex column gap5`}>
            <div className={`stockRow w100 flex gap5 spaceBetween`}>
                <strong>Location</strong>
                <div>{city ? `${city}, ` : ``} {state ? `${state}, ` : ``} {country}</div>
                {/* <div>{country}, {zip}</div> */}
            </div>
            <div className={`stockRow w100 flex gap15`}>
                <div className={`stockRow flex column gap5`}>
                    <strong>CEO</strong>
                    <div>{ceo && ceo != `` ? ceo : `Unknown`}</div>
                </div>
                <div className={`stockRow flex column gap5`}>
                    <strong>Employees</strong>
                    <div>
                        <IconText number={employees} showIcon={false} decimalPlaces={0} />
                    </div>
                </div>
            </div>
        </div>
    )
}