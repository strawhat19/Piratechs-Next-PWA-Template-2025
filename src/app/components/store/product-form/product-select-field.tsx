'use client';

import { JSX } from 'react';
import { Button } from '@mui/material';
import MenuTrigger from '../../menu/menu-trigger';
import { ProductCategory, ProductType, ProductStatus } from '@/shared/types/models/Product';
import { KeyboardArrowDown, LocalOffer, Checkroom, Palette, Newspaper, Computer, Draw, Backpack, AutoAwesome, TheaterComedy, ShoppingBag, PushPin, Print, BusinessCenter, Autorenew, Download, CheckCircle, Archive, Cancel, Edit } from '@mui/icons-material';

export const statusColors: Record<ProductStatus, string> = {
    [ProductStatus.Draft]: `var(--links)`,
    [ProductStatus.Unavailable]: `var(--error)`,
    [ProductStatus.Active]: `var(--emerald_neon)`,
    [ProductStatus.Archived]: `var(--soft-silver)`,
};

export const categoryColors: Record<ProductCategory, string> = {
    [ProductCategory.Apparel]: `var(--blueneon)`,
    [ProductCategory.Prints]: `var(--bluelight)`,
    [ProductCategory.Accessories]: `var(--success)`,
    [ProductCategory.Stickers]: `var(--yellow_neon)`,
    [ProductCategory.Digital]: `var(--emerald_neon)`,
    [ProductCategory.CustomArt]: `var(--yellow_neon)`,
    [ProductCategory.Merchandise]: `var(--bluelight)`,
    [ProductCategory.Posters]: `var(--cool_neon_blue)`,
    [ProductCategory.Commissions]: `var(--emerald_neon)`,
    [ProductCategory.Art]: statusColors?.[ProductStatus.Unavailable],
    [ProductCategory.OriginalArt]: statusColors?.[ProductStatus.Unavailable],
};

export const typeColors: Record<ProductType, string> = {
    [ProductType.Print]: categoryColors?.[ProductCategory.Prints],
    [ProductType.Pin]: categoryColors?.[ProductCategory.Stickers],
    [ProductType.Shirt]: categoryColors?.[ProductCategory.Stickers],
    [ProductType.Poster]: categoryColors?.[ProductCategory.Posters],
    [ProductType.Service]: statusColors?.[ProductStatus.Unavailable],
    [ProductType.Digital]: categoryColors?.[ProductCategory.Digital],
    [ProductType.Download]: categoryColors?.[ProductCategory.Apparel],
    [ProductType.Painting]: statusColors?.[ProductStatus.Unavailable],
    [ProductType.Physical]: statusColors?.[ProductStatus.Unavailable],
    [ProductType.Sticker]: categoryColors?.[ProductCategory.Stickers],
    [ProductType.Commission]: categoryColors?.[ProductCategory.Commissions],
    [ProductType.Subscription]: categoryColors?.[ProductCategory.Stickers],
};

// Icon and color mappings for ProductCategory
export const categoryIcons: Record<ProductCategory, JSX.Element> = {
    [ProductCategory.Art]: <Palette fontSize={`small`} htmlColor={categoryColors?.[ProductCategory.Art]} />,
    [ProductCategory.Prints]: <Print fontSize={`small`} htmlColor={categoryColors?.[ProductCategory.Prints]} />,
    [ProductCategory.Digital]: <Computer fontSize={`small`} htmlColor={categoryColors?.[ProductCategory.Digital]} />,
    [ProductCategory.Apparel]: <Checkroom fontSize={`small`} htmlColor={categoryColors?.[ProductCategory.Apparel]} />,
    [ProductCategory.Posters]: <Newspaper fontSize={`small`} htmlColor={categoryColors?.[ProductCategory.Posters]} />,
    [ProductCategory.Commissions]: <Draw fontSize={`small`} htmlColor={categoryColors?.[ProductCategory.Commissions]} />,
    [ProductCategory.Stickers]: <LocalOffer fontSize={`small`} htmlColor={categoryColors?.[ProductCategory.Stickers]} />,
    [ProductCategory.Accessories]: <Backpack fontSize={`small`} htmlColor={categoryColors?.[ProductCategory.Accessories]} />,
    [ProductCategory.OriginalArt]: <AutoAwesome fontSize={`small`} htmlColor={categoryColors?.[ProductCategory.OriginalArt]} />,
    [ProductCategory.CustomArt]: <TheaterComedy fontSize={`small`} htmlColor={categoryColors?.[ProductCategory.CustomArt]} />,
    [ProductCategory.Merchandise]: <ShoppingBag fontSize={`small`} htmlColor={categoryColors?.[ProductCategory.Merchandise]} />,
};

