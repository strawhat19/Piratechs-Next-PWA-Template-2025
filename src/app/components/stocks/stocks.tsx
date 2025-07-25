'use client';

import './stocks.scss';

import Loader from '../loaders/loader';
import { State } from '../container/container';
import { useContext, useEffect, useState } from 'react';
import { apiRoutes, getAPIServerData } from '@/shared/scripts/constants';
import IconText from '../icon-text/icon-text';

export default function Stocks({ className = `stocksComponent` }) {
    const { stocksAcc, setStocksAcc } = useContext<any>(State);

    const [loading, setLoading] = useState(true);

    const refreshStocksAccount = () => {
        let apiServerRoute = apiRoutes?.stocks?.routes?.account;
        getAPIServerData(apiServerRoute)?.then(acc => {
            setStocksAcc(acc);
            setLoading(false);
            console.log(`Account`, acc);
        });
    }

    useEffect(() => {
        refreshStocksAccount();
    }, [])

    return (
        <div className={`stocksContainer w75 ${className}`}>
            {loading ? <Loader height={250} label={`Account Loading`} /> : <>
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
                            <IconText dollarSign number={stocksAcc?.cash} />
                        </div>
                    </div>
                    <div className={`stockMetric`}>
                        <strong>Equity</strong>
                        <div className={`subMetric`}>
                            <IconText dollarSign number={stocksAcc?.equity} />
                        </div>
                    </div>
                    <div className={`stockMetric`}>
                        <strong>Portfolio Value</strong> 
                        <div className={`subMetric`}>
                            <IconText dollarSign number={stocksAcc?.portfolio_value} />
                        </div>
                    </div>
                    <div className={`stockMetric`}>
                        <strong>Buying Power</strong> 
                        <div className={`subMetric`}>
                            <IconText dollarSign number={stocksAcc?.buying_power} />
                        </div>
                    </div>
                </div>
            </>}
        </div>
    )
}