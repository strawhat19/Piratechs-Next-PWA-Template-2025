'use client';

import Table from '../table';
import { toast } from 'react-toastify';
import Loader from '../../loaders/loader';
import { useContext } from 'react';
import Icon_Button from '../../buttons/icon-button/icon-button';
import { Product } from '@/shared/types/models/Product';
import { StateGlobals } from '@/shared/global-context';
import { AddShoppingCart, Inventory2 } from '@mui/icons-material';
import { GridColDef } from '@mui/x-data-grid';

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
    const { products = [], productsLoading = false } = useContext<any>(StateGlobals);

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

    if (productsLoading) {
        return <Loader height={250} label={`Product(s) Loading`} />;
    }

    return (
        <Table
            rows={products}
            title={`Product(s)`}
            columns={productColumns}
            className={`productsTableComponent`}
        />
    );
}
