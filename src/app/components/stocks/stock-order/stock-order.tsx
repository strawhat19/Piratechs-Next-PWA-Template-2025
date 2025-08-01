'use client';

import { useContext } from 'react';
import Stock from '../stock/stock';
import { State } from '../../container/container';
import { capWords } from '@/shared/scripts/constants';

export default function StockOrder({ order, className = `stockOrderComponent` }: any) {
    const { stocks } = useContext<any>(State);

    const getStock = (symbol: string) => {
        let stock = stocks?.find((s: any) => s?.symbol == symbol);
        return stock;
    }
    
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
            <Stock {...getStock(order?.symbol)} />
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