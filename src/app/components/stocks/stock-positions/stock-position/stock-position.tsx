'use client';

import Stock from '../../stock/stock';
import IconText from '../../../icon-text/icon-text';

export default function StockPostion({ position, getStock, className = `stockPositionComponent` }: any) {
    return (
        <div className={`stockPositionContainer flex gap10 alignCenter ${className}`}>
            <div className={`stockPositionStat flex gap5 column alignCenter`}>
                <div className={`stockPositionStatLabel`}>
                    Qty: 
                </div>
                <div className={`stockPositionStatValue subMetric`}>
                    {position?.qty}
                </div>
            </div>
            <Stock {...getStock(position?.symbol)} className={`stockPosition w100 minwunset stkPos`} />
            <div className={`stockPositionStat flex gap5 column alignCenter`}>
                <div className={`stockPositionStatLabel`}>
                    Avg Price: 
                </div>
                <div className={`stockPositionStatValue subMetric`}>
                    <IconText dollarSign number={position?.avg_entry_price} />
                </div>
            </div>
            <div className={`stockOrderStat flex gap5 column alignCenter`}>
                <div className={`stockOrderStatLabel`}>
                    P/L: 
                </div>
                <div className={`stockOrderStatValue subMetric`}>
                    <IconText dollarSign number={position?.unrealized_pl} />
                </div>
            </div>
        </div>
    )
}