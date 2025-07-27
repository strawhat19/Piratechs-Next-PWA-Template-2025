import './stock.scss';

import Link from 'next/link';
import { useState } from 'react';
import Img from '../../image/image';
import { Tooltip } from '@mui/material';
import IconText from '../../icon-text/icon-text';
import { BarChart, PlayArrow } from '@mui/icons-material';
import CityStateCountry from '../../locations/city-state-country/city-state-country';
import { appleCompanyDescription } from '@/shared/server/database/samples/stocks/stocks';

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
    IPODate = `1980-12-12`,
    ceo = `Timothy D. Cook`,
    showCompanyName = true,
    phone = `(408) 996-1010`,
    marketCap = 3195217187580,
    className = `stockComponent`, 
    address = `One Apple Park Way`,
    industry = `Consumer Electronics`,
    website = `https://www.apple.com`,
    description = appleCompanyDescription,
    logo = `https://images.financialmodelingprep.com/symbol/${symbol}.png`, 
}: any) {

    const [imageErrored, setImageErrored] = useState(false);

    return (
        <div className={`stockContainer ${className}_container`}>
            <Tooltip title={linkable ? <StockDetails {...{ address, city, state, country, zip, employees, ceo, low, high }} /> : ``} arrow>
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

export function StockDetails({ city, state, country, employees, ceo, high, low }: any) {
    return (
        <div className={`stockDetails w100 flex column gap5`}>
            <div className={`stockRow w100 flex gap15`}>
                <div className={`stockRow flex column gap5`}>
                    <strong>Low</strong>
                    <div>
                        <IconText dollarSign number={low} className={`stockDetailPrice`} />
                    </div>
                </div>
                <div className={`stockRow flex column gap5`}>
                    <strong>High</strong>
                    <div>
                        <IconText dollarSign number={high} className={`stockDetailPrice`} />
                    </div>
                </div>
            </div>
            <div className={`stockRow flex column gap5`}>
                <strong>Location</strong>
                <CityStateCountry {...{ city, state, country }} />
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