import './stock.scss';

import Link from 'next/link';
import { useState } from 'react';
import Img from '../../image/image';
import { Tooltip } from '@mui/material';
import IconText from '../../icon-text/icon-text';
import { BarChart, PlayArrow } from '@mui/icons-material';

export default function Stock({ 
    changes = 0,
    symbol = `AAPL`, 
    price = 99999.99, 
    name = `Apple Inc.`,
    className = `stockComponent`, 
    website = `https://www.apple.com`,
    logo = `https://images.financialmodelingprep.com/symbol/${symbol}.png`, 
}: any) {

    const [imageErrored, setImageErrored] = useState(false);

    return (
        <div className={`stockContainer ${className}_container`}>
            <Tooltip title={name} arrow>
                <Link href={website} target={`_blank`} className={`smallFont colorwhite flexContainer hoverLink`}>
                    <div className={`stock ${className}`}>
                        <div className={`stockRow stockTopRow`}>
                            <div className={`stockRow stockSymbol`}>
                                {symbol}
                            </div>
                            <div className={`stockImage`}>
                                {imageErrored ? <BarChart style={{ color: `var(--links)` }} /> : (
                                    <Img className={`logo`} src={logo} alt={name} width={`auto`} height={20} onImageError={() => setImageErrored(true)} />
                                )}
                            </div>
                            <div className={`stockPrice`}>
                                <IconText dollarSign number={price} />
                                {changes != 0 && (
                                    <PlayArrow className={`changesIndicator change_${changes < 0 ? `negative` : `positive`}`} style={{ 
                                        position: `relative`, 
                                        transformOrigin: `center`, 
                                        top: changes < 0 ? -1 : 1, 
                                        color: changes < 0 ? `red` : `var(--success)`, 
                                        transform: `rotate(${changes < 0 ? `90` : `270`}deg)`,
                                    }} />
                                )}
                            </div>
                            <div className={`stockRow stockSymbol`}>
                                {name}
                            </div>
                        </div>
                        {/* <div className={`stockRow`}>
                            {name}
                        </div> */}
                    </div>
                </Link>
            </Tooltip>
        </div>
    )
}