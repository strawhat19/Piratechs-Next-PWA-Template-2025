import './icon-text.scss';

import { BarChart } from '@mui/icons-material';

export const numberFormatWithCommas = (numberValue: string | number, decimalPlaces: number) => {
    let numberFormatted = numberValue; 
    let parsedNumber = typeof numberValue == `string` ? parseFloat(numberValue) : numberValue;
    let validNumber = !isNaN(parsedNumber);
    if (validNumber) {
        let parsedFloat = decimalPlaces > 0 ? parsedNumber?.toFixed(decimalPlaces) : parsedNumber;
        numberFormatted = parsedNumber > 999 ? parsedNumber?.toLocaleString(`en-US`) + (decimalPlaces > 0 ? `.00` : ``) : parsedFloat;
    }
    return numberFormatted;
}

export default function IconText({ 
    text = ``, 
    number = 0, 
    showIcon = true, 
    decimalPlaces = 2,
    dollarSign = false, 
    className = `iconTextComponent`, 
    icon = <BarChart color={`success`} />, 
}) {
    return (
        <div className={`iconTextContainer fit ${className}`}>
            {text == `` ? <>
                {showIcon ? (
                    dollarSign ? (
                        <strong style={{ color: `var(--success)` }}>
                            $
                        </strong>
                    ) : icon
                ) : <></>} {numberFormatWithCommas(number, decimalPlaces) ?? `0${decimalPlaces > 0 ? `.00` : ``}`}
            </> : <>
                {showIcon ? icon : <></>} {text}
            </>}
        </div>
    )
}