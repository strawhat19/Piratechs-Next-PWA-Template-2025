'use client';

import './selector.scss';

import { ReactNode } from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

export type SelectorOption = {
    color?: string;
    icon?: ReactNode;
    label: ReactNode;
    className?: string;
    disabled?: boolean;
    value: string | number;
    activeButtonBG?: string;
    number?: number | string;
    activeFontColor?: string;
};

type SelectorProps = {
    className?: string;
    ariaLabel?: string;
    size?: `small` | `medium`;
    options?: SelectorOption[];
    value?: string | number | null;
    onChange?: (value: string | number) => void;
};

export default function Selector({
    value = null,
    options = [],
    className = ``,
    size = `small`,
    onChange = () => {},
    ariaLabel = `Selector`,
}: SelectorProps) {
    const handleChange = (_event: any, nextValue: string | number | null) => {
        if (nextValue == null) return;
        onChange(nextValue);
    };

    return (
        <div className={`selectorContainer ${className}`.trim()}>
            <ToggleButtonGroup
                exclusive
                size={size}
                value={value}
                aria-label={ariaLabel}
                onChange={handleChange}
                className={`selectorGroup`}
            >
                {options?.map((option: SelectorOption) => {
                    const optionColor = option?.color || `var(--buttons)`;
                    return (
                        <ToggleButton
                            value={option?.value}
                            key={String(option?.value)}
                            disabled={option?.disabled}
                            className={`selectorButton ${option?.className || ``}`.trim()}
                            sx={{
                                gap: `6px`,
                                fontWeight: 700,
                                // color: white,
                                minHeight: `36px`,
                                color: optionColor,
                                padding: `5px 12px`,
                                textTransform: `none`,
                                minWidth: `fit-content`,
                                backgroundColor: `var(--navy)`,
                                borderColor: option?.activeButtonBG ? option?.activeButtonBG : optionColor,
                                '&.Mui-selected': {
                                    color: option?.activeFontColor ? option?.activeFontColor : `white`,
                                    backgroundColor: option?.activeButtonBG ? option?.activeButtonBG : optionColor,
                                },
                                '&.Mui-selected:hover': {
                                    color: `var(--navy)`,
                                    filter: `brightness(1.06)`,
                                    backgroundColor: optionColor,
                                },
                                '&:hover': {
                                    filter: `brightness(1.12)`,
                                    backgroundColor: `var(--navy)`,
                                },
                            }}
                        >
                            <span className={`selectorButtonContent`}>
                                {option?.icon ? (
                                    <span className={`selectorButtonIcon`}>
                                        {option?.icon}
                                    </span>
                                ) : <></>}
                                <span className={`selectorButtonLabel`}>
                                    <span className={`selectorButtonText`}>
                                        {option?.label}
                                    </span>
                                    {option?.number && Number(option?.number) > 0 && (
                                        <span className={`selectorButtonNumber`}>
                                            ({option?.number})
                                        </span>
                                    )}
                                </span>
                            </span>
                        </ToggleButton>
                    );
                })}
            </ToggleButtonGroup>
        </div>
    );
}
