'use client';

import { useContext } from 'react';
import IconText from '../../icon-text/icon-text';
import { constants } from '@/shared/scripts/constants';
import { StateGlobals } from '@/shared/global-context';

export default function StockAccount() {
    const { width, stocksAcc } = useContext<any>(StateGlobals);
    return <>
        <div className={`stockMetrics stockMetrics_account w100`}>
            <div className={`stockMetric stockMetric_account`}>
                <strong>Account</strong>
                <div className={`subMetric flex column gap5`}>
                    Rakib
                    {width >= constants?.breakpoints?.mobile && <>
                        <div className={`subMetric flex column gap5`}>
                            <strong>Number</strong>
                            <div className={`subMetric`}>
                                {stocksAcc?.account_number}
                            </div>
                        </div>
                        <div className={`subMetric flex column gap5`}>
                            <strong>ID</strong>
                            <div className={`subMetric`}>
                                {stocksAcc?.id}
                            </div>
                        </div>
                    </>}
                </div>
            </div>
        </div>

        <div className={`stockMetrics stockMetrics_stats`}>
            <div className={`stockMetric`}>
                <strong className={`stockMetricLabel`}>
                    Cash
                </strong> 
                <div className={`subMetric`}>
                    <IconText dollarSign number={stocksAcc?.cash} />
                </div>
            </div>
            <div className={`stockMetric`}>
                <strong className={`stockMetricLabel`}>
                    Equity
                </strong>
                <div className={`subMetric`}>
                    <IconText dollarSign number={stocksAcc?.equity} />
                </div>
            </div>
            <div className={`stockMetric`}>
                <strong className={`stockMetricLabel`}>
                    Portfolio Value
                </strong> 
                <div className={`subMetric`}>
                    <IconText dollarSign number={stocksAcc?.portfolio_value} />
                </div>
            </div>
            <div className={`stockMetric`}>
                <strong className={`stockMetricLabel`}>
                    Buying Power
                </strong> 
                <div className={`subMetric`}>
                    <IconText dollarSign number={stocksAcc?.buying_power} />
                </div>
            </div>
            <div className={`stockMetric`}>
                <strong className={`stockMetricLabel`}>
                    Last Equity
                </strong> 
                <div className={`subMetric`}>
                    <IconText dollarSign number={stocksAcc?.last_equity} />
                </div>
            </div>
            <div className={`stockMetric`}>
                <strong className={`stockMetricLabel`}>
                    Options Buying Power
                </strong> 
                <div className={`subMetric`}>
                    <IconText dollarSign number={stocksAcc?.options_buying_power} />
                </div>
            </div>
        </div>
    </>
}