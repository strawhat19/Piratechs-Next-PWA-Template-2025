'use client';

import Table from '../table';
import { useContext } from 'react';
import { toast } from 'react-toastify';
import Loader from '../../loaders/loader';
import { GridColDef } from '@mui/x-data-grid';
import IconText from '../../icon-text/icon-text';
import { AddShoppingCart } from '@mui/icons-material';
import TableStatus from '../table-status/table-status';
import { StateGlobals } from '@/shared/global-context';
import { Product } from '@/shared/types/models/Product';
import Icon_Button from '../../buttons/icon-button/icon-button';

const storeDollarSignColor = `var(--green_neon)`;

const getProductStatusColor = (product: Product) => {
    const status = String(product?.status || ``).toLowerCase();
    if (status.includes(`out`) || status.includes(`archived`) || product?.stock <= 0) return `red`;
    if (status.includes(`active`) && product?.stock > 0) return `var(--green_neon)`;
    return `rgba(255,255,255,0.35)`;
}

const ProductActionsCell = ({ row, onAddToCart }: { row: Product; onAddToCart: (product: Product) => void }) => {
    const canAddToCart = row.stock > 0;
    const statusColor = getProductStatusColor(row);

    return (
        <div className={`actionsCell productActionsCell`}>
            <TableStatus label={row?.status} color={statusColor} />
            <div className={`actions`}>
                <Icon_Button
                    size={26}
                    title={canAddToCart ? `Add To Cart` : `Out Of Stock`}
                    disabled={!canAddToCart}
                    className={`actionIconButton addToCartAction`}
                    onClick={(event: any) => {
                        event.stopPropagation();
                        onAddToCart(row);
                        toast.success(`${row?.name} Added To Cart`);
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
            renderCell: ({ value }: any) => <IconText dollarSign number={Number(value || 0) / 100} dollarSignColor={storeDollarSignColor} className={`stockText`} />,
        },
        {
            field: `stock`,
            type: `number`,
            headerName: `Stock`,
            width: 95,
            renderCell: ({ value }: any) => <IconText showIcon={false} number={Number(value || 0)} decimalPlaces={0} className={`stockText`} />,
        },
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