// Icon and color mappings for ProductType
export const typeIcons: Record<ProductType, JSX.Element> = {
    [ProductType.Pin]: <PushPin fontSize={`small`} htmlColor={typeColors?.[ProductType.Pin]} />,
    [ProductType.Print]: <Print fontSize={`small`} htmlColor={typeColors?.[ProductType.Print]} />,
    [ProductType.Shirt]: <Checkroom fontSize={`small`} htmlColor={typeColors?.[ProductType.Shirt]} />,
    [ProductType.Poster]: <Newspaper fontSize={`small`} htmlColor={typeColors?.[ProductType.Poster]} />,
    [ProductType.Digital]: <Computer fontSize={`small`} htmlColor={typeColors?.[ProductType.Digital]} />,
    [ProductType.Painting]: <Palette fontSize={`small`} htmlColor={typeColors?.[ProductType.Painting]} />,
    [ProductType.Physical]: <Backpack fontSize={`small`} htmlColor={typeColors?.[ProductType.Physical]} />,
    [ProductType.Commission]: <Draw fontSize={`small`} htmlColor={typeColors?.[ProductType.Commission]} />,
    [ProductType.Download]: <Download fontSize={`small`} htmlColor={typeColors?.[ProductType.Download]} />,
    [ProductType.Sticker]: <LocalOffer fontSize={`small`} htmlColor={typeColors?.[ProductType.Sticker]} />,
    [ProductType.Service]: <BusinessCenter fontSize={`small`} htmlColor={typeColors?.[ProductType.Service]} />,
    [ProductType.Subscription]: <Autorenew fontSize={`small`} htmlColor={typeColors?.[ProductType.Subscription]} />,
};

// Icon and color mappings for ProductStatus
export const statusIcons: Record<ProductStatus, JSX.Element> = {
    [ProductStatus.Draft]: <Edit fontSize={`small`} htmlColor={statusColors?.[ProductStatus.Draft]} />,
    // [ProductStatus.Draft]: <Drafts fontSize={`small`} htmlColor={statusColors?.[ProductStatus.Draft]} />,
    [ProductStatus.Active]: <CheckCircle fontSize={`small`} htmlColor={statusColors?.[ProductStatus.Active]} />,
    [ProductStatus.Archived]: <Archive fontSize={`small`} htmlColor={statusColors?.[ProductStatus.Archived]} />,
    [ProductStatus.Unavailable]: <Cancel fontSize={`small`} htmlColor={statusColors?.[ProductStatus.Unavailable]} />,
    // [ProductStatus.Pending]: <HourglassTop fontSize={`small`} htmlColor={statusColors?.[ProductStatus.Pending]} />,
};

interface ProductSelectFieldProps {
    label: string;
    value: string;
    options: string[];
    className?: string;
    colors?: Record<string, string>;
    onChange: (value: string) => void;
    icons: Record<string, JSX.Element>;
}

export default function ProductSelectField({
    label,
    value,
    icons,
    colors,
    options,
    onChange,
    className = ``,
}: ProductSelectFieldProps) {
    const filteredOptions = options?.filter(option => option !== value);

    const menuItems = filteredOptions?.map(option => ({
        id: option,
        label: option,
        className: ``,
        icon: icons[option],
        onClick: () => {
            onChange(option);
        },
    }));

    const currentIcon = icons[value];
    const currentColor = colors?.[value];

    return (
        <>
            <div className={`productSelectField ${className}`}>
                <span className={`productFieldLabelText`}>{label}</span>
                <MenuTrigger
                    search={true}
                    id={`${label.toLowerCase().replace(/\s/g, '-')}-menu-trigger`}
                    colors={true}
                    topOffset={0.5}
                    menuItems={menuItems}
                    className={`productSelectDropdown`}
                    targetID={`${label.toLowerCase().replace(/\s/g, '-')}-menu`}
                    renderTrigger={({ id, onClick, onFocus, onType, searchValue }) => (
                        <Button
                            id={id}
                            size={`small`}
                            onClick={onClick}
                            startIcon={currentIcon}
                            endIcon={<KeyboardArrowDown />}
                            className={`productSelectButton tableDropDown`}
                            style={currentColor ? { color: currentColor } : undefined}
                        >
                            <input
                                value={searchValue || value}
                                onClick={(event) => event.stopPropagation()}
                                onFocus={onFocus}
                                onChange={onType}
                                className={`dropDownBtnLabel`}
                                placeholder={value}
                                style={{ border: `none`, background: `transparent`, color: `inherit`, width: `100%` }}
                            />
                        </Button>
                    )}
                />
            </div>
        </>
    );
}
