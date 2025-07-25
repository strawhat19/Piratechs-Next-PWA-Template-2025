'use client';

import './stocks.scss';

import Loader from '../loaders/loader';
import { State } from '../container/container';
import { useContext, useEffect, useState } from 'react';
import { getAPIServerData } from '@/shared/scripts/constants';

export default function Stocks({ className = `stocksComponent` }) {
    const { stocksAcc, setStocksAcc } = useContext<any>(State);

    const [loading, setLoading] = useState(true);

    const refreshStocks = () => {
        console.log(`Refresh Stocks in Development`);
        // let apiServerRoute = apiRoutes?.stocks?.url;
        // getAPIServerData(apiServerRoute)?.then(apiData => {
        //     console.log(`API Data`, apiData);
        // });
    }

    const refreshStocksAccount = () => {
        getAPIServerData()?.then(acc => {
            setStocksAcc(acc);
            setLoading(false);
        });
    }

    const getMetricValueLabel = (metricValue: any) => {
        let metricValueLabel = metricValue; 
        let number_metricValue = parseFloat(metricValue);
        let validNumber = !isNaN(number_metricValue);
        if (validNumber) metricValueLabel = number_metricValue?.toLocaleString(`en-US`);
        return metricValueLabel;
    }

    useEffect(() => {
        refreshStocks();
        refreshStocksAccount();
    }, [])

    return (
        <div className={`stocksContainer w75 ${className}`}>
            {loading ? <Loader height={250} label={`Stocks Loading`} /> : <>
                <div className={`stockMetrics w100`}>
                    <div className={`stockMetric`}>
                        <strong>Account</strong>
                        <div className={`subMetric flex column gap5`}>
                            Rakib
                            <div className={`subMetric`}>
                                <strong>Number</strong>
                                <div className={`subMetric`}>
                                    {stocksAcc?.account_number}
                                </div>
                            </div>
                            <div className={`subMetric`}>
                                <strong>ID</strong>
                                <div className={`subMetric`}>
                                    {stocksAcc?.id}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`stockMetrics`}>
                    <div className={`stockMetric`}>
                        <strong>Cash</strong> 
                        <div className={`subMetric`}>
                            <strong style={{ color: `var(--success)` }}>$</strong> {getMetricValueLabel(stocksAcc?.cash) ?? `0.00`}
                        </div>
                    </div>
                    <div className={`stockMetric`}>
                        <strong>Equity</strong>
                        <div className={`subMetric`}>
                            <strong style={{ color: `var(--success)` }}>$</strong> {getMetricValueLabel(stocksAcc?.equity) ?? `0.00`}
                        </div>
                    </div>
                    <div className={`stockMetric`}>
                        <strong>Buying Power</strong> 
                        <div className={`subMetric`}>
                            <strong style={{ color: `var(--success)` }}>$</strong> {getMetricValueLabel(stocksAcc?.buying_power) ?? `0.00`}
                        </div>
                    </div>
                </div>
            </>}
        </div>
    )
}