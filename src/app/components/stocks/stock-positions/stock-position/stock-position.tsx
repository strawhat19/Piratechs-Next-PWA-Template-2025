'use client';

import { useState } from 'react';
import Stock from '../../stock/stock';
import IconText from '../../../icon-text/icon-text';
import { stockTableAlignmentCenter } from '../../stocks';

export default function StockPostion({ position, getStock, className = `stockPositionComponent` }: any) {
    let [stockAlignmentCenter, ] = useState(stockTableAlignmentCenter);
    return (
        <div className={`stockPositionContainer flex gap10 alignCenter ${className}`}>
            <div className={`stockPositionStat flex gap5 column alignCenter`}>
                <div className={`stockPositionStatLabel main`}>
                    <strong>Qty</strong> 
                </div>
                <div className={`stockPositionStatValue stockColValue subMetric`}>
                    {position?.qty}
                </div>
            </div>
            <div className={`stockPositionStat width100 flex gap5 column`}>
                <div className={`stockPositionStatLabel main`}>
                    <strong>Stock</strong> 
                </div>
                <div className={`stockPositionStatValue stockColValue subMetric`}>
                    <Stock 
                        {...getStock(position?.symbol)} 
                        linkClass={stockAlignmentCenter ? `` : `justifyStart`}  
                        className={`stockPosition stkPos ${stockAlignmentCenter ? `w100 minwunset` : ``}`} 
                    />
                </div>
            </div>
            <div className={`stockPositionStat flex gap5 column alignCenter`}>
                <div className={`stockPositionStatLabel main`}>
                    <strong>Avg Price</strong> 
                </div>
                <div className={`stockPositionStatValue stockColValue subMetric`}>
                    <IconText dollarSign number={position?.avg_entry_price} />
                </div>
            </div>
            <div className={`stockOrderStat flex gap5 column alignCenter`}>
                <div className={`stockPositionStatLabel main`}>
                    <strong>P/L</strong> 
                </div>
                <div className={`stockPositionStatValue stockColValue subMetric`}>
                    <IconText dollarSign number={position?.unrealized_pl} />
                </div>
            </div>
        </div>
    )
}