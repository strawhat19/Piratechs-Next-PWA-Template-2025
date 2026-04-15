import './icon-text.scss';

import { BarChart } from '@mui/icons-material';

export const numberFormatWithCommas = (numberValue: string | number, decimalPlaces: number = 2) => {
  const parsedNumber = typeof numberValue === `string` ? parseFloat(numberValue) : numberValue;
  if (isNaN(parsedNumber)) return numberValue;
  const fixed = parsedNumber.toFixed(decimalPlaces); // always 2 decimals
  const [intPart, decPart] = fixed.split(`.`);
  const formattedInt = Number(intPart).toLocaleString(`en-US`);
  return decPart === `00` ? formattedInt : `${formattedInt}.${decPart}`;
};

export default function IconText({ 
    text = ``, 
    number = 0, 
    showIcon = true, 
    fontWeight = 400,
    decimalPlaces = 2,
    dollarSign = false, 
    profitLoss = false,
    style = { opacity: 1 },
    className = `iconTextComponent`, 
    icon = <BarChart color={`success`} />, 
}) {
    return (
        <div className={`iconTextContainer fit ${className}`} style={profitLoss ? { fontWeight, ...style, color: number > 0 ? `var(--success)` : (number < 0 ? `red` : undefined) } : { fontWeight, ...style, }}>
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