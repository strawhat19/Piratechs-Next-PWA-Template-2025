'use client';

import MenuTrigger from '../../menu/menu-trigger';
import { Button } from '@mui/material';
import { JSX } from 'react';
import { KeyboardArrowDown } from '@mui/icons-material';
import { ProductCategory, ProductType, ProductStatus } from '@/shared/types/models/Product';

// Icon and color mappings for ProductCategory
export const categoryIcons: Record<ProductCategory, JSX.Element> = {
    [ProductCategory.Art]: <span style={{ fontSize: 16 }}>🎨</span>,
    [ProductCategory.Apparel]: <span style={{ fontSize: 16 }}>👕</span>,
    [ProductCategory.Stickers]: <span style={{ fontSize: 16 }}>🏷️</span>,
    [ProductCategory.Paintings]: <span style={{ fontSize: 16 }}>🖼️</span>,
    [ProductCategory.Prints]: <span style={{ fontSize: 16 }}>📄</span>,
    [ProductCategory.Posters]: <span style={{ fontSize: 16 }}>📰</span>,
    [ProductCategory.Graphics]: <span style={{ fontSize: 16 }}>💻</span>,
    [ProductCategory.Commissions]: <span style={{ fontSize: 16 }}>✍️</span>,
    [ProductCategory.Accessories]: <span style={{ fontSize: 16 }}>🎒</span>,
    [ProductCategory.DigitalArt]: <span style={{ fontSize: 16 }}>🖥️</span>,
    [ProductCategory.OriginalArt]: <span style={{ fontSize: 16 }}>✨</span>,
    [ProductCategory.CustomArt]: <span style={{ fontSize: 16 }}>🎭</span>,
    [ProductCategory.Merchandise]: <span style={{ fontSize: 16 }}>🛍️</span>,
};

// Icon and color mappings for ProductType
export const typeIcons: Record<ProductType, JSX.Element> = {
    [ProductType.Pin]: <span style={{ fontSize: 16 }}>📌</span>,
    [ProductType.Print]: <span style={{ fontSize: 16 }}>🖨️</span>,
    [ProductType.Shirt]: <span style={{ fontSize: 16 }}>👕</span>,
    [ProductType.Poster]: <span style={{ fontSize: 16 }}>📰</span>,
    [ProductType.Sticker]: <span style={{ fontSize: 16 }}>🏷️</span>,
    [ProductType.Graphic]: <span style={{ fontSize: 16 }}>🎨</span>,
    [ProductType.Service]: <span style={{ fontSize: 16 }}>💼</span>,
    [ProductType.Digital]: <span style={{ fontSize: 16 }}>💾</span>,
    [ProductType.Painting]: <span style={{ fontSize: 16 }}>🖼️</span>,
    [ProductType.Physical]: <span style={{ fontSize: 16 }}>📦</span>,
    [ProductType.Commission]: <span style={{ fontSize: 16 }}>✍️</span>,
    [ProductType.Subscription]: <span style={{ fontSize: 16 }}>🔄</span>,
    [ProductType.DigitalDownload]: <span style={{ fontSize: 16 }}>⬇️</span>,
};

// Icon and color mappings for ProductStatus
export const statusIcons: Record<ProductStatus, JSX.Element> = {
    [ProductStatus.Draft]: <span style={{ fontSize: 16 }}>📝</span>,
    [ProductStatus.Active]: <span style={{ fontSize: 16 }}>✅</span>,
    [ProductStatus.Pending]: <span style={{ fontSize: 16 }}>⏳</span>,
    [ProductStatus.Archived]: <span style={{ fontSize: 16 }}>🗄️</span>,
    [ProductStatus.Backorder]: <span style={{ fontSize: 16 }}>🔄</span>,
    [ProductStatus.Unavailable]: <span style={{ fontSize: 16 }}>❌</span>,
    [ProductStatus.OutOfStock]: <span style={{ fontSize: 16 }}>😞</span>,
};

// Status colors using SCSS theme variables
export const statusColors: Record<ProductStatus, string> = {
    [ProductStatus.Draft]: `var(--disabled)`,
    [ProductStatus.Active]: `var(--success)`,
    [ProductStatus.Unavailable]: `var(--error)`,
    [ProductStatus.Backorder]: `var(--blueneon)`,
    [ProductStatus.Pending]: `var(--yellow_neon)`,
    [ProductStatus.Archived]: `var(--soft-silver)`,
    [ProductStatus.OutOfStock]: `var(--pink_neon)`,
};

// Category colors using SCSS theme variables
export const categoryColors: Record<ProductCategory, string> = {
    [ProductCategory.Art]: `var(--pink_neon)`,
    [ProductCategory.Apparel]: `var(--blueneon)`,
    [ProductCategory.Prints]: `var(--bluelight)`,
    [ProductCategory.Paintings]: `var(--success)`,
    [ProductCategory.Graphics]: `var(--pink_neon)`,
    [ProductCategory.Accessories]: `var(--success)`,
    [ProductCategory.DigitalArt]: `var(--blueneon)`,
    [ProductCategory.Stickers]: `var(--yellow_neon)`,
    [ProductCategory.OriginalArt]: `var(--pink_neon)`,
    [ProductCategory.CustomArt]: `var(--yellow_neon)`,
    [ProductCategory.Merchandise]: `var(--bluelight)`,
    [ProductCategory.Posters]: `var(--cool_neon_blue)`,
    [ProductCategory.Commissions]: `var(--yellow_neon)`,
};

// Type colors using SCSS theme variables
export const typeColors: Record<ProductType, string> = {
    [ProductType.Pin]: `var(--blueneon)`,
    [ProductType.Shirt]: `var(--blueneon)`,
    [ProductType.Service]: `var(--success)`,
    [ProductType.Print]: `var(--bluelight)`,
    [ProductType.Digital]: `var(--blueneon)`,
    [ProductType.Painting]: `var(--success)`,
    [ProductType.Graphic]: `var(--pink_neon)`,
    [ProductType.Physical]: `var(--bluelight)`,
    [ProductType.Sticker]: `var(--yellow_neon)`,
    [ProductType.Poster]: `var(--cool_neon_blue)`,
    [ProductType.Commission]: `var(--yellow_neon)`,
    [ProductType.Subscription]: `var(--green_neon)`,
    [ProductType.DigitalDownload]: `var(--blueneon)`,
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
