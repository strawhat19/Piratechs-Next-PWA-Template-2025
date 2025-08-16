'use client';

import { useContext } from 'react';
import { State } from '../../container/container';
import StockSearch from '../stock-search/stock-search';
import StockPostion from './stock-position/stock-position';

export default function StockPositions({ getStock }: any) {
    const { stocks, stockPositions } = useContext<any>(State);
    return (
        <div className={`stockMetrics stockMetricsTableContainer stockMetrics_account_positions w100 h100`}>
            <div className={`stockMetric stockMetric_positions flex column gap15I`}>
                <div className={`stockTableRow stockTableSearchRow`}>
                    <strong>
                        Positions <span className={`main stockMetricCount`}>({stockPositions?.length})</span>
                    </strong>
                    <StockSearch stcks={stocks?.filter((s: any) => stockPositions?.map((sp: any) => sp?.symbol)?.includes(s?.symbol))} />
                </div>
                <div className={`positionsContainer`}>
                    {stockPositions?.length > 0 ? stockPositions?.map((pos: any, posIndex: number) => (
                        <StockPostion key={posIndex} position={pos} getStock={getStock} />
                    )) : <></>}
                </div>
            </div>
        </div>
    )
}