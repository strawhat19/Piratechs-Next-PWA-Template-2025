import { ChangeEvent, FocusEvent, MouseEvent, ReactNode, useMemo, useState } from 'react';
import Menu from './menu';

interface MenuTriggerProps {
    id?: string;
    search?: boolean;
    colors?: boolean;
    topOffset?: number;
    className?: string;
    menuItems?: any[];
    targetID?: string;
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

export default function MenuTrigger({
    id = `menu-trigger`,
    search = false,
    colors = false,
    topOffset = 0,
    className = ``,
    menuItems = [],
    targetID = `menu-target`,
    searchValue = ``,
    searchKeys = [`label`],
    renderTrigger,
    onSearchChange = () => {},
}: MenuTriggerProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [internalSearchValue, setInternalSearchValue] = useState(``);
    const open = anchorEl != null;
    const valueToUse = searchValue || internalSearchValue;
    const onClose = () => {
        setAnchorEl(null);
        if (search && !searchValue) setInternalSearchValue(``);
    };
    const openAt = (element: HTMLElement) => {
        setAnchorEl(element);
    };
    const onClick = (event: MouseEvent<HTMLElement>) => {
        event.stopPropagation();
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
    const normalizedSearch = valueToUse?.toLowerCase?.()?.trim?.();
    const filteredMenuItems = useMemo(() => {
        if (!search || !normalizedSearch) return menuItems;
        return menuItems?.filter((item: any) => {
            return searchKeys?.some((key: string) => {
                const current = `${item?.[key] || ``}`?.toLowerCase?.();
                return current?.includes?.(normalizedSearch);
            });
        });
    }, [menuItems, normalizedSearch, search, searchKeys]);
    return (
        <>
            {renderTrigger({ id, open, search, searchValue: valueToUse, onClick, onFocus, onType })}
            <Menu
                open={open}
                colors={colors}
                onClose={onClose}
                targetID={targetID}
                anchorEl={anchorEl}
                menuItems={filteredMenuItems}
                topOffset={topOffset}
                className={className}
            />
        </>
    );
}
