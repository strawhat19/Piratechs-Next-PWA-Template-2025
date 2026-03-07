import './icon-text.scss';

import { BarChart } from '@mui/icons-material';

export const numberFormatWithCommas = (numberValue: string | number, decimalPlaces: number) => {
    let numberFormatted = numberValue; 
    let parsedNumber = typeof numberValue == `string` ? parseFloat(numberValue) : numberValue;
    let validNumber = !isNaN(parsedNumber);
    if (validNumber) {
        let stringNum = parsedNumber?.toLocaleString(`en-US`);
        let parsedFloat = decimalPlaces > 0 ? parsedNumber?.toFixed(decimalPlaces) : parsedNumber;
        numberFormatted = parsedNumber > 999 ? stringNum?.includes(`.`) ? stringNum : (stringNum + (decimalPlaces > 0 ? `.00` : ``)) : parsedFloat;
    }
    return numberFormatted;
}

export default function IconText({ 
    text = ``, 
    number = 0, 
    showIcon = true, 
    fontWeight = 400,
    decimalPlaces = 2,
    dollarSign = false, 
    profitLoss = false,
    className = `iconTextComponent`, 
    icon = <BarChart color={`success`} />, 
}) {
    return (
        <div className={`iconTextContainer fit ${className}`} style={profitLoss ? { fontWeight, color: number > 0 ? `var(--success)` : (number < 0 ? `red` : undefined) } : { fontWeight }}>
            {text == `` ? <>
                {showIcon ? (
                    dollarSign ? (
                        <strong style={{ color: `var(--success)` }}>
                            $
                        </strong>
                    ) : icon
                ) : <></>} {profitLoss ? (number > 0 ? `+` : ``) : ``}{numberFormatWithCommas(number, decimalPlaces) ?? `0${decimalPlaces > 0 ? `.00` : ``}`}
            </> : <>
                {showIcon ? icon : <></>} {text}
            </>}
        </div>
    )
}