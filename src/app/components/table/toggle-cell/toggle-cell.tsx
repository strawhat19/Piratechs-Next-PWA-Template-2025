'use client';

import { Switch } from '@mui/material';

type ToggleCellProps = {
    value?: boolean;
    className?: string;
    disabled?: boolean;
    canEdit?: boolean;
    onChange?: (value: boolean) => void;
};

export default function ToggleCell({
    value = false,
    canEdit = true,
    className = ``,
    disabled = false,
    onChange = () => {},
}: ToggleCellProps) {
    const checked = Boolean(value);
    const readOnly = disabled || !canEdit;
    const updateChecked = (_event: any, nextChecked: boolean) => {
        if (readOnly) return;
        onChange?.(nextChecked);
    };
    return (
        <div
            className={`toggleCell ${className}`.trim()}
        >
            <Switch
                size={`small`}
                checked={checked}
                disabled={readOnly}
                onClick={(event) => { if (!readOnly) event.stopPropagation(); }}
                onMouseDown={(event) => { if (!readOnly) event.stopPropagation(); }}
                onChange={updateChecked}
                slotProps={{ input: { [`data-row-click-ignore`]: `true` } as any }}
                sx={{
                    m: 0,
                    '& .MuiSwitch-switchBase.Mui-checked': {
                        color: `var(--green_neon)`,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: `var(--green_neon)`,
                    },
                }}
            />
        </div>
    );
}
