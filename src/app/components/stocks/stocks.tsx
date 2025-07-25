'use client';

import './stocks.scss';

import { useContext } from 'react';
import { State } from '../container/container';
import SwapyDemo from '../drag-and-drop/swapy/demo/swapy-demo';

export default function Stocks({ className = `stocksComponent` }) {
    const { stocksAcc } = useContext<any>(State);

    const getMetricValueLabel = (metricValue: any) => {
        let metricValueLabel = metricValue; 
        let number_metricValue = parseFloat(metricValue);
        let validNumber = !isNaN(number_metricValue);
        if (validNumber) metricValueLabel = number_metricValue?.toLocaleString(`en-US`);
        return metricValueLabel;
    }

    return (
        <div className={`stocksContainer w75 ${className}`}>
            <div className={`stockMetrics w100`}>
                <div className={`stockMetric`}>
                    Account - Rakib
                    <div className={`subMetric`}>
                        Number - {stocksAcc?.account_number}
                    </div>
                    <div className={`subMetric`}>
                        ID - {stocksAcc?.id}
                    </div>
                </div>
            </div>
            <div className={`stockMetrics`}>
                <div className={`stockMetric`}>
                    Cash 
                    <div className={`subMetric`}>
                        $ {getMetricValueLabel(stocksAcc?.cash) ?? `0.00`}
                    </div>
                </div>
                <div className={`stockMetric`}>
                    Equity
                    <div className={`subMetric`}>
                        $ {getMetricValueLabel(stocksAcc?.equity) ?? `0.00`}
                    </div>
                </div>
                <div className={`stockMetric`}>
                    Buying Power
                    <div className={`subMetric`}>
                        $ {getMetricValueLabel(stocksAcc?.buying_power) ?? `0.00`}
                    </div>
                </div>
            </div>
            <SwapyDemo label={`Stock`} />
        </div>
    )
}