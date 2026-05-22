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
    zeroColor = `var(--error)`,
    style = { opacity: 1 } as any,
    defaultDollarColor = `success`, 
    className = `iconTextComponent`, 
    icon = <BarChart color={defaultDollarColor} />,
    defaultDlrColor = `var(--${defaultDollarColor})`,
    dollarSignColor = defaultDlrColor,
}: any) {
    const numericValue = Number(number || 0);
    const isZeroValue = Number.isFinite(numericValue) && numericValue == 0;
    const resolvedStyle = profitLoss ? { 
        fontWeight: isZeroValue ? (fontWeight + 200) : fontWeight, 
        ...style, 
        color: numericValue > 0 ? defaultDlrColor : zeroColor, 
    } : { 
        fontWeight: isZeroValue ? (fontWeight + 200) : fontWeight, 
        ...style, 
        color: isZeroValue ? zeroColor : style?.color, 
    };
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
