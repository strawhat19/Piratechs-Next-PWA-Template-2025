'use client';

import Stock from '../../stock/stock';
import { capWords } from '@/shared/scripts/constants';

export default function StockOrder({ order, getStock, className = `stockOrderComponent` }: any) {
    return (
        <div className={`stockOrderContainer flex gap10 alignCenter ${className}`}>
            <div className={`stockOrderStat flex gap5 column alignCenter`}>
                <div className={`stockOrderStatLabel`}>
                    Qty: 
                </div>
                <div className={`stockOrderStatValue subMetric`}>
                    {order?.qty}
                </div>
            </div>
            <Stock {...getStock(order?.symbol)} className={`stockOrder w100 minwunset stkOrd`} />
            <div className={`stockOrderStat flex gap5 column alignCenter`}>
                <div className={`stockOrderStatLabel`}>
                    Type: 
                </div>
                <div className={`stockOrderStatValue subMetric`}>
                    {capWords(order?.order_type)}
                </div>
            </div>
            <div className={`stockOrderStat flex gap5 column alignCenter`}>
                <div className={`stockOrderStatLabel`}>
                    Side: 
                </div>
                <div className={`stockOrderStatValue subMetric`}>
                    {capWords(order?.side)}
                </div>
            </div>
        </div>
    )
}