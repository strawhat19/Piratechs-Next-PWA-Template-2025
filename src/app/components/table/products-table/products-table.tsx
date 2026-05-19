'use client';

import Table from '../table';
import Image from 'next/image';
import { toast } from 'react-toastify';
import Loader from '../../loaders/loader';
import { useContext, useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import IconText from '../../icon-text/icon-text';
import { Roles, Types } from '@/shared/types/types';
import { minRole } from '@/shared/scripts/constants';
import TableStatus from '../table-status/table-status';
import { StateGlobals } from '@/shared/global-context';
import Icon_Button from '../../buttons/icon-button/icon-button';
import { Product, ProductStatus } from '@/shared/types/models/Product';
import { ProductFormDialog } from '../../store/product-form/product-form';
import { AddShoppingCart, Archive, Delete, Edit, Restore } from '@mui/icons-material';
import { updateProductInDatabase, deleteProductFromDatabase } from '@/shared/server/firebase';

const storeDollarSignColor = `var(--green_neon)`;

const getProductStatus = (product: Product, string: boolean = false) => {
    const stock = Number(product?.stock || 0);
    const status = String(product?.status || ``).toLowerCase();
    const err = stock <= 0;
    const success = status?.includes(`active`) && stock > 0;
    // const unavailable = (status?.includes(`out`) || status?.includes(`archived`));
    if (err) {
        return {
            color: `red`,
            label: stock <= 0 ? (
                string == true ? ProductStatus.OutOfStock : stock
            ) : (status?.includes(`archived`) ? (
                string == true ? ProductStatus.Archived : stock
            ) : ProductStatus.Draft),
        };
    }
    if (success) {
        return {
            color: `var(--green_neon)`,
            label: stock > 0 ? (string == true ? ProductStatus.Active : stock) : ProductStatus.Active,
        };
    }
    return {
        color: `rgba(255, 255, 255, 0.35)`,
        label: stock <= 0 ? (
            string == true ? ProductStatus.OutOfStock : stock
        ) : (status?.includes(`archived`) ? (
            string == true ? ProductStatus.Archived : stock
        ) : ProductStatus.Pending),
    };
};

const getProductStatusColor = (product: Product) => {
    return getProductStatus(product)?.color;
};

const getProductStatusLabel = (product: Product, string: boolean = false) => {
    return getProductStatus(product, string)?.label;
};

const ProductImageCell = ({ row }: { row: Product }) => {
    const imageURL = row?.imageURL || row?.imageURLs?.[0] || row?.images?.[0]?.src || row?.images?.[0]?.url;
    return imageURL ? <Image unoptimized width={38} height={38} alt={row?.name || `Product`} src={imageURL} className={`productTableImage`} /> : <div className={`productTableImage productTableImageEmpty`}>{row?.name?.[0] || `P`}</div>;
}

const ProductActionsCell = ({ quickEditing = false, row, onEdit, onAddToCart }: { quickEditing?: boolean; row: Product; onEdit: (product: Product | null) => void; onAddToCart: (product: Product) => void }) => {
    const { user } = useContext<any>(StateGlobals);
    const canManageProducts = minRole(user?.role, Roles.Administrator);
    const isArchived = String(row?.status || ``).toLowerCase() == ProductStatus.Archived.toLowerCase();
    const canAddToCart = !isArchived && row?.stock > 0;
    const statusColor = getProductStatusColor(row);
    const updateStatus = (status: ProductStatus) => {
        toast.info(`Updating Product`);
        updateProductInDatabase(String(row?.id), { status }, user)?.then(() => toast.success(`Product Updated`));
    }
    const deleteProduct = () => {
        if (!window.confirm(`Delete ${row?.name}?`)) return;
        toast.info(`Deleting Product`);
        deleteProductFromDatabase(row, user)?.then(() => toast.success(`Product Deleted`));
    }

    return (
        <div className={`actionsCell productActionsCell`}>
            <TableStatus label={getProductStatusLabel(row)} color={statusColor} title={getProductStatusLabel(row, true)} />
            <div className={`actions`}>
                {!isArchived ? (
                    <Icon_Button
                        size={26}
                        disabled={!canAddToCart}
                        className={`actionIconButton addToCartAction`}
                        title={canAddToCart ? `Add To Cart` : `Out Of Stock`}
                        onClick={(event: any) => {
                            event.stopPropagation();
                            onAddToCart(row);
                            toast.success(`${row?.name} Added To Cart`);
                        }}
                    >
                        <AddShoppingCart fontSize={`small`} />
                    </Icon_Button>
                ) : (isArchived ? <>
                    <Icon_Button
                        size={26}
                        title={`Restore Product`}
                        className={`actionIconButton restoreAction`}
                        onClick={(event: any) => {
                            event.stopPropagation();
                            updateStatus(ProductStatus.Active);
                        }}
                    >
                        <Restore fontSize={`small`} />
                    </Icon_Button>
                </> : <></>)}
                {canManageProducts ? <>
                    <Icon_Button
                        size={26}
                        title={quickEditing ? `Cancel Quick Edit` : `Quick Edit Product`}
                        className={`actionIconButton editAction ${quickEditing ? `quickEditActive pulsate circular` : ``}`}
                        onClick={(event: any) => {
                            event.stopPropagation();
                            onEdit(quickEditing ? null : row);
                        }}
                    >
                        <Edit fontSize={`small`} />
                    </Icon_Button>
                    {isArchived ? <>
                        <Icon_Button
                            size={26}
                            title={`Delete Product`}
                            className={`actionIconButton deleteAction`}
                            onClick={(event: any) => {
                                event.stopPropagation();
                                deleteProduct();
                            }}
                        >
                            <Delete fontSize={`small`} />
                        </Icon_Button>
                    </> : (
                        <Icon_Button
                            size={26}
                            title={`Archive Product`}
                            className={`actionIconButton archiveAction`}
                            onClick={(event: any) => {
                                event.stopPropagation();
                                updateStatus(ProductStatus.Archived);
                            }}
                        >
                            <Archive fontSize={`small`} />
                        </Icon_Button>
                    )}
                </> : <></>}
            </div>
        </div>
    );
};

export default function ProductsTable({ 
    type = Types.Product, 
    onAddToCart = () => {}, 
    onQuickEdit = undefined,
    quickEditProduct = null,
}: any) {
    const { products = [], productsLoading = false } = useContext<any>(StateGlobals);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const editProduct = (product: Product | null) => onQuickEdit ? onQuickEdit(product) : setSelectedProduct(product);

    const productColumns: GridColDef[] = [
        { field: `number`, headerName: `ID`, width: 87 },
        {
            width: 105,
            field: `price`,
            headerName: `Price`,
            renderCell: ({ value }: any) => <IconText dollarSign number={Number(value || 0) / 100} dollarSignColor={storeDollarSignColor} className={`stockText`} />,
        },
        { field: `name`, headerName: `Product`, flex: 1, maxWidth: 300, },
        {
            width: 70,
            sortable: false,
            field: `imageURL`,
            filterable: false,
            headerName: `Image`,
            renderCell: ({ row }: any) => <ProductImageCell row={row} />,
        },
        {
            width: 85,
            field: `stock`,
            type: `number`,
            headerName: `Stock`,
            renderCell: ({ value }: any) => <IconText showIcon={false} number={Number(value || 0)} decimalPlaces={0} className={`stockText`} />,
        },
        { field: `category`, headerName: `Category`, width: 100 },
        { field: `created_by`, headerName: `Created By`, width: 175 },
        { field: `updated_by`, headerName: `Updated By`, width: 175 },
        // { field: `sku`, headerName: `SKU`, width: 130 },
        // { field: `productType`, headerName: `Type`, width: 120 },
        { field: `id`, headerName: `UUID`, width: 333, flex: 1 },
        {
            width: 150,
            minWidth: 150,
            sortable: false,
            field: `actions`,
            filterable: false,
            headerName: `Action(s)`,
            renderCell: ({ row }: any) => <ProductActionsCell row={row} onAddToCart={onAddToCart} onEdit={editProduct} quickEditing={quickEditProduct?.id == row?.id} />,
        },
    ];

    if (productsLoading) {
        return <Loader height={250} label={`Product(s) Loading`} />;
    }

    return (
        <>
            <Table
                type={type}
                rows={products}
                title={`${type}(s)`}
                columns={productColumns}
                className={`productsTableComponent`}
            />
            <ProductFormDialog
                product={selectedProduct}
                open={selectedProduct != null}
                onClose={() => setSelectedProduct(null)}
            />
        </>
    );
}
