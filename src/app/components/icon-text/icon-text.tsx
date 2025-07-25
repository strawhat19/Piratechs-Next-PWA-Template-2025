import './icon-text.scss';

import { BarChart } from '@mui/icons-material';

export const numberFormatWithCommas = (numberValue: string | number) => {
    let numberFormatted = numberValue; 
    let parsedNumber = typeof numberValue == `string` ? parseFloat(numberValue) : numberValue;
    let validNumber = !isNaN(parsedNumber);
    if (validNumber) {
        let parsedFloat = parsedNumber?.toFixed(2);
        numberFormatted = parsedNumber > 999 ? parsedNumber?.toLocaleString(`en-US`) + `.00` : parsedFloat;
    }
    return numberFormatted;
}

export default function IconText({ showIcon = true, text = ``, number = 0, dollarSign = false, className = `iconTextComponent`, icon = <BarChart color={`success`} /> }) {
    return (
        <div className={`iconTextContainer fit ${className}`}>
            {text == `` ? <>
                {showIcon && dollarSign ? (
                    <strong style={{ color: `var(--success)` }}>
                        $
                    </strong>
                ) : icon} {numberFormatWithCommas(number) ?? `0.00`}
            </> : <>
                {showIcon ? icon : <></>} {text}
            </>}
        </div>
    )
}