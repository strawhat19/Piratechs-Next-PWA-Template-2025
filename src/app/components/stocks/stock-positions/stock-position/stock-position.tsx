'use client';

import Stock from '../../stock/stock';
import { Types } from '@/shared/types/types';
import IconText from '../../../icon-text/icon-text';
import { StateGlobals } from '@/shared/global-context';
import { useContext, useEffect, useState } from 'react';
import { stockTableAlignmentCenter } from '../../stocks';
import { Position } from '@/shared/types/models/stocks/Position';
import { Stock as StockModel } from '@/shared/types/models/stocks/Stock';

export class StockPositionProps { 
    getStock: any; 
    index: number = 1; 
    position: Position | null = null; 
    className?: string = `stockPositionComponent`; 
}

export default function StockPostion({ 
    position, 
    getStock, 
    index = 1, 
    className = `stockPositionComponent`, 
}: StockPositionProps) {
    let { stocks } = useContext<any>(StateGlobals);
    let [pos, setPos] = useState<Position | null>(position);
    let [stock, setStock] = useState<StockModel | null>(null);
    let [stockAlignmentCenter, ] = useState(stockTableAlignmentCenter);
    const isMergedPosition = (position: Position | null) => position != null && position?.merged && Array.isArray(position?.merged) && position?.merged?.length > 1;
    useEffect(() => {
        if (!pos || pos == null) setPos(position);
        if (!stocks || !stocks?.length || stocks?.length == 0) return;
        if (pos && stock == null) {
            let stk: StockModel = getStock(pos);
            if (stk) {
                setStock(stk);
                setPos(prevPos => prevPos && ({ ...prevPos?.updateFromPrices(Number(stk?.price)), stock: stk, } as Position));
            }
        }
    }, [stocks]);
    return (
        <div className={`stockPositionContainer stockTableRow stockTableRowCols flex gap10 alignCenter ${className} ${isMergedPosition(pos) ? `mergedPosition` : `singlePosition`}`}>
            <div className={`stockPositionStat width100 flex gap5 column`}>
                <div className={`stockPositionStatLabel`}>
                    <strong><span className={`main`}>({index + 1}) </span> <span style={{ marginLeft: 5 }}>Stock</span></strong> 
                    <strong className={`stockStat`}>
                        <i><span className={`main`}>Low</span> <IconText dollarSign number={stock?.low} /></i>
                    </strong>
                    <strong className={`stockStat`}>
                        <i><span className={`main`}>High</span> <IconText dollarSign number={stock?.high} /></i>
                    </strong>
                    <strong className={`stockStat`}>
                        <i><span className={`main`}>YearL</span> <IconText dollarSign number={stock?.yearLow} /></i>
                    </strong>
                    <strong className={`stockStat`}>
                        <i><span className={`main`}>YearH</span> <IconText dollarSign number={stock?.yearHigh} /></i>
                    </strong>
                    <strong className={`stockStat`}>
                        <i><span className={`main`}>Upd</span> <>{stock?.updates}</></i>
                    </strong>
                    {stock?.dividend && stock?.dividend > 0 ? (
                        <strong className={`stockStat`}>
                            <i><span className={`main`}>Div</span> <IconText dollarSign number={stock?.dividend} /></i>
                        </strong>
                    ) : <></>}
                    {/* <strong className={`stockStat stockStatLastUpdated`}>
                        <i><span className={`main`}>Last</span> <>{stock?.lastUpdate}</></i>
                    </strong> */}
                </div>
                <div className={`stockPositionStart stockPositionStatValue stockColValue subMetric`}>
                    <Stock 
                        {...getStock(pos)} 
                        symbol={pos?.symbol}
                        linkClass={stockAlignmentCenter ? `` : `justifyStart`}  
                        className={`stockPosition stkPos ${stockAlignmentCenter ? `w100 minwunset` : ``}`} 
                    />
                        {/* <strong className={`stockStat`}>
                            <i><span className={`main`}>Upd</span> <>{stock?.lastUpdate}</></i>
                        </strong> */}
                    {/* </Stock> */}
                    {pos?.type == Types.RobinhoodStockPosition && (
                       <div className={`robinhoodStockPositionAccountTypes`}>
                            {pos?.merged?.map((mp, mi) => (
                                <div key={mi} className={`badge positionAccountType`} style={{ marginLeft: 0, fontSize: `0.85em` }}>
                                    {mp?.account_type}
                                </div>
                            ))}
                       </div>
                    )}
                </div>
            </div>
            <div className={`avgEquityCol stockPositionStat flex gap5 column alignCenter fitMin`}>
                <div className={`stockPositionStatLabel main w100 center`}>
                    <strong>Average Equity</strong> 
                </div>
                <div className={`stockPositionAvgEquityFields stockColMinHeight w100`}>
                    {pos?.merged?.map((mp, mi) => (
                        <div key={mi} className={`stockPositionAvgEquityField stockPositionEnd stockPositionEndQField stockPositionStatValue stockColValue subMetric`}>
                            <div className={`flex alignCenter gap5`}>
                                <span>{mp?.quantity}</span>
                                <span>x</span>
                                <IconText dollarSign number={mp?.average} /> 
                            </div> 
                            <div className={`flex alignCenter gap5`} style={{ marginLeft: 5 }}>
                                = <IconText dollarSign number={mp?.equity} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className={`currentEquityCol stockOrderStat flex gap5 column alignCenter`}>
                <div className={`stockPositionStatLabel main w100 center`}>
                    <strong>Current Equity</strong> 
                </div>
                <div className={`stockPositionQtyFields stockColMinHeight w100`}>
                    {pos?.merged?.map((mp, mi) => (
                        <div key={mi} className={`stockPositionQtyField stockPositionEnd stockPositionEndQField stockPositionStatValue stockColValue subMetric stockPositionProfitLoss gap5`}>
                            <div className={`flex alignCenter gap5`}>
                                <span>{mp?.quantity}</span>
                                <span>x</span>
                                <IconText dollarSign number={stock?.price} /> 
                            </div> 
                            <div className={`flex alignCenter gap5`}>
                                = <IconText dollarSign number={mp?.current} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className={`profitLossCol stockOrderStat flex gap5 column alignCenter`}>
                <div className={`stockPositionStatLabel main w100 center`}>
                    <strong>Profit / Loss</strong> 
                </div>
                <div className={`stockPositionPLFields stockColMinHeight w100`}>
                    {pos?.merged?.map((mp, mi) => (
                        <div key={mi} className={`stockPositionPLField stockPositionEnd stockPositionStatValue stockColValue subMetric stockPositionProfitLoss gap5`}>
                            <div className={`flex alignCenter gap5`}>
                                <IconText dollarSign profitLoss fontWeight={800} number={mp?.totalProfitLoss} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}