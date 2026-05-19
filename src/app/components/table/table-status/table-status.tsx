import { Tooltip } from '@mui/material';
import { Circle } from '@mui/icons-material';

export const tableStatusRed = `red`;
export const tableStatusGreen = `var(--green_neon)`;
export const tableStatusGray = `rgba(255,255,255,0.35)`;

export default function TableStatus({ title = ``, label = ``, color = tableStatusGray, className = ``, wrap = false }: any) {
    const rowStatus = (
        <Tooltip title={title} arrow>
            <div className={`rowStatus`}>
                <span className={`statusDotWrap`}>
                    <Circle
                        className={`statusDot`}
                        style={{
                            color,
                            filter: color == tableStatusGreen ? `drop-shadow(0 0 1.5px var(--green_neon))` : `none`,
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
