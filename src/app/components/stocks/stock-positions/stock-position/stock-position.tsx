'use client';

import { useState } from 'react';
import Stock from '../../stock/stock';
import { Types } from '@/shared/types/types';
import IconText from '../../../icon-text/icon-text';
import { stockTableAlignmentCenter } from '../../stocks';
import { Position } from '@/shared/types/models/stocks/Position';

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
    let [stockAlignmentCenter, ] = useState(stockTableAlignmentCenter);
    return (
        <div className={`stockPositionContainer stockTableRow stockTableRowCols flex gap10 alignCenter ${className}`}>
            <div className={`stockPositionStat width100 flex gap5 column`}>
                <div className={`stockPositionStatLabel`}>
                    <strong><span className={`main`}>({index + 1}) </span> <span style={{ marginLeft: 5 }}>Stock</span></strong> 
                    <strong className={`stockStat`}>
                        <i><span className={`main`}>Low</span> <IconText dollarSign number={position?.stock?.low} /></i>
                    </strong>
                    <strong className={`stockStat`}>
                        <i><span className={`main`}>High</span> <IconText dollarSign number={position?.stock?.high} /></i>
                    </strong>
                    <strong className={`stockStat`}>
                        <i><span className={`main`}>YearL</span> <IconText dollarSign number={position?.stock?.yearLow} /></i>
                    </strong>
                    <strong className={`stockStat`}>
                        <i><span className={`main`}>YearH</span> <IconText dollarSign number={position?.stock?.yearHigh} /></i>
                    </strong>
                    {position?.stock?.dividend && position?.stock?.dividend > 0 ? (
                        <strong className={`stockStat`}>
                            <i><span className={`main`}>Div</span> <IconText dollarSign number={position?.stock?.dividend} /></i>
                        </strong>
                    ) : <></>}
                </div>
                <div className={`stockPositionStatValue stockColValue subMetric`}>
                    <Stock 
                        {...getStock(position)} 
                        symbol={position?.symbol}
                        linkClass={stockAlignmentCenter ? `` : `justifyStart`}  
                        className={`stockPosition stkPos ${stockAlignmentCenter ? `w100 minwunset` : ``}`} 
                    />
                    {position?.type == Types.RobinhoodStockPosition && (
                        <div className={`badge positionAccountType`} style={{ marginLeft: 10, fontSize: `0.85em` }}>
                            {position?.account_type}
                        </div>
                    )}
                </div>
            </div>
            <div className={`avgEquityCol stockPositionStat flex gap5 column alignCenter fitMin`}>
                <div className={`stockPositionStatLabel main`}>
                    <strong>Average Equity</strong> 
                </div>
                <div className={`stockPositionStatValue stockColValue subMetric`}>
                    <div className={`flex alignCenter gap5`}>
                        <span>{position?.quantity}</span>
                        <span>x</span>
                        <IconText dollarSign number={position?.average} /> 
                    </div> 
                    <div className={`flex alignCenter gap5`} style={{ marginLeft: 5 }}>
                        = <IconText dollarSign number={position?.equity} />
                    </div>
                </div>
            </div>
            <div className={`currentEquityCol stockOrderStat flex gap5 column alignCenter`}>
                <div className={`stockPositionStatLabel main`}>
                    <strong>Current Equity</strong> 
                </div>
                <div className={`stockPositionStatValue stockColValue subMetric stockPositionProfitLoss gap5`}>
                    <div className={`flex alignCenter gap5`}>
                        <span>{position?.quantity}</span>
                        <span>x</span>
                        <IconText dollarSign number={position?.price} /> 
                    </div> 
                    <div className={`flex alignCenter gap5`}>
                        = <IconText dollarSign number={position?.current} />
                    </div>
                </div>
            </div>
            <div className={`profitLossCol stockOrderStat flex gap5 column alignCenter`}>
                <div className={`stockPositionStatLabel main`}>
                    <strong>Profit / Loss</strong> 
                </div>
                <div className={`stockPositionStatValue stockColValue subMetric stockPositionProfitLoss gap5`}>
                    <div className={`flex alignCenter gap5`}>
                        <IconText dollarSign profitLoss fontWeight={800} number={position?.totalProfitLoss} />
                    </div>
                </div>
            </div>
        </div>
    )
}