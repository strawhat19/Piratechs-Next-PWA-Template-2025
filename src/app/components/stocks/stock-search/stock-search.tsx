'use client';

import Loader from '../../loaders/loader';
import { useContext, useState } from 'react';
import { State } from '../../container/container';
import CheckboxMulti from '../../autocomplete/checkbox-multi/checkbox-multi';

export default function StockSearch({ loading, stcks }: any) {
    const { stocks } = useContext<any>(State);
    const [stocksToDisplay, setStocksToDisplay] = useState(stcks ?? stocks);
    return (
        <div className={`stocksSearchField`} style={{ paddingBottom: 15 }}>
            {(loading || stocksToDisplay?.length == 0) ? (
                <Loader height={40} label={`Stocks Search Loading`} style={{ [`--animation-delay`]: `${2 * 0.15}s` }} />
            ) : (
                <CheckboxMulti optionsToUse={stocksToDisplay} placeholder={`Stocks (${stocksToDisplay?.length})`} />
            )}
        </div>
    )
}