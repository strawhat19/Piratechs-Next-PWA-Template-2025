'use client';

import Loader from '../../loaders/loader';
import { StateGlobals } from '@/shared/global-context';
import { useContext, useEffect, useState } from 'react';
import CheckboxMulti from '../../autocomplete/checkbox-multi/checkbox-multi';

export default function StockSearch({ loading, stcks, className = `stockSearchComponent` }: any) {
    const { stocks } = useContext<any>(StateGlobals);
    const [stocksToDisplay, setStocksToDisplay] = useState(stcks ?? stocks);

    useEffect(() => {
        setStocksToDisplay(stocksToDisplay);
    }, [])

    return (
        <div className={`stocksSearchField ${className}`}>
            {(!Array.isArray(stocks) || loading || stocksToDisplay?.length == 0) ? (
                <Loader height={40} label={`Stocks Search Loading`} style={{ [`--animation-delay`]: `${2 * 0.15}s` }} />
            ) : (
                <CheckboxMulti optionsToUse={stocksToDisplay} placeholder={`Stocks (${stocksToDisplay?.length})`} />
            )}
        </div>
    )
}