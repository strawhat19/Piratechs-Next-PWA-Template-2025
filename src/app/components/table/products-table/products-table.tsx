'use client';

import Table from '../table';
import { toast } from 'react-toastify';
import Icon_Button from '../../buttons/icon-button/icon-button';
import { AddShoppingCart, Inventory2 } from '@mui/icons-material';
import { GridColDef } from '@mui/x-data-grid';

export type Product = {
    id: number;
    sku: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    status: `Active` | `Limited` | `Backorder`;
};

export const products: Product[] = [
    { id: 1, sku: `PT-PWA-001`, name: `PWA Starter Kit`, category: `Templates`, price: 4900, stock: 18, status: `Active` },
    { id: 2, sku: `PT-UI-002`, name: `Dashboard UI Pack`, category: `Components`, price: 2900, stock: 24, status: `Active` },
    { id: 3, sku: `PT-AUTH-003`, name: `Auth Flow Bundle`, category: `Integrations`, price: 3900, stock: 12, status: `Active` },
    { id: 4, sku: `PT-FIRE-004`, name: `Firebase Data Layer`, category: `Integrations`, price: 5900, stock: 9, status: `Limited` },
    { id: 5, sku: `PT-STORE-005`, name: `Storefront Module`, category: `Commerce`, price: 6900, stock: 7, status: `Limited` },
    { id: 6, sku: `PT-STRIPE-006`, name: `Stripe Checkout Setup`, category: `Commerce`, price: 7900, stock: 14, status: `Active` },
    { id: 7, sku: `PT-PUSH-007`, name: `Push Notification Kit`, category: `PWA`, price: 3400, stock: 20, status: `Active` },
    { id: 8, sku: `PT-TABLE-008`, name: `Data Table Toolkit`, category: `Components`, price: 2500, stock: 31, status: `Active` },
    { id: 9, sku: `PT-BOARD-009`, name: `Kanban Board Module`, category: `Productivity`, price: 5600, stock: 11, status: `Active` },
    { id: 10, sku: `PT-CHART-010`, name: `Charts Starter Pack`, category: `Analytics`, price: 4500, stock: 16, status: `Active` },
    { id: 11, sku: `PT-PROF-011`, name: `Profile Settings Kit`, category: `Account`, price: 2200, stock: 28, status: `Active` },
    { id: 12, sku: `PT-NAV-012`, name: `Responsive Nav System`, category: `Components`, price: 3100, stock: 19, status: `Active` },
    { id: 13, sku: `PT-SVC-013`, name: `Service Worker Tuneup`, category: `PWA`, price: 4100, stock: 6, status: `Limited` },
    { id: 14, sku: `PT-SEO-014`, name: `Metadata SEO Pass`, category: `Marketing`, price: 2700, stock: 0, status: `Backorder` },
    { id: 15, sku: `PT-SUP-015`, name: `Launch Support Hour`, category: `Services`, price: 9900, stock: 5, status: `Limited` },
];

const formatPrice = (price: number) => {
    return new Intl.NumberFormat(`en-US`, {
        style: `currency`,
        currency: `USD`,
    }).format(price / 100);
};

const ProductActionsCell = ({ row, onAddToCart }: { row: Product; onAddToCart: (product: Product) => void }) => {
    const canAddToCart = row.stock > 0;

    return (
        <div className={`actionsCell productActionsCell`}>
            <div className={`rowStatus`}>
                <Inventory2 className={`statusDot`} htmlColor={canAddToCart ? `var(--green_neon)` : `var(--disabled)`} />
                <span className={`statusText`}>{row.status}</span>
            </div>
            <div className={`actions`}>
                <Icon_Button
                    size={26}
                    title={canAddToCart ? `Add to Cart` : `Out of Stock`}
                    disabled={!canAddToCart}
                    className={`actionIconButton addToCartAction`}
                    onClick={(event: any) => {
                        event.stopPropagation();
                        onAddToCart(row);
                        toast.success(`${row.name} added to cart.`);
                    }}
                >
                    <AddShoppingCart fontSize={`small`} />
                </Icon_Button>
            </div>
        </div>
    );
};

export default function ProductsTable({ onAddToCart = () => {} }: { onAddToCart?: (product: Product) => void }) {
    const productColumns: GridColDef[] = [
        { field: `id`, headerName: `ID`, width: 75 },
        { field: `sku`, headerName: `SKU`, width: 130 },
        { field: `name`, headerName: `Product`, width: 210, flex: 1 },
        { field: `category`, headerName: `Category`, width: 135 },
        {
            field: `price`,
            headerName: `Price`,
            width: 105,
            renderCell: ({ value }: any) => <>{formatPrice(value)}</>,
        },
        { field: `stock`, type: `number`, headerName: `Stock`, width: 95 },
        {
            minWidth: 165,
            field: `actions`,
            headerName: `Actions`,
            sortable: false,
            filterable: false,
            renderCell: ({ row }: any) => <ProductActionsCell row={row} onAddToCart={onAddToCart} />,
        },
    ];

    return (
        <Table
            rows={products}
            title={`Product(s)`}
            columns={productColumns}
            className={`productsTableComponent`}
        />
    );
}
