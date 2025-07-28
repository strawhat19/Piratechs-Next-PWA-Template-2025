'use client';

import './stocks.scss';

import Loader from '../loaders/loader';
import IconText from '../icon-text/icon-text';
import { State } from '../container/container';
import { useContext, useEffect, useState } from 'react';
import CheckboxMulti from '../autocomplete/checkbox-multi/checkbox-multi';
import { apiRoutes, constants, getAPIServerData, getRealStocks } from '@/shared/scripts/constants';

export default function Stocks({ className = `stocksComponent` }) {
    const { width, stocks, stocksAcc, setStocksAcc } = useContext<any>(State);

    const [loading, setLoading] = useState(true);

    const refreshStocksAccount = () => {
        if (getRealStocks) {
            let apiServerRoute = apiRoutes?.stocks?.routes?.account;
            getAPIServerData(apiServerRoute)?.then(acc => {
                setStocksAcc(acc);
                setLoading(false);
                console.log(`Account`, acc);
            });
        } else {
            setLoading(false);
            console.log(`Account`, stocksAcc);
        }
    }

    useEffect(() => {
        refreshStocksAccount();
    }, [])

    return (
        <div className={`stocksContainer w75 ${className}`}>

            <div className={`stocksSearchField`} style={{ paddingBottom: 15 }}>
                {(loading || stocks?.length == 0) ? (
                    <Loader height={40} label={`Stocks Search Loading`} style={{ [`--animation-delay`]: `${2 * 0.15}s` }} />
                ) : (
                    <CheckboxMulti optionsToUse={stocks} placeholder={`Stocks`} />
                )}
            </div>

            {loading ? <Loader height={250} label={`Account Loading`} /> : <>
                <div className={`stockMetrics w100`}>
                    <div className={`stockMetric`}>
                        <strong>Account</strong>
                        <div className={`subMetric flex column gap5`}>
                            Rakib
                            {width >= constants.breakpoints.mobile && <>
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
                    <div className={`stockMetric`}>
                        <strong>Last Equity</strong> 
                        <div className={`subMetric`}>
                            <IconText dollarSign number={stocksAcc?.last_equity} />
                        </div>
                    </div>
                    <div className={`stockMetric`}>
                        <strong>Options Buying Power</strong> 
                        <div className={`subMetric`}>
                            <IconText dollarSign number={stocksAcc?.options_buying_power} />
                        </div>
                    </div>
                </div>
            </>}
        </div>
    )
}