'use client';

import Stock from '../../stock/stock';
import Img from '@/app/components/image/image';
import IconText from '../../../icon-text/icon-text';
import { constants, stringNoSpaces } from '@/shared/scripts/constants';
import { StateGlobals } from '@/shared/global-context';
import { useContext, useEffect, useState } from 'react';
import { Position } from '@/shared/types/models/stocks/Position';
import { Stock as StockModel } from '@/shared/types/models/stocks/Stock';
import { calcTotalProfitLoss, stockTableAlignmentCenter } from '../../stocks';
import { DataSources, RobinhoodAccountTypes } from '@/shared/types/types';

export class StockPositionProps { 
    index: number = 1; 
    position: Position | null = null; 
    className?: string = `stockPositionComponent`; 
}

export default function StockPostion({ 
    position, 
    index = 1, 
    className = `stockPositionComponent`, 
}: StockPositionProps) {
    let [stock, setStock] = useState<StockModel | null>(null);
    let [stockAlignmentCenter, ] = useState(stockTableAlignmentCenter);
    const { robinhoodAccountTypes, stocks } = useContext<any>(StateGlobals);
    const isMergedPosition = (position: Position | null) => position != null && position?.merged && Array.isArray(position?.merged) && (position?.merged?.length > 1 && robinhoodAccountTypes?.length < 3);
    useEffect(() => {
        let stk: StockModel = stocks?.find((s: StockModel) => s?.symbol?.toUpperCase() == position?.symbol?.toUpperCase()) ?? null;
        if (stk) setStock(stk);
    }, [stocks])
    return (
        <div className={`stockPositionContainer stockTableRow stockTableRowCols flex gap10 alignCenter ${className} ${isMergedPosition(position) ? `mergedPosition ${position?.merged && position?.merged?.length > 2 ? `mergedPositionXL` : ``}` : `singlePosition`}`}>
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
                    {stock?.dividend && stock?.dividend > 0 ? (
                        <strong className={`stockStat`}>
                            <i><span className={`main`}>Div</span> <IconText dollarSign number={stock?.dividend} /></i>
                        </strong>
                    ) : <></>}
                    <strong className={`stockStat stockStatUpdates`}>
                        <i><span className={`main`}>Upd</span> <>{stock?.updates}</></i>
                    </strong>
                    <strong className={`stockStat stockStatUpdates`}>
                        <i><span className={`main`}>Points</span> <>{stock?.tracked_updates}</></i>
                    </strong>
                    <strong className={`stockStat stockStatLastUpdated`}>
                        <i><span className={`main`}>Last</span> <>{stock?.tracked_last_updated}</></i>
                    </strong>
                </div>
                <div className={`stockPositionStart stockPositionStatValue stockColValue subMetric`}>
                    <Stock 
                        {...stock} 
                        symbol={position?.symbol}
                        linkClass={stockAlignmentCenter ? `` : `justifyStart`}  
                        className={`stockPosition stkPos ${stockAlignmentCenter ? `w100 minwunset` : ``}`} 
                    />
                        {/* <strong className={`stockStat`}>
                            <i><span className={`main`}>Price</span> <IconText dollarSign number={stock?.price} /></i>
                        </strong>
                        <strong className={`stockStat`}>
                            <i><span className={`main`}>Upd</span> <>{stock?.updates}</></i>
                        </strong>
                        <strong className={`stockStat`}>
                            <i><span className={`main`}>Last</span> <>{stock?.lastUpdate}</></i>
                        </strong>
                    </Stock> */}
                    <div className={`robinhoodStockPositionAccountTypes`}>
                        {position?.merged && position?.merged?.length > 0 ? (
                            position?.merged?.map((mp, mi) => (
                                !robinhoodAccountTypes?.includes(mp?.account_type) && (
                                    <div key={mi} className={`badge positionAccountType`} style={{ marginLeft: 0, fontSize: `0.85em` }}>
                                        <Img 
                                            width={`11px`} 
                                            height={`11px`} 
                                            alt={`${stringNoSpaces(mp?.account_type)}Logo`} 
                                            className={`${stringNoSpaces(mp?.account_type)}Logo`}
                                            src={mp?.account_type == RobinhoodAccountTypes.alpaca ? (
                                                `/${constants?.images?.logos?.Alpaca}`
                                            ) : `/${constants?.images?.logos?.Robinhood}`} 
                                        /> {mp?.account_type}
                                    </div>
                                )
                            ))
                        ) : (
                            <div className={`badge positionAccountType`} style={{ marginLeft: 0, fontSize: `0.85em` }}>
                                {position?.account_type}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className={`avgEquityCol stockQtyCol stockQtyColCalc stockPositionStat flex gap5 column alignCenter fitMin`}>
                <div className={`stockPositionStatLabel main w100 center`}>
                    <strong>Average Equity</strong> 
                </div>
                <div className={`stockPositionAvgEquityFields stockColMinHeight w100`}>
                    {position?.merged && position?.merged?.length > 0 ? (
                        position?.merged?.map((mp, mi) => (
                            !robinhoodAccountTypes?.includes(mp?.account_type) && (
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
            <div className={`currentEquityCol stockQtyCol stockQtyColCalc stockOrderStat flex gap5 column alignCenter`}>
                <div className={`stockPositionStatLabel main w100 center`}>
                    <strong>Current Equity</strong> 
                </div>
                <div className={`stockPositionQtyFields stockColMinHeight w100`}>
                    {position?.merged && position?.merged?.length > 0 ? (
                        position?.merged?.map((mp, mi) => (
                            !robinhoodAccountTypes?.includes(mp?.account_type) && (
                                <div key={mi} className={`stockPositionQtyField stockPositionEnd stockPositionEndQField stockPositionStatValue stockColValue subMetric stockPositionProfitLoss gap5`}>
                                    <div className={`flex alignCenter gap5`}>
                                        <span>{mp?.quantity}</span>
                                        <span>x</span>
                                        <IconText dollarSign number={stock?.price} /> 
                                    </div> 
                                    <div className={`flex alignCenter gap5`}>
                                        = {stock?.price && <IconText dollarSign number={Number(mp?.quantity * stock?.price)} />}
                                    </div>
                                </div>
                            )
                        ))
                    ) : (
                        <div className={`stockPositionQtyField stockPositionEnd stockPositionEndQField stockPositionStatValue stockColValue subMetric stockPositionProfitLoss gap5`}>
                            <div className={`flex alignCenter gap5`}>
                                <span>{position?.quantity}</span>
                                <span>x</span>
                                <IconText dollarSign number={stock?.price} /> 
                            </div> 
                            <div className={`flex alignCenter gap5`}>
                                = {stock?.price && position?.quantity && <IconText dollarSign number={Number(position?.quantity * stock?.price)} />}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className={`profitLossCol stockQtyCol stockQtyColPL stockOrderStat flex gap5 column alignCenter`}>
                <div className={`stockPositionStatLabel main w100 center`}>
                    <strong>Profit / Loss</strong> 
                </div>
                <div className={`stockPositionPLFields stockColMinHeight w100`}>
                    {position?.merged && position?.merged?.length > 0 ? (
                        position?.merged?.map((mp, mi) => (
                            !robinhoodAccountTypes?.includes(mp?.account_type) && (
                                <div key={mi} className={`stockPositionPLField stockPositionEnd stockPositionStatValue stockColValue subMetric stockPositionProfitLoss gap5`}>
                                    <div className={`flex alignCenter gap5`}>
                                        <IconText dollarSign profitLoss fontWeight={800} number={calcTotalProfitLoss(mp, stock)} />
                                    </div>
                                </div>
                            )
                        ))
                    ) : (
                        <div className={`stockPositionPLField stockPositionEnd stockPositionStatValue stockColValue subMetric stockPositionProfitLoss gap5`}>
                            <div className={`flex alignCenter gap5`}>
                                <IconText dollarSign profitLoss fontWeight={800} number={calcTotalProfitLoss(position, stock)} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}