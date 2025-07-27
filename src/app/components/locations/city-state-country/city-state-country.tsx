'use client';

import { useContext } from 'react';
import { State } from '../../container/container';
import { constants } from '@/shared/scripts/constants';

export default function CityStateCountry({ city, state, country }: any) {
    let { width } = useContext<any>(State);
    return (
        <div className={`locationComponent cityStateCountry`}>
            {city ? `${city}` : ``}{state ? `${city ? `, ` : ``} ${state}` : ``}{width >= constants.breakpoints.notebook ? `${(city || state) ? `, ` : ``} ${country}` : ``}
        </div>
    )
}