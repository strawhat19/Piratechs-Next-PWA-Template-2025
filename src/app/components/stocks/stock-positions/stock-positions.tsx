'use client';

import { useContext } from 'react';
import { State } from '../../container/container';
import StockPostion from './stock-position/stock-position';

export default function StockPositions({ getStock }: any) {
    const { stockPositions } = useContext<any>(State);
    return (
        <div className={`stockMetrics stockMetrics_account_stats w100 h100`}>
            <div className={`stockMetric stockMetric_positions flex column gap15I`}>
                <strong>Positions <span className={`main stockMetricCount`}>({stockPositions?.length})</span></strong>
                <div className={`positionsContainer`}>
                    {stockPositions?.length > 0 ? stockPositions?.map((pos: any, posIndex: number) => (
                        <StockPostion key={posIndex} position={pos} getStock={getStock} />
                    )) : <></>}
                </div>
            </div>
        </div>
    )
}