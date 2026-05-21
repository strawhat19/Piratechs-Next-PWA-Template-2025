'use client';

import { JSX } from 'react';
import { Button } from '@mui/material';
import MenuTrigger from '../../menu/menu-trigger';
import { ProductCategory, ProductType, ProductStatus } from '@/shared/types/models/Product';
import { KeyboardArrowDown, LocalOffer, Checkroom, Palette, Newspaper, Computer, Draw, Backpack, AutoAwesome, TheaterComedy, ShoppingBag, PushPin, Print, BusinessCenter, Autorenew, Download, CheckCircle, HourglassTop, Archive, Cancel, Drafts } from '@mui/icons-material';

export const statusColors: Record<ProductStatus, string> = {
    [ProductStatus.Draft]: `var(--links)`,
    [ProductStatus.Active]: `var(--success)`,
    [ProductStatus.Unavailable]: `var(--error)`,
    [ProductStatus.Archived]: `var(--soft-silver)`,
};

export const categoryColors: Record<ProductCategory, string> = {
    [ProductCategory.Art]: `var(--pink_neon)`,
    [ProductCategory.Apparel]: `var(--blueneon)`,
    [ProductCategory.Prints]: `var(--bluelight)`,
    [ProductCategory.Paintings]: `var(--emerald_neon)`,
    [ProductCategory.Digital]: `var(--emerald_neon)`,
    [ProductCategory.Accessories]: `var(--success)`,
    [ProductCategory.Stickers]: `var(--yellow_neon)`,
    [ProductCategory.OriginalArt]: `var(--pink_neon)`,
    [ProductCategory.CustomArt]: `var(--yellow_neon)`,
    [ProductCategory.Merchandise]: `var(--bluelight)`,
    [ProductCategory.Posters]: `var(--cool_neon_blue)`,
    [ProductCategory.Commissions]: `var(--emerald_neon)`,
};

export const typeColors: Record<ProductType, string> = {
    [ProductType.Pin]: categoryColors?.[ProductCategory.Stickers],
    [ProductType.Shirt]: categoryColors?.[ProductCategory.Apparel],
    [ProductType.Service]: `var(--pink_neon)`,
    [ProductType.Print]: categoryColors?.[ProductCategory.Prints],
    [ProductType.Painting]: categoryColors?.[ProductCategory.Paintings],
    [ProductType.Digital]: categoryColors?.[ProductCategory.Digital],
    [ProductType.Download]: `var(--blueneon)`,
    [ProductType.Physical]: categoryColors?.[ProductCategory.Art],
    [ProductType.Sticker]: categoryColors?.[ProductCategory.Stickers],
    [ProductType.Poster]: categoryColors?.[ProductCategory.Posters],
    [ProductType.Commission]: categoryColors?.[ProductCategory.Commissions],
    [ProductType.Subscription]: `var(--emerald_neon)`,
};

// Icon and color mappings for ProductCategory
export const categoryIcons: Record<ProductCategory, JSX.Element> = {
    [ProductCategory.Art]: <Palette fontSize={`small`} htmlColor={categoryColors?.[ProductCategory.Art]} />,
    [ProductCategory.Apparel]: <Checkroom fontSize={`small`} htmlColor={categoryColors?.[ProductCategory.Apparel]} />,
    [ProductCategory.Stickers]: <LocalOffer fontSize={`small`} htmlColor={categoryColors?.[ProductCategory.Stickers]} />,
    [ProductCategory.Paintings]: <Palette fontSize={`small`} htmlColor={categoryColors?.[ProductCategory.Paintings]} />,
    [ProductCategory.Prints]: <Print fontSize={`small`} htmlColor={categoryColors?.[ProductCategory.Prints]} />,
    [ProductCategory.Posters]: <Newspaper fontSize={`small`} htmlColor={categoryColors?.[ProductCategory.Posters]} />,
    [ProductCategory.Digital]: <Computer fontSize={`small`} htmlColor={categoryColors?.[ProductCategory.Digital]} />,
    [ProductCategory.Commissions]: <Draw fontSize={`small`} htmlColor={categoryColors?.[ProductCategory.Commissions]} />,
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
    [ProductType.Sticker]: <LocalOffer fontSize={`small`} htmlColor={typeColors?.[ProductType.Sticker]} />,
    [ProductType.Digital]: <Computer fontSize={`small`} htmlColor={typeColors?.[ProductType.Digital]} />,
    [ProductType.Service]: <BusinessCenter fontSize={`small`} htmlColor={typeColors?.[ProductType.Service]} />,
    [ProductType.Painting]: <Palette fontSize={`small`} htmlColor={typeColors?.[ProductType.Painting]} />,
    [ProductType.Physical]: <Backpack fontSize={`small`} htmlColor={typeColors?.[ProductType.Physical]} />,
    [ProductType.Commission]: <Draw fontSize={`small`} htmlColor={typeColors?.[ProductType.Commission]} />,
    [ProductType.Subscription]: <Autorenew fontSize={`small`} htmlColor={typeColors?.[ProductType.Subscription]} />,
    [ProductType.Download]: <Download fontSize={`small`} htmlColor={typeColors?.[ProductType.Download]} />,
};

// Icon and color mappings for ProductStatus
export const statusIcons: Record<ProductStatus, JSX.Element> = {
    [ProductStatus.Draft]: <Drafts fontSize={`small`} htmlColor={statusColors?.[ProductStatus.Draft]} />,
    [ProductStatus.Active]: <CheckCircle fontSize={`small`} htmlColor={statusColors?.[ProductStatus.Active]} />,
    // [ProductStatus.Pending]: <HourglassTop fontSize={`small`} htmlColor={statusColors?.[ProductStatus.Pending]} />,
    [ProductStatus.Archived]: <Archive fontSize={`small`} htmlColor={statusColors?.[ProductStatus.Archived]} />,
    [ProductStatus.Unavailable]: <Cancel fontSize={`small`} htmlColor={statusColors?.[ProductStatus.Unavailable]} />,
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
