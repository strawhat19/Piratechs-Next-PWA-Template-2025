'use client';

import { useContext } from 'react';
import { dev } from '@/shared/scripts/constants';
import StockSearch from '../stock-search/stock-search';
import { StateGlobals } from '@/shared/global-context';
import StockPostion from './stock-position/stock-position';

export default function StockPositions({ getStock, useRobinhood = dev() }: any) {
    const { stocks, robinhood, stockPositions } = useContext<any>(StateGlobals);
    return (
        <div className={`stockMetrics stockMetricsTableContainer stockMetrics_account_positions w100 h100`}>
            <div className={`stockMetric stockMetric_positions flex column gap15I`}>
                <div className={`stockTableRow stockTableSearchRow`}>
                    <strong>
                        Positions <span className={`main stockMetricCount`}>({stockPositions?.length})</span>
                    </strong>
                    {stocks && Array.isArray(stocks) && (
                        <StockSearch stcks={stocks?.filter((s: any) => stockPositions?.map((sp: any) => sp?.symbol)?.includes(s?.symbol))} />
                    )}
                </div>
                <div className={`positionsContainer stockMetricTableContainer`}>
                    {useRobinhood ? (
                        robinhood?.stocks?.positions?.length > 0 ? robinhood?.stocks?.positions?.map((pos: any, posIndex: number) => (
                            <StockPostion key={posIndex} position={pos} getStock={getStock} />
                        )) : <></>
                    ) : (
                        stockPositions?.length > 0 ? stockPositions?.map((pos: any, posIndex: number) => (
                            <StockPostion key={posIndex} position={pos} getStock={getStock} />
                        )) : <></>
                    )}
                </div>
            </div>
        </div>
    )
}