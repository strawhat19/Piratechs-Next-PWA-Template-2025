'use client';

import { useContext } from 'react';
import { State } from '../../container/container';
import StockOrder from './stock-order/stock-order';

export default function StockOrders({ getStock }: any) {
    const { stockOrders } = useContext<any>(State);
    return (
        <div className={`stockMetrics stockMetrics_account_orders w100 h100`}>
            <div className={`stockMetric stockMetric_orders flex column gap15I`}>
                <strong>Orders <span className={`main stockMetricCount`}>({stockOrders?.length})</span></strong>
                <div className={`ordersContainer`}>
                    {stockOrders?.length > 0 ? stockOrders?.map((ord: any, ordIndex: number) => (
                        <StockOrder key={ordIndex} order={ord} getStock={getStock} />
                    )) : <></>}
                </div>
            </div>
        </div>
    )
}