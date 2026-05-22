'use client';

import { Switch } from '@mui/material';

type ToggleCellProps = {
    value?: boolean;
    checked?: boolean;
    canEdit?: boolean;
    className?: string;
    disabled?: boolean;
    onChange?: (value: boolean) => void;
};

export default function ToggleCell({
    value = false,
    canEdit = true,
    className = ``,
    disabled = false,
    onChange = () => {},
    checked = Boolean(value),
}: ToggleCellProps) {
    const readOnly = disabled || !canEdit;
    const updateChecked = (_event: any, nextChecked: boolean) => {
        if (readOnly) return;
        onChange?.(nextChecked);
    };
    return (
        <div className={`toggleCell ${className}`.trim()}>
            <Switch
                size={`small`}
                checked={checked}
                disabled={readOnly}
                onChange={updateChecked}
                onClick={(event) => { if (!readOnly) event.stopPropagation(); }}
                onMouseDown={(event) => { if (!readOnly) event.stopPropagation(); }}
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
