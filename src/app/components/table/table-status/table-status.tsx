import { Circle } from '@mui/icons-material';

export const tableStatusGreen = `var(--green_neon)`;
export const tableStatusGray = `rgba(255,255,255,0.35)`;
export const tableStatusRed = `red`;

export default function TableStatus({ label = ``, color = tableStatusGray, className = ``, wrap = false }: any) {
    const rowStatus = (
        <div className={`rowStatus`}>
            <span className={`statusDotWrap`}>
                <Circle
                    className={`statusDot`}
                    style={{
                        color,
                        filter: color == tableStatusGreen ? `drop-shadow(0 0 6px var(--forest_neon_green))` : `none`,
                    }}
                />
            </span>
            <span className={`statusText`}>
                {label}
            </span>
        </div>
    );
    return wrap ? <div className={`actionsCell tableStatusCell ${className}`}>{rowStatus}</div> : rowStatus;
}
