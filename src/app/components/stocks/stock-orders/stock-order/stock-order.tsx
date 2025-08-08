'use client';

import { useState } from 'react';
import Stock from '../../stock/stock';
import { capWords } from '@/shared/scripts/constants';
import { stockTableAlignmentCenter } from '../../stocks';

export default function StockOrder({ order, getStock, className = `stockOrderComponent` }: any) {
    let [stockAlignmentCenter, ] = useState(stockTableAlignmentCenter);
    return (
        <div className={`stockOrderContainer flex gap10 alignCenter ${className}`}>
            <div className={`stockOrderStat flex gap5 column alignCenter`}>
                <div className={`stockOrderStatLabel main`}>
                    <strong>Qty</strong> 
                </div>
                <div className={`stockOrderStatValue stockColValue subMetric`}>
                    {order?.qty}
                </div>
            </div>
            <div className={`stockOrderStat flex gap5 column width100`}>
                <div className={`stockOrderStatLabel main`}>
                    <strong>Stock</strong> 
                </div>
                <div className={`stockOrderStatValue stockColValue subMetric`}>
                    <Stock 
                        {...getStock(order?.symbol)} 
                        linkClass={stockAlignmentCenter ? `` : `justifyStart`} 
                        className={`stockOrder stkOrd ${stockAlignmentCenter ? `w100 minwunset` : ``}`} 
                    />
                </div>
            </div>
            <div className={`stockOrderStat flex gap5 column alignCenter`}>
                <div className={`stockOrderStatLabel main`}>
                    <strong>Type</strong> 
                </div>
                <div className={`stockOrderStatValue stockColValue subMetric`}>
                    {capWords(order?.order_type)}
                </div>
            </div>
            <div className={`stockOrderStat flex gap5 column alignCenter`}>
                <div className={`stockOrderStatLabel main`}>
                    <strong>Side</strong> 
                </div>
                <div className={`stockOrderStatValue stockColValue subMetric`}>
                    {capWords(order?.side)}
                </div>
            </div>
        </div>
    )
}