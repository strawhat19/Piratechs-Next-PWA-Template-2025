'use client';

import { useContext } from 'react';
import { StateGlobals } from '@/shared/global-context';
// import StockSearch from '../stock-search/stock-search';
import StockPostion from './stock-position/stock-position';

export default function StockPositions({ getStock }: any) {
    const { stockPositions, robinhoodAccountTypes } = useContext<any>(StateGlobals);
    return (
        <div className={`stockMetrics stockMetricsTableContainer stockMetrics_account_positions w100 h100`}>
            <div className={`stockMetric stockMetric_positions flex column gap15I`}>
                {/* <div className={`stockTableRow stockTableSearchRow`}>
                    <strong>
                        Positions <span className={`main stockMetricCount`}>({stockPositions?.length})</span>
                    </strong>
                    {stocks && Array.isArray(stocks) && (
                        <StockSearch stcks={stocks?.filter((s: any) => stockPositions?.map((sp: any) => sp?.symbol)?.includes(s?.symbol))} />
                    )}
                </div> */}
                <div className={`positionsContainer stockMetricTableContainer`}>
                    {stockPositions?.length > 0 ? stockPositions?.map((pos: any, posIndex: number) => (
                        !robinhoodAccountTypes?.includes(pos?.account_type) && (
                            <StockPostion key={posIndex} position={pos} index={posIndex} />
                        )
                    )) : <></>}
                </div>
            </div>
        </div>
    )
}