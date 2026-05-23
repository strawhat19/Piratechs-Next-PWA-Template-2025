'use client';

import { KeyboardEvent, MouseEvent, ReactNode } from 'react';

type DataDisplayCardProps = {
    selected?: boolean;
    children: ReactNode;
    className?: string;
    onClick?: (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void;
};

export default function DataDisplayCard({
    children,
    selected = false,
    onClick = undefined,
    className = ``,
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
            tabIndex={clickable ? 0 : undefined}
            onKeyDown={handleKeyDown}
            className={`dataDisplayCard ${selected ? `selected` : ``} ${clickable ? `clickable` : ``} ${className}`.trim()}
        >
            {children}
        </article>
    );
}
