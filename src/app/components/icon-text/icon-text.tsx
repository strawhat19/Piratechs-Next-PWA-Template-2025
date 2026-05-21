import './icon-text.scss';

import { BarChart } from '@mui/icons-material';

export const numberFormatWithCommas = (numberValue: string | number, decimalPlaces: number = 2, format: boolean = true) => {
  const parsedNumber = typeof numberValue === `string` ? parseFloat(numberValue) : numberValue;
  if (isNaN(parsedNumber)) return numberValue;
  const fixed = (parsedNumber ?? 0)?.toFixed(decimalPlaces); // always 2 decimals
  const [intPart, decPart] = fixed.split(`.`);
  const formattedInt = Number(intPart).toLocaleString(`en-US`);
  if (decimalPlaces <= 0 || decPart == undefined) return formattedInt;
  return (format && decPart === `00`) ? formattedInt : `${formattedInt}.${decPart}`;
};

export default function IconText({ 
    text = ``, 
    number = 0, 
    format = true,
    showIcon = true, 
    fontWeight = 400,
    decimalPlaces = 2,
    dollarSign = false, 
    profitLoss = false,
    style = { opacity: 1 } as any,
    className = `iconTextComponent`, 
    dollarSignColor = `var(--success)`,
    zeroColor = `var(--error)`,
    icon = <BarChart color={`success`} />, 
}) {
    const numericValue = Number(number || 0);
    const isZeroValue = Number.isFinite(numericValue) && numericValue == 0;
    const resolvedStyle = profitLoss ? { fontWeight, ...style, color: numericValue > 0 ? `var(--success)` : (numericValue < 0 ? `red` : zeroColor) } : { fontWeight, ...style, color: isZeroValue ? zeroColor : style?.color };
    const resolvedDollarSignColor = isZeroValue ? zeroColor : dollarSignColor;
    return (
        <div className={`iconTextContainer fit ${className}`} style={resolvedStyle}>
            {text == `` ? <>
                {showIcon ? (
                    dollarSign ? (
                        <strong style={{ color: resolvedDollarSignColor }}>
                            $
                        </strong>
                    ) : icon
                ) : <></>} {profitLoss ? (number > 0 ? `+` : ``) : ``}{numberFormatWithCommas(number, decimalPlaces, format) ?? `0${decimalPlaces > 0 ? `.00` : ``}`}
            </> : <>
                {showIcon ? icon : <></>} {text}
            </>}
        </div>
    )
}
