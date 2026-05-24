import { ChangeEvent, FocusEvent, MouseEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import Menu from './menu';

interface MenuTriggerProps {
    id?: string;
    search?: boolean;
    colors?: boolean;
    showLabels?: boolean;
    menuItems?: any[];
    onHover?: boolean;
    targetID?: string;
    topOffset?: number;
    className?: string;
    searchValue?: string;
    searchKeys?: string[];
    onSearchChange?: (value: string) => void;
    renderTrigger: (props: {
        id: string;
        open: boolean;
        search: boolean;
        searchValue: string;
        onClick: (event: MouseEvent<HTMLElement>) => void;
        onFocus: (event: FocusEvent<HTMLElement>) => void;
        onType: (event: ChangeEvent<HTMLInputElement>) => void;
    }) => ReactNode;
}

const hoverCloseDelay = 500;
const hoverMinOpenTime = 450;

export default function MenuTrigger({
    renderTrigger,
    topOffset = 0,
    className = ``,
    menuItems = [],
    search = false,
    colors = false,
    showLabels = true,
    onHover = false,
    searchValue = ``,
    id = `menu-trigger`,
    searchKeys = [`label`],
    targetID = `menu-target`,
    onSearchChange = () => {},
}: MenuTriggerProps) {
    const clickOpenRef = useRef(false);
    const menuHoverRef = useRef(false);
    const triggerHoverRef = useRef(false);
    const lastHoverOpenAtRef = useRef(0);
    const hoverCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [internalSearchValue, setInternalSearchValue] = useState(``);
    const open = anchorEl != null;
    const valueToUse = searchValue || internalSearchValue;
    const clearHoverCloseTimer = () => {
        if (hoverCloseTimerRef?.current) clearTimeout(hoverCloseTimerRef.current);
        hoverCloseTimerRef.current = null;
    };
    const onClose = () => {
        clearHoverCloseTimer();
        clickOpenRef.current = false;
        menuHoverRef.current = false;
        triggerHoverRef.current = false;
        setAnchorEl(null);
        if (search && !searchValue) setInternalSearchValue(``);
    };
    const openAt = (element: HTMLElement) => {
        clearHoverCloseTimer();
        if (onHover) lastHoverOpenAtRef.current = Date.now();
        setAnchorEl(element);
    };
    const scheduleHoverClose = () => {
        if (clickOpenRef.current) return;
        clearHoverCloseTimer();
        const recentlyOpenedDelay = hoverMinOpenTime - (Date.now() - lastHoverOpenAtRef.current);
        const closeDelay = Math.max(hoverCloseDelay, recentlyOpenedDelay);
        hoverCloseTimerRef.current = setTimeout(() => {
            if (clickOpenRef.current || triggerHoverRef.current || menuHoverRef.current) return;
            onClose();
        }, closeDelay);
    };
    const onClick = (event: MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        clickOpenRef.current = true;
        openAt(event.currentTarget);
    };
    const onFocus = (event: FocusEvent<HTMLElement>) => {
        openAt(event.currentTarget);
    };
    const onType = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event?.target?.value || ``;
        if (!open) setAnchorEl(event.currentTarget);
        setInternalSearchValue(value);
        onSearchChange(value);
    };
    const onMouseEnter = (event: MouseEvent<HTMLElement>) => {
        if (!onHover) return;
        triggerHoverRef.current = true;
        openAt(event.currentTarget);
    };
    const onMouseLeave = () => {
        if (!onHover) return;
        triggerHoverRef.current = false;
        scheduleHoverClose();
    };
    const onMenuMouseEnter = () => {
        if (!onHover) return;
        menuHoverRef.current = true;
        clearHoverCloseTimer();
    };
    const onMenuMouseLeave = () => {
        if (!onHover) return;
        menuHoverRef.current = false;
        scheduleHoverClose();
    };
    const normalizedSearch = valueToUse?.toLowerCase?.()?.trim?.();
    useEffect(() => () => {
        if (hoverCloseTimerRef?.current) clearTimeout(hoverCloseTimerRef.current);
    }, []);
    const filteredMenuItems = useMemo(() => {
        if (!search || !normalizedSearch) return menuItems;
        return menuItems?.filter((item: any) => {
            return searchKeys?.some((key: string) => {
                const current = `${item?.[key] || ``}`?.toLowerCase?.();
                return current?.includes?.(normalizedSearch);
            });
        });
    }, [menuItems, normalizedSearch, search, searchKeys]);
    const trigger = renderTrigger({ id, open, search, searchValue: valueToUse, onClick, onFocus, onType });
    return (
        <>
            {onHover ? (
                <span className={`menuTriggerHoverWrap`} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
                    {trigger}
                </span>
            ) : trigger}
            <Menu
                open={open}
                colors={colors}
                onClose={onClose}
                onMouseEnter={onHover ? onMenuMouseEnter : undefined}
                onMouseLeave={onHover ? onMenuMouseLeave : undefined}
                targetID={targetID}
                anchorEl={anchorEl}
                topOffset={topOffset}
                className={className}
                menuItems={filteredMenuItems}
                showLabels={showLabels}
            />
        </>
    );
}
