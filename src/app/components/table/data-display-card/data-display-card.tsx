'use client';

import { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { defaultCheckboxAlignmentStart } from '../table-grid/table-grid';

type DataDisplayCardProps = {
    className?: string;
    selected?: boolean;
    children: ReactNode;
    checkboxAlignmentStart?: boolean;
    onClick?: (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void;
};

export default function DataDisplayCard({
    children,
    className = ``,
    selected = false,
    onClick = undefined,
    checkboxAlignmentStart = defaultCheckboxAlignmentStart,
}: DataDisplayCardProps) {
    const clickable = typeof onClick == `function`;
    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (!clickable || ![`Enter`, ` `].includes(event?.key)) return;
        event.preventDefault();
        onClick?.(event);
    };

    return (
        <article
            onClick={onClick}
            onKeyDown={handleKeyDown}
            tabIndex={clickable ? 0 : undefined}
            className={`dataDisplayCard ${selected ? `selected` : ``} ${clickable ? `clickable` : ``} ${checkboxAlignmentStart ? `checkboxAlignmentStart` : `checkboxAlignmentEnd`} ${className}`.trim()}
        >
            {children}
        </article>
    );
}
