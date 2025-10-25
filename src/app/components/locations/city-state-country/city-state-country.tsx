'use client';

import { useContext } from 'react';
import { constants } from '@/shared/scripts/constants';
import { StateGlobals } from '@/shared/global-context';

export default function CityStateCountry({ city, state, country }: any) {
    let { width } = useContext<any>(StateGlobals);
    return (
        <div className={`locationComponent cityStateCountry`}>
            {city ? `${city}` : ``}{state ? `${city ? `, ` : ``} ${state}` : ``}{width >= constants?.breakpoints?.notebook ? `${(city || state) ? `, ` : ``} ${country}` : ``}
        </div>
    )
}