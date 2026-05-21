'use client';

import Table from '../table';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';
import Loader from '../../loaders/loader';
import { useContext, useEffect, useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import IconText from '../../icon-text/icon-text';
import MenuTrigger from '../../menu/menu-trigger';
import { Roles, Types } from '@/shared/types/types';
import TableStatus from '../table-status/table-status';
import { StateGlobals } from '@/shared/global-context';
import Icon_Button from '../../buttons/icon-button/icon-button';
import { constants, minRole } from '@/shared/scripts/constants';
import { useCheckoutReturnToast, useStoreCart } from '../../store/use-store-cart';
import ProductForm, { ProductFormDialog } from '../../store/product-form/product-form';
import { statusIcons, categoryIcons, typeIcons } from '../../store/product-form/product-select-field';
import { updateProductInDatabase, deleteProductFromDatabase } from '@/shared/server/firebase';
import { Product, ProductType, ProductStatus, ProductCategory } from '@/shared/types/models/Product';
import { AddShoppingCart, Archive, Delete, Edit, Restore, KeyboardArrowDown, Add, Save, Close, Remove, DoDisturb } from '@mui/icons-material';

const storeDollarSignColor = `var(--green_neon)`;
const tableStatusGray = `rgba(255, 255, 255, 0.35)`;

const getProductStatus = (product: Product, string: boolean = false) => {
    const stock = Number(product?.stock || 0);
    const status = String(product?.status || ``).toLowerCase();
    const active = status?.includes(`active`);
    const archived = status?.includes(`archived`);
    // const backorder = status?.includes(`backorder`);
    // const pending = status?.includes(`pending`) || status?.includes(`draft`);
    // const unavailable = status?.includes(`unavailable`) || status?.includes(`out`);
    // if (archived) return { color: `red`, label: string == true ? ProductStatus.Archived : stock };
    if (stock <= 0 || product?.status == ProductStatus.Unavailable) return { color: `red`, label: string == true ? ProductStatus.Unavailable : stock };
    if (active) return { color: `var(--green_neon)`, label: string == true ? ProductStatus.Active : stock };
    // if (pending) return { color: tableStatusGray, label: string == true ? ProductStatus.Pending : stock };
    // if (backorder) return { color: tableStatusGray, label: string == true ? ProductStatus.Backorder : stock };
    return { color: tableStatusGray, label: string == true ? (archived ? ProductStatus.Archived : product?.status) : stock };
};

const getProductStatusColor = (product: Product) => {
    return getProductStatus(product)?.color;
};

const getProductStatusLabel = (product: Product, string: boolean = false) => {
    return getProductStatus(product, string)?.label;
};

const ProductStockCell = ({ row, value, pendingStock, onIncrease, onDecrease, onSave, onCancel, valueFirst = true }: any) => {
    const { user } = useContext<any>(StateGlobals);
    const stock = Math.max(0, Number(value || 0));
    const stockToShow = pendingStock == undefined ? stock : Math.max(0, Number(pendingStock || 0));
    const isDirty = pendingStock != undefined && stockToShow != stock;
    const canManageProducts = minRole(user?.role, Roles.Administrator);
    if (!canManageProducts) return <span>{stockToShow}</span>;
    return (
        <div className={`flexContainer`} style={{ width: `100%`, justifyContent: `space-between` }}>
            {valueFirst && (
                <span className={`stockText`}>
                    {stockToShow}
                </span>
            )}
            <div className={`flexContainer`} style={{ flexDirection: `column`, gap: 2 }}>
                <div className={`flexContainer`} style={{ gap: 3, flexDirection: valueFirst ? `row-reverse` : `row` }}>
                    <Icon_Button
                        size={14}
                        title={``}
                        rounded={false}
                        className={`qtyBtn actionIconButton grayAction qtyBlue`}
                        onClick={(event: any) => {
                            event.stopPropagation();
                            onIncrease?.(row, stockToShow);
                        }}
                    >
                        <Add style={{ fontSize: 18 }} fontSize={`small`} />
                    </Icon_Button>
                    {isDirty ? (
                        <Icon_Button
                            size={14}
                            title={``}
                            rounded={false}
                            className={`qtyBtn actionIconButton grayAction qtySuccess`}
                            onClick={(event: any) => {
                                event.stopPropagation();
                                onSave?.(row, stockToShow, stock);
                            }}
                        >
                            <Save style={{ fontSize: 14 }} fontSize={`small`} />
                        </Icon_Button>
                    ) : null}
                </div>
                <div className={`flexContainer`} style={{ gap: 3, flexDirection: valueFirst ? `row-reverse` : `row` }}>
                    <Icon_Button
                        size={14}
                        title={``}
                        rounded={false}
                        disabled={stockToShow <= 0}
                        className={`qtyBtn actionIconButton grayAction ${isDirty ? `` : `qtyRed`}`}
                        onClick={(event: any) => {
                            event.stopPropagation();
                            onDecrease?.(row, stockToShow);
                        }}
                    >
                        <Remove style={{ fontSize: 18 }} fontSize={`small`} />
                    </Icon_Button>
                    {isDirty ? (
                        <Icon_Button
                            size={14}
                            title={``}
                            rounded={false}
                            className={`qtyBtn actionIconButton grayAction qtyRed`}
                            onClick={(event: any) => {
                                event.stopPropagation();
                                onCancel?.(row);
                            }}
                        >
                            <DoDisturb style={{ fontSize: 15 }} fontSize={`small`} />
                        </Icon_Button>
                    ) : null}
                </div>
            </div>
            {!valueFirst && (
                <span className={`stockText`}>
                    {stockToShow}
                </span>
            )}
        </div>
    );
};

const ProductImageCell = ({ row }: { row: Product }) => {
    let imageURL = row?.attachments?.[0]?.value || row?.imageURL || row?.imageURLs?.[0] || row?.images?.[0]?.src || row?.images?.[0]?.url;
    if (!imageURL) imageURL = constants.images.icons.logo;
    return imageURL ? (
        <Image unoptimized width={38} height={38} alt={row?.name || `Product`} src={imageURL} className={`productTableImage`} />
    ) : (
        <div className={`productTableImage productTableImageEmpty`}>
            {row?.name?.[0] || `P`}
        </div>
    );
}

const ProductActionsCell = ({ quickEditing = false, row, onEdit, onAddToCart }: { quickEditing?: boolean; row: Product; onEdit: (product: Product | null) => void; onAddToCart: (product: Product) => void }) => {
    const { user, showConfirm } = useContext<any>(StateGlobals);
    const canManageProducts = minRole(user?.role, Roles.Administrator);
    const isArchived = String(row?.status || ``).toLowerCase() == ProductStatus.Archived.toLowerCase();
    const available = String(row?.status || ``).toLowerCase() != ProductStatus.Unavailable.toLowerCase();
    const canAddToCart = !isArchived && row?.stock > 0 && available;
    const statusColor = getProductStatusColor(row);
    const updateStatus = (status: ProductStatus) => {
        toast.info(`Updating Product`);
        updateProductInDatabase(String(row?.id), { status }, user)?.then(() => toast.success(`Product Updated`));
    }
    const deleteProduct = async () => {
        const confirmed = await showConfirm({
            cancelText: `Cancel`,
            confirmText: `Delete`,
            title: `Delete Product`,
            message: `Delete Product #${row?.number} "${row?.name}"?`,
            confirmAction: { color: `var(--error)`, className: `dialogDeleteAction` },
            cancelAction: { color: `var(--buttons)` },
        });
        if (!confirmed) return;
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
                        placement={`top`}
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
                ) : ((isArchived && canManageProducts) ? <>
                    <Icon_Button
                        size={26}
                        placement={`top`}
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
                        placement={`top`}
                        title={quickEditing ? `Cancel Edit` : `Edit Product`}
                        className={`actionIconButton grayAction editAction ${quickEditing ? `btnActivated quickEditActive pulsate circular` : ``}`}
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
                            placement={`top`}
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
                            placement={`top`}
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

const ProductCategoryCell = ({ row, value }: any) => {
    const { user } = useContext<any>(StateGlobals);
    const currentValue = String(value || ProductCategory.Art);
    const canManageProducts = minRole(user?.role, Roles.Administrator);
    if (!canManageProducts) return <>{currentValue}</>;
    const categoryOptions = Object.values(ProductCategory)?.filter(option => option != currentValue);
    const categoryItems = categoryOptions?.map((category: ProductCategory | string) => ({
        id: category,
        label: category,
        icon: categoryIcons?.[category as ProductCategory],
        onClick: () => {
            toast.info(`Updating Product Category`);
            updateProductInDatabase(String(row?.id), { category }, user)?.then(() => toast.success(`Product Category Updated`));
        },
    }));
    return (
        <MenuTrigger
            colors={true}
            search={false}
            topOffset={0.5}
            menuItems={categoryItems}
            className={`roleDropdownMenu`}
            id={`product-category-menu-trigger-${row?.id}`}
            targetID={`product-category-menu-${row?.id}`}
            renderTrigger={({ id, onClick, onFocus, onType, searchValue }) => (
                <Button
                    id={id}
                    size={`small`}
                    onClick={onClick}
                    endIcon={<KeyboardArrowDown />}
                    className={`tableDropDown roleDropdownButton`}
                    startIcon={categoryIcons?.[currentValue as ProductCategory]}
                >
                    <span className={`dropDownBtnLabel`}>
                        {searchValue || currentValue}
                    </span>
                    {/* <input
                        onFocus={onFocus}
                        onChange={onType}
                        placeholder={currentValue}
                        className={`dropDownBtnLabel`}
                        value={searchValue || currentValue}
                        onClick={(event) => event.stopPropagation()}
                        style={{ border: `none`, width: `100%`, color: `inherit`, background: `transparent` }}
                    /> */}
                </Button>
            )}
        />
    );
};

const ProductTypeCell = ({ row, value }: any) => {
    const { user } = useContext<any>(StateGlobals);
    const currentValue = String(value || ProductType.Sticker);
    const canManageProducts = minRole(user?.role, Roles.Administrator);
    if (!canManageProducts) return <>{currentValue}</>;
    const typeOptions = Object.values(ProductType)?.filter(option => option != currentValue);
    const typeItems = typeOptions?.map((productType: ProductType | string) => ({
        id: productType,
        label: productType,
        icon: typeIcons?.[productType as ProductType],
        onClick: () => {
            toast.info(`Updating Product Type`);
            updateProductInDatabase(String(row?.id), { productType }, user)?.then(() => toast.success(`Product Type Updated`));
        },
    }));
    return (
        <MenuTrigger
            colors={true}
            search={false}
            topOffset={0.5}
            menuItems={typeItems}
            className={`roleDropdownMenu`}
            id={`product-type-menu-trigger-${row?.id}`}
            targetID={`product-type-menu-${row?.id}`}
            renderTrigger={({ id, onClick, onFocus, onType, searchValue }) => (
                <Button
                    id={id}
                    size={`small`}
                    onClick={onClick}
                    endIcon={<KeyboardArrowDown />}
                    className={`tableDropDown roleDropdownButton`}
                    startIcon={typeIcons?.[currentValue as ProductType]}
                >
                    <span className={`dropDownBtnLabel`}>
                        {searchValue || currentValue}
                    </span>
                    {/* <input
                        onFocus={onFocus}
                        onChange={onType}
                        placeholder={currentValue}
                        className={`dropDownBtnLabel`}
                        value={searchValue || currentValue}
                        onClick={(event) => event.stopPropagation()}
                        style={{ border: `none`, width: `100%`, color: `inherit`, background: `transparent` }}
                    /> */}
                </Button>
            )}
        />
    );
};

const ProductStatusCell = ({ row, value }: any) => {
    const { user } = useContext<any>(StateGlobals);
    const currentValue = String(value || ProductStatus.Unavailable);
    const stock = Number(row?.stock || 0);
    const isUnavailable = currentValue?.toLowerCase() == ProductStatus.Unavailable.toLowerCase();
    const statusLocked = isUnavailable && stock <= 0;
    const canManageProducts = minRole(user?.role, Roles.Administrator);
    if (!canManageProducts) return <>{currentValue}</>;
    const statusOptions = Object.values(ProductStatus)?.filter(option => option != currentValue);
    const statusItems = statusOptions?.map((status: ProductStatus | string) => ({
        id: status,
        label: status,
        icon: statusIcons?.[status as ProductStatus],
        onClick: () => {
            toast.info(`Updating Product Status`);
            const updates: any = { status };
            if (String(status || ``).toLowerCase() == ProductStatus.Unavailable.toLowerCase()) updates.stock = 0;
            updateProductInDatabase(String(row?.id), updates, user)?.then(() => toast.success(`Product Status Updated`));
        },
    }));
    return (
        <MenuTrigger
            colors={true}
            search={false}
            topOffset={0.5}
            menuItems={statusItems}
            className={`roleDropdownMenu`}
            id={`product-status-menu-trigger-${row?.id}`}
            targetID={`product-status-menu-${row?.id}`}
            renderTrigger={({ id, onClick, searchValue }) => (
                <Button
                    id={id}
                    size={`small`}
                    onClick={onClick}
                    disabled={statusLocked}
                    startIcon={statusIcons?.[currentValue as ProductStatus]}
                    endIcon={statusLocked ? undefined : <KeyboardArrowDown />}
                    className={`tableDropDown roleDropdownButton ${statusLocked ? `disabled` : ``}`}
                >
                    <span className={`dropDownBtnLabel`}>
                        {searchValue || currentValue}
                    </span>
                </Button>
            )}
        />
    );
};

export default function ProductsTable({ 
    setFullEditProduct,
    setQuickEditProduct,
    type = Types.Product, 
    onAddToCart = () => {}, 
    onQuickEdit = undefined,
    quickEditProduct = null,
}: any) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [pendingStockByID, setPendingStockByID] = useState<Record<string, number>>({});
    const [optimisticStockByID, setOptimisticStockByID] = useState<Record<string, number>>({});
    const { products = [], productsLoading = false } = useContext<any>(StateGlobals);
    const { user } = useContext<any>(StateGlobals);
    const editProduct = (product: Product | null) => onQuickEdit ? onQuickEdit(product) : setSelectedProduct(product);

    const { saveCart } = useStoreCart();
    // const canManageStore = minRole(user?.role, Roles.Editor);
    // const toggleQuickEditProduct = (product: Product | null) => setQuickEditProduct((prev: any) => prev?.id == product?.id ? null : product);

    useCheckoutReturnToast(saveCart);

    useEffect(() => {
        setOptimisticStockByID(prev => {
            let changed = false;
            const next = { ...prev };
            Object.entries(prev).forEach(([id, optimisticStock]) => {
                const liveStock = Number(products?.find((product: Product) => String(product?.id) == id)?.stock ?? NaN);
                if (!Number.isNaN(liveStock) && liveStock == Number(optimisticStock)) {
                    delete next[id];
                    changed = true;
                }
            });
            return changed ? next : prev;
        });
    }, [products]);

    const onIncreaseStockDraft = (row: Product, currentStock: number) => {
        setPendingStockByID(prev => ({ ...prev, [String(row?.id)]: Math.max(0, Number(currentStock || 0) + 1) }));
    };

    const onDecreaseStockDraft = (row: Product, currentStock: number) => {
        setPendingStockByID(prev => ({ ...prev, [String(row?.id)]: Math.max(0, Number(currentStock || 0) - 1) }));
    };

    const onCancelStockDraft = (row: Product) => {
        const rowID = String(row?.id);
        setPendingStockByID(prev => {
            const next = { ...prev };
            delete next[rowID];
            return next;
        });
    };

    const onSaveStockDraft = (row: Product, nextStock: number, originalStock: number) => {
        const safeStock = Math.max(0, Number(nextStock || 0));
        const rowID = String(row?.id);
        if (safeStock == Math.max(0, Number(originalStock || 0))) return onCancelStockDraft(row);
        const updates: any = { stock: safeStock };
        if (safeStock > 0 && String(row?.status || ``).toLowerCase() == ProductStatus.Unavailable.toLowerCase()) {
            updates.status = ProductStatus.Active;
        }
        setOptimisticStockByID(prev => ({ ...prev, [rowID]: safeStock }));
        onCancelStockDraft(row);
        updateProductInDatabase(rowID, updates, user)?.then(() => {
            toast.success(`Product Stock Updated`);
        }).catch(() => {
            setOptimisticStockByID(prev => {
                const next = { ...prev };
                delete next[rowID];
                return next;
            });
            toast.error(`Product Stock Update Failed`);
        });
    };

    const productColumns: GridColDef[] = [
        { field: `number`, headerName: `ID`, width: 50 },
        {
            width: 85,
            field: `price`,
            type: `number`,
            headerName: `Price`,
            headerClassName: `numberHeaderCell`,
            renderCell: ({ value }: any) => (
                <IconText format={false} dollarSign number={Number(value || 0) / 100} dollarSignColor={storeDollarSignColor} className={`stockText`} />
            ),
        },
        {
            width: 100,
            field: `stock`,
            type: `number`,
            headerName: `Quantity`,
            headerClassName: `numberHeaderCell`,
            renderCell: ({ row, value }: any) => (
                <ProductStockCell
                    row={row}
                    value={value}
                    onSave={onSaveStockDraft}
                    onCancel={onCancelStockDraft}
                    onIncrease={onIncreaseStockDraft}
                    onDecrease={onDecreaseStockDraft}
                    pendingStock={(pendingStockByID?.[String(row?.id)] ?? optimisticStockByID?.[String(row?.id)])}
                />
            ),
        },
        { field: `name`, headerName: `Product`, flex: 1, maxWidth: 150, },
        {
            width: 70,
            field: `imageURL`,
            filterable: false,
            headerName: `Image`,
            headerClassName: `imageHeaderCell`,
            renderCell: ({ row }: any) => <ProductImageCell row={row} />,
        },
        // { field: `created_by`, headerName: `Created By`, width: 145 },
        // { field: `updated_by`, headerName: `Updated By`, width: 145 },
        { field: `created_at`, headerName: `Created`, width: 155 },
        { field: `updated`, headerName: `Updated`, width: 155 },
        // { field: `sku`, headerName: `SKU`, width: 130 },
        { width: 165, field: `status`, headerName: `Status`, renderCell: ({ row, value }: any) => <ProductStatusCell row={row} value={value} /> },
        { width: 165, field: `category`, headerName: `Category`, renderCell: ({ row, value }: any) => <ProductCategoryCell row={row} value={value} /> },
        { width: 165, field: `productType`, headerName: `Type`, renderCell: ({ row, value }: any) => <ProductTypeCell row={row} value={value} /> },
        { field: `id`, headerName: `UUID`, width: 333, flex: 1 },
        {
            width: 150,
            minWidth: 150,
            field: `actions`,
            filterable: false,
            headerName: `Action(s)`,
            valueGetter: (_value: any, row: any) => getProductStatusLabel(row, true) || ``,
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
                columns={productColumns}
                className={`productsTableComponent`}
                title={(
                    <div className={`tableHeaderComponent tableHeaderForm`}>
                        {type}(s)
                        <ProductForm
                            widget
                            funsized
                            product={quickEditProduct}
                            onSaved={() => setQuickEditProduct(null)}
                            onCancelEdit={() => setQuickEditProduct(null)}
                            onFullEdit={(product: Product | null) => setFullEditProduct(product)}
                        />
                    </div>
                )}
            />
            <ProductFormDialog
                product={selectedProduct}
                open={selectedProduct != null}
                onClose={() => setSelectedProduct(null)}
            />
        </>
    );
}
