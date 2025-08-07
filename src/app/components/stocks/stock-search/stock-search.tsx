'use client';

import { useContext } from 'react';
import Loader from '../../loaders/loader';
import { State } from '../../container/container';
import CheckboxMulti from '../../autocomplete/checkbox-multi/checkbox-multi';

export default function StockSearch({ loading }: any) {
    const { stocks } = useContext<any>(State);
    return (
        <div className={`stocksSearchField`} style={{ paddingBottom: 15 }}>
            {(loading || stocks?.length == 0) ? (
                <Loader height={40} label={`Stocks Search Loading`} style={{ [`--animation-delay`]: `${2 * 0.15}s` }} />
            ) : (
                <CheckboxMulti optionsToUse={stocks} placeholder={`Stocks (${stocks?.length})`} />
            )}
        </div>
    )
}