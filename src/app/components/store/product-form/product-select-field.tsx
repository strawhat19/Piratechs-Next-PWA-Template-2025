'use client';

import Menu from '../../menu/menu';
import { Button } from '@mui/material';
import React, { JSX, useState } from 'react';
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
    [ProductStatus.Draft]: 'var(--disabled)',
    [ProductStatus.Active]: 'var(--success)',
    [ProductStatus.Pending]: 'var(--yellow_neon)',
    [ProductStatus.Archived]: 'var(--soft-silver)',
    [ProductStatus.Backorder]: 'var(--blueneon)',
    [ProductStatus.Unavailable]: 'var(--error)',
    [ProductStatus.OutOfStock]: 'var(--pink_neon)',
};

// Category colors using SCSS theme variables
export const categoryColors: Record<ProductCategory, string> = {
    [ProductCategory.Art]: 'var(--pink_neon)',
    [ProductCategory.Apparel]: 'var(--blueneon)',
    [ProductCategory.Stickers]: 'var(--yellow_neon)',
    [ProductCategory.Paintings]: 'var(--success)',
    [ProductCategory.Prints]: 'var(--bluelight)',
    [ProductCategory.Posters]: 'var(--cool_neon_blue)',
    [ProductCategory.Graphics]: 'var(--pink_neon)',
    [ProductCategory.Commissions]: 'var(--yellow_neon)',
    [ProductCategory.Accessories]: 'var(--success)',
    [ProductCategory.DigitalArt]: 'var(--blueneon)',
    [ProductCategory.OriginalArt]: 'var(--pink_neon)',
    [ProductCategory.CustomArt]: 'var(--yellow_neon)',
    [ProductCategory.Merchandise]: 'var(--bluelight)',
};

// Type colors using SCSS theme variables
export const typeColors: Record<ProductType, string> = {
    [ProductType.Pin]: 'var(--blueneon)',
    [ProductType.Print]: 'var(--bluelight)',
    [ProductType.Shirt]: 'var(--blueneon)',
    [ProductType.Poster]: 'var(--cool_neon_blue)',
    [ProductType.Sticker]: 'var(--yellow_neon)',
    [ProductType.Graphic]: 'var(--pink_neon)',
    [ProductType.Service]: 'var(--success)',
    [ProductType.Digital]: 'var(--blueneon)',
    [ProductType.Painting]: 'var(--success)',
    [ProductType.Physical]: 'var(--bluelight)',
    [ProductType.Commission]: 'var(--yellow_neon)',
    [ProductType.Subscription]: 'var(--green_neon)',
    [ProductType.DigitalDownload]: 'var(--blueneon)',
};

interface ProductSelectFieldProps {
    label: string;
    value: string;
    options: string[];
    icons: Record<string, JSX.Element>;
    colors?: Record<string, string>;
    onChange: (value: string) => void;
    className?: string;
}

export default function ProductSelectField({
    label,
    value,
    options,
    icons,
    colors,
    onChange,
    className = '',
}: ProductSelectFieldProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const filteredOptions = options.filter(option => option !== value);

    const menuItems = filteredOptions.map(option => ({
        id: option,
        label: option,
        icon: icons[option],
        className: '',
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
                <Button
                    size="small"
                    className={`productSelectButton`}
                    onClick={handleClick}
                    startIcon={currentIcon}
                    endIcon={<KeyboardArrowDown />}
                >
                    <span style={{ marginRight: 'auto', color: currentColor }}>
                        {value}
                    </span>
                </Button>
            </div>
            <Menu
                open={open}
                colors={true}
                topOffset={0.5}
                anchorEl={anchorEl}
                onClose={handleClose}
                menuItems={menuItems}
                className={`productSelectDropdown`}
                targetID={`${label.toLowerCase().replace(/\s/g, '-')}-menu`}
            />
        </>
    );
}