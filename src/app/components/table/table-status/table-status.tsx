import { Tooltip } from '@mui/material';
import { Circle } from '@mui/icons-material';

export const tableStatusRed = `red`;
export const tableStatusGray = `var(--gray)`;
export const tableStatusBlue = `var(--links)`;
export const tableStatusGreen = `var(--green_neon)`;

export const pulsateColors = [ tableStatusGreen, tableStatusRed, tableStatusBlue ];

export default function TableStatus({ title = ``, label = ``, color = tableStatusGray, className = ``, wrap = false }: any) {
    const rowStatus = (
        <Tooltip title={title} arrow>
            <div className={`rowStatus`}>
                <span className={`statusDotWrap ${pulsateColors?.includes(color) ? `pulsate circular` : ``}`}>
                    <Circle
                        className={`statusDot`}
                        style={{
                            color,
                        }}
                    />
                </span>
                <span className={`statusText`}>
                    {label}
                </span>
            </div>
        </Tooltip>
    );
    return wrap ? (
        <Tooltip title={title} arrow>
            <div className={`actionsCell tableStatusCell ${className}`}>
                {rowStatus}
            </div>
        </Tooltip>
    ) : rowStatus;
}
