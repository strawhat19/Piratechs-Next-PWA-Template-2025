'use client';

import Stock from '../../stock/stock';
import { useContext, useState } from 'react';
import { Types } from '@/shared/types/types';
import IconText from '../../../icon-text/icon-text';
import { StateGlobals } from '@/shared/global-context';
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
    index = 1, 
    className = `stockPositionComponent`, 
}: StockPositionProps) {
    let [stockAlignmentCenter, ] = useState(stockTableAlignmentCenter);
    const { robinhoodAccountTypes } = useContext<any>(StateGlobals);
    const isMergedPosition = (position: Position | null) => position != null && position?.merged && Array.isArray(position?.merged) && (position?.merged?.length > 1 && robinhoodAccountTypes?.length > 1);
    return (
        <div className={`stockPositionContainer stockTableRow stockTableRowCols flex gap10 alignCenter ${className} ${isMergedPosition(position) ? `mergedPosition` : `singlePosition`}`}>
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
                    <strong className={`stockStat stockStatUpdates`}>
                        <i><span className={`main`}>Upd</span> <>{position?.stock?.updates}</></i>
                    </strong>
                    <strong className={`stockStat stockStatLastUpdated`}>
                        <i><span className={`main`}>Last</span> <>{position?.stock?.tracked_last_updated}</></i>
                    </strong>
                </div>
                <div className={`stockPositionStart stockPositionStatValue stockColValue subMetric`}>
                    <Stock 
                        {...position?.stock} 
                        symbol={position?.symbol}
                        linkClass={stockAlignmentCenter ? `` : `justifyStart`}  
                        className={`stockPosition stkPos ${stockAlignmentCenter ? `w100 minwunset` : ``}`} 
                    />
                        {/* <strong className={`stockStat`}>
                            <i><span className={`main`}>Upd</span> <>{position?.stock?.lastUpdate}</></i>
                        </strong> */}
                    {/* </Stock> */}
                    {position?.type == Types.RobinhoodStockPosition && (
                       <div className={`robinhoodStockPositionAccountTypes`}>
                            {position?.merged && position?.merged?.length > 0 ? (
                                position?.merged?.map((mp, mi) => (
                                    robinhoodAccountTypes?.includes(mp?.account_type) && (
                                        <div key={mi} className={`badge positionAccountType`} style={{ marginLeft: 0, fontSize: `0.85em` }}>
                                            {mp?.account_type}
                                        </div>
                                    )
                                ))
                            ) : (
                                <div className={`badge positionAccountType`} style={{ marginLeft: 0, fontSize: `0.85em` }}>
                                    {position?.account_type}
                                </div>
                            )}
                       </div>
                    )}
                </div>
            </div>
            <div className={`avgEquityCol stockPositionStat flex gap5 column alignCenter fitMin`}>
                <div className={`stockPositionStatLabel main w100 center`}>
                    <strong>Average Equity</strong> 
                </div>
                <div className={`stockPositionAvgEquityFields stockColMinHeight w100`}>
                    {position?.merged && position?.merged?.length > 0 ? (
                        position?.merged?.map((mp, mi) => (
                            robinhoodAccountTypes?.includes(mp?.account_type) && (
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
                            )
                        ))
                    ) : (
                        <div className={`stockPositionAvgEquityField stockPositionEnd stockPositionEndQField stockPositionStatValue stockColValue subMetric`}>
                            <div className={`flex alignCenter gap5`}>
                                <span>{position?.quantity}</span>
                                <span>x</span>
                                <IconText dollarSign number={position?.average} /> 
                            </div> 
                            <div className={`flex alignCenter gap5`} style={{ marginLeft: 5 }}>
                                = <IconText dollarSign number={position?.equity} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className={`currentEquityCol stockOrderStat flex gap5 column alignCenter`}>
                <div className={`stockPositionStatLabel main w100 center`}>
                    <strong>Current Equity</strong> 
                </div>
                <div className={`stockPositionQtyFields stockColMinHeight w100`}>
                    {position?.merged && position?.merged?.length > 0 ? (
                        position?.merged?.map((mp, mi) => (
                            robinhoodAccountTypes?.includes(mp?.account_type) && (
                                <div key={mi} className={`stockPositionQtyField stockPositionEnd stockPositionEndQField stockPositionStatValue stockColValue subMetric stockPositionProfitLoss gap5`}>
                                    <div className={`flex alignCenter gap5`}>
                                        <span>{mp?.quantity}</span>
                                        <span>x</span>
                                        <IconText dollarSign number={position?.stock?.price} /> 
                                    </div> 
                                    <div className={`flex alignCenter gap5`}>
                                        = {position?.stock?.price && <IconText dollarSign number={Number(mp?.quantity * position?.stock?.price)} />}
                                    </div>
                                </div>
                            )
                        ))
                    ) : (
                        <div className={`stockPositionQtyField stockPositionEnd stockPositionEndQField stockPositionStatValue stockColValue subMetric stockPositionProfitLoss gap5`}>
                            <div className={`flex alignCenter gap5`}>
                                <span>{position?.quantity}</span>
                                <span>x</span>
                                <IconText dollarSign number={position?.stock?.price} /> 
                            </div> 
                            <div className={`flex alignCenter gap5`}>
                                = {position?.stock?.price && <IconText dollarSign number={Number(position?.quantity * position?.stock?.price)} />}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className={`profitLossCol stockOrderStat flex gap5 column alignCenter`}>
                <div className={`stockPositionStatLabel main w100 center`}>
                    <strong>Profit / Loss</strong> 
                </div>
                <div className={`stockPositionPLFields stockColMinHeight w100`}>
                    {position?.merged && position?.merged?.length > 0 ? (
                        position?.merged?.map((mp, mi) => (
                            robinhoodAccountTypes?.includes(mp?.account_type) && (
                                <div key={mi} className={`stockPositionPLField stockPositionEnd stockPositionStatValue stockColValue subMetric stockPositionProfitLoss gap5`}>
                                    <div className={`flex alignCenter gap5`}>
                                        <IconText dollarSign profitLoss fontWeight={800} number={mp?.totalProfitLoss} />
                                    </div>
                                </div>
                            )
                        ))
                    ) : (
                        <div className={`stockPositionPLField stockPositionEnd stockPositionStatValue stockColValue subMetric stockPositionProfitLoss gap5`}>
                            <div className={`flex alignCenter gap5`}>
                                <IconText dollarSign profitLoss fontWeight={800} number={position?.totalProfitLoss} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}