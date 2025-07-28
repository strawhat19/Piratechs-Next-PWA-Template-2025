import IconText from '@/app/components/icon-text/icon-text';
import CityStateCountry from '@/app/components/locations/city-state-country/city-state-country';

export default function StockDetails({ city, state, country, employees, ceo, high, low }: any) {
    return (
        <div className={`stockDetails w100 flex column gap5`}>
            <div className={`stockRow w100 flex gap15`}>
                <div className={`stockRow flex column gap5`}>
                    <strong>52w Low</strong>
                    <IconText dollarSign number={low} className={`stockDetailPrice`} />
                </div>
                <div className={`stockRow flex column gap5`}>
                    <strong>52w High</strong>
                    <IconText dollarSign number={high} className={`stockDetailPrice`} />
                </div>
            </div>
            <div className={`stockRow flex column gap5`}>
                <strong>Location</strong>
                <CityStateCountry {...{ city, state, country }} />
            </div>
            <div className={`stockRow w100 flex gap15`}>
                <div className={`stockRow flex column gap5`}>
                    <strong>CEO</strong>
                    <div>{ceo && ceo != `` ? ceo : `Unknown`}</div>
                </div>
                <div className={`stockRow flex column gap5`}>
                    <strong>Employees</strong>
                    <IconText number={employees} showIcon={false} decimalPlaces={0} />
                </div>
            </div>
        </div>
    )
}