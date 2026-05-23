'use client';

import Table from '../table';
import Image from 'next/image';
import { flushSync } from 'react-dom';
import { toast } from 'react-toastify';
import IconText from '../../icon-text/icon-text';
import MenuTrigger from '../../menu/menu-trigger';
import ProductCard from '../../store/product-card/product-card';
import { DataDisplayModes, Roles, Types } from '@/shared/types/types';
import { minRole } from '@/shared/scripts/constants';
import TableStatus from '../table-status/table-status';
import { StateGlobals } from '@/shared/global-context';
import { useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import EditableCell from '../editable-cell/editable-cell';
import Icon_Button from '../../buttons/icon-button/icon-button';
import ProductForm from '../../store/product-form/product-form';
import { Button, LinearProgress, Skeleton } from '@mui/material';
import { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import ProductDetails from '../../store/product-details/product-details';
import { useCheckoutReturnToast, useStoreCart } from '../../store/use-store-cart';
import { updateProductInDatabase, deleteProductFromDatabase } from '@/shared/server/firebase';
import { Product, ProductType, ProductStatus, ProductCategory } from '@/shared/types/models/Product';
import { statusIcons, categoryIcons, typeIcons } from '../../store/product-form/product-select-field';
import { AddShoppingCart, Archive, Delete, Edit, Restore, KeyboardArrowDown } from '@mui/icons-material';

const storeDollarSignColor = `var(--green_neon)`;
const tableStatusGray = `rgba(255, 255, 255, 0.35)`;
const productRoutePattern = /(?:^|\/)(?:store\/)?products?\/([^/?#]+)/i;
const normalizeProductSelectionModel = (selectionModel: any = {}): GridRowSelectionModel => ({
    type: selectionModel?.type == `exclude` ? `exclude` : `include`,
    ids: selectionModel?.ids instanceof Set ? selectionModel?.ids : new Set(Array.isArray(selectionModel?.ids) ? selectionModel?.ids : []),
});
const createEmptyProductSelectionModel = (): GridRowSelectionModel => normalizeProductSelectionModel();
const getSelectedProductIDs = (selectionModel: GridRowSelectionModel, rows: Product[] = []) => {
    const rowIDs = rows?.map((row: Product) => String(row?.id)).filter(Boolean);
    if (selectionModel?.type == `exclude`) {
        return rowIDs?.filter(id => !selectionModel?.ids?.has?.(id));
    }
    return Array.from(selectionModel?.ids || [])?.map(id => String(id));
};

const getProductStatus = (product: Product, string: boolean = false) => {
    const stock = Number(product?.stock || 0);
    const status = String(product?.status || ``).toLowerCase();
    const active = status?.includes(`active`);
    const archived = status?.includes(`archived`);
    const draft = status?.includes(`draft`);
    const unavailableValue = ProductStatus.Unavailable.toLowerCase();
    // const backorder = status?.includes(`backorder`);
    // const pending = status?.includes(`pending`) || status?.includes(`draft`);
    // const unavailable = status?.includes(`unavailable`) || status?.includes(`out`);
    if (archived) return { color: tableStatusGray, label: string == true ? ProductStatus.Archived : stock };
    if (stock <= 0 || status == unavailableValue) return { color: `red`, label: string == true ? ProductStatus.Unavailable : stock };
    if (active) return { color: `var(--green_neon)`, label: string == true ? ProductStatus.Active : stock };
    if (draft || !status) return { color: `var(--links)`, label: string == true ? ProductStatus.Draft : stock };
    // if (pending) return { color: tableStatusGray, label: string == true ? ProductStatus.Pending : stock };
    // if (backorder) return { color: tableStatusGray, label: string == true ? ProductStatus.Backorder : stock };
    return { color: tableStatusGray, label: string == true ? (archived ? ProductStatus.Archived : product?.status || ProductStatus.Draft) : stock };
};

const getProductStatusColor = (product: Product) => {
    return getProductStatus(product)?.color;
};

const getProductStatusLabel = (product: Product, string: boolean = false) => {
    return getProductStatus(product, string)?.label;
};
const toStep = (value: number, step = 0.01) => Math.round(Number(value || 0) / step) * step;

const ProductStockCell = ({ 
    row, 
    value, 
    onSave, 
    onCancel, 
    onIncrease, 
    onDecrease, 
    placeholder,
    pendingStock, 
    onChangeValue, 
    valueFirst = true, 
    renderValue = undefined, 
    hasRenderedValue = false,
}: any) => {
    const { user } = useContext<any>(StateGlobals);
    const canManageProducts = minRole(user?.role, Roles.Administrator);
    return (
        <EditableCell
            min={0}
            step={0.01}
            value={value}
            mode={`number`}
            showStepper={true}
            valueFirst={valueFirst}
            placeholder={placeholder}
            renderValue={renderValue}
            pendingValue={pendingStock}
            canEdit={canManageProducts}
            onCancel={() => onCancel?.(row)}
            hasRenderedValue={hasRenderedValue}
            onChangeValue={(next: string) => onChangeValue?.(row, next)}
            onIncrease={(current: number) => onIncrease?.(row, current)}
            onDecrease={(current: number) => onDecrease?.(row, current)}
            onSave={(current: number, original: number) => onSave?.(row, current, original)}
        />
    );
};

const ProductImageCell = ({ row }: { row: Product }) => {
    let imageURL = row?.attachments?.[0]?.value || row?.imageURL || row?.imageURLs?.[0] || row?.images?.[0]?.src || row?.images?.[0]?.url;
    // if (!imageURL) imageURL = constants.images.icons.logo;
    return imageURL ? (
        <Image unoptimized width={38} height={38} alt={row?.name || `Product`} src={imageURL} className={`iconImg productTableImage`} />
    ) : (
        <div className={`iconImg avatar productTableImage productTableImageEmpty`} style={{ 
            background: row?.color?.color, 
            color: row?.color?.type == `dark` ? `white` : `var(--navy)`,
        }}>
            <div className={`avatarLetter`} style={{ position: `relative`, top: 1 }}>
                {row?.name?.[0] || `P`}
            </div>
        </div>
    );
}

const ProductActionsCell = ({ 
    row, 
    onEdit, 
    onAddToCart, 
    quickEditing = false, 
    onBatchDeleteProducts, 
    onBatchArchiveProducts,
    clearSelectedProductRows,
    selectedActiveProductIDs, 
    selectedInactiveProductIDs, 
}: any) => {
    const { user, showConfirm } = useContext<any>(StateGlobals);
    const canManageProducts = minRole(user?.role, Roles.Administrator);
    const currentStatus = String(getProductStatusLabel(row, true) || row?.status || ProductStatus.Draft).toLowerCase();
    const isArchived = currentStatus == ProductStatus.Archived.toLowerCase();
    const canAddToCart = !isArchived && currentStatus == ProductStatus.Active.toLowerCase() && row?.stock > 0;
    const statusColor = getProductStatusColor(row);
    const updateStatus = async (status: ProductStatus) => {
        const safeStatus = status == ProductStatus.Active && Number(row?.stock || 0) <= 0 ? ProductStatus.Unavailable : status;
        await updateProductInDatabase(String(row?.id), { status: safeStatus }, user)?.then(() => toast.success(`Product Updated`));
    }
    const archiveProduct = async () => {
        if (selectedActiveProductIDs?.length > 1 && selectedActiveProductIDs?.includes(row?.id)) {
            onBatchArchiveProducts();
            return;
        }
        const confirmed = await showConfirm({
            cancelText: `Cancel`,
            confirmText: `Archive`,
            title: `Archive Product`,
            cancelAction: { color: `var(--buttons)` },
            message: `Archive Product #${row?.number} "${row?.name}"?`,
            confirmAction: { color: `var(--error)`, className: `dialogDeleteAction`, icon: <Archive /> },
        });
        if (!confirmed) return;
        toast.info(`Archiving Product`);
        await updateStatus(ProductStatus.Archived)?.then(() => {
            toast.success(`Product Archived`);
            clearSelectedProductRows?.();
        });
    }
    const deleteProduct = async () => {
        if (selectedInactiveProductIDs?.length > 1 && selectedInactiveProductIDs?.includes(row?.id)) {
            onBatchDeleteProducts();
            return;
        }
        const confirmed = await showConfirm({
            cancelText: `Cancel`,
            confirmText: `Delete`,
            title: `Delete Product`,
            cancelAction: { color: `var(--buttons)` },
            message: `Delete Product #${row?.number} "${row?.name}"?`,
            confirmAction: { color: `var(--error)`, className: `dialogDeleteAction`, icon: <Delete /> },
        });
        if (!confirmed) return;
        toast.info(`Deleting Product`);
        deleteProductFromDatabase(row, user)?.then(() => {
            toast.success(`Product Deleted`);
            clearSelectedProductRows?.();
        });
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
                        title={canAddToCart ? `Add To Cart` : (currentStatus == ProductStatus.Draft.toLowerCase() ? `Not Active` : (row?.stock > 0 ? `Unavailable` : `Out Of Stock`))}
                        onClick={(event: any) => {
                            event.stopPropagation();
                            const added = onAddToCart(row);
                            if (added !== false) toast.success(`${row?.name} Added To Cart`);
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
                                archiveProduct();
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
    const currentValue = String(getProductStatusLabel(row, true) || value || ProductStatus.Draft);
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
            targetID={`product-status-menu-${row?.id}`}
            id={`product-status-menu-trigger-${row?.id}`}
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
    onQuickEdit = undefined,
    quickEditProduct = null,
    onAddToCart = () => false, 
    mode = DataDisplayModes.Grid,
}: any) {
    const router = useRouter();
    const pathname = usePathname();
    const [productSelectionModel, setProductSelectionModel] = useState<GridRowSelectionModel>(() => createEmptyProductSelectionModel());
    const [selectedProductIDs, setSelectedProductIDs] = useState<string[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [pendingNameByID, setPendingNameByID] = useState<Record<string, string>>({});
    const [pendingPriceByID, setPendingPriceByID] = useState<Record<string, number>>({});
    const [pendingStockByID, setPendingStockByID] = useState<Record<string, number>>({});
    const [selectedActiveProductIDs, setSelectedActiveProductIDs] = useState<string[]>([]);
    const [optimisticNameByID, setOptimisticNameByID] = useState<Record<string, string>>({});
    const [optimisticPriceByID, setOptimisticPriceByID] = useState<Record<string, number>>({});
    const [optimisticStockByID, setOptimisticStockByID] = useState<Record<string, number>>({});
    const [selectedInactiveProductIDs, setSelectedInactiveProductIDs] = useState<string[]>([]);
    const { products = [], productsLoading = false } = useContext<any>(StateGlobals);
    const { user, showAlert, showConfirm, setAppDialog, closeAppDialog } = useContext<any>(StateGlobals);
    const editProduct = (product: Product | null) => onQuickEdit ? onQuickEdit(product) : setSelectedProduct(product);
    const routeProductID = decodeURIComponent(pathname?.match(productRoutePattern)?.[1] || ``);
    const openProductDetails = (product: Product | null) => {
        if (!product?.id) return;
        setSelectedProduct(product);
        const nextPath = `/store/product/${encodeURIComponent(String(product?.id))}`;
        if (pathname != nextPath) router.push(nextPath);
    };
    const closeProductDetails = () => {
        setSelectedProduct(null);
        if (routeProductID) router.replace(`/store`);
    };

    const { saveCart } = useStoreCart();
    // const canManageStore = minRole(user?.role, Roles.Editor);
    // const toggleQuickEditProduct = (product: Product | null) => setQuickEditProduct((prev: any) => prev?.id == product?.id ? null : product);

    useCheckoutReturnToast(saveCart);

    const renderBatchProgress = ({
        total = 0,
        failed = 0,
        processed = 0,
        actionLabel = `Deleting`,
    }: any = {}) => {
        const progress = total > 0 ? Math.round((processed / total) * 100) : 0;
        return (
            <div style={{ width: `100%`, marginTop: 8 }}>
                <Skeleton variant={`rectangular`} animation={`wave`} height={44} style={{ borderRadius: 6, marginBottom: 10 }} />
                <div style={{ opacity: 0.92, fontSize: 12, marginBottom: 6 }}>
                    {`${actionLabel} Product(s) ${processed}/${total}${failed > 0 ? ` - Failed ${failed}` : ``}`}
                </div>
                <LinearProgress
                    value={progress}
                    variant={`determinate`}
                    style={{ borderRadius: 9999 }}
                />
                <div style={{ marginTop: 8, opacity: 0.85, fontSize: 12 }}>
                    {progress}% Complete
                </div>
            </div>
        );
    };

    const clearProductSelections = () => {
        const nextSelectionModel = createEmptyProductSelectionModel();
        setProductSelectionModel(nextSelectionModel);
        setSelectedProductIDs([]);
        setSelectedActiveProductIDs([]);
        setSelectedInactiveProductIDs([]);
    };

    const runProductBatchAction = async ({
        mode = `delete`,
        selectedIDs = [],
        title = `Batch Action`,
        productsToProcess = [],
        successMessage = `Done`,
        confirmText = `Confirm`,
        actionLabel = `Processing`,
        confirmMessage = `Continue?`,
        confirmColor = `var(--error)`,
        confirmActionIcon = <Delete />,
    }: any = {}) => {
        if (selectedIDs?.length <= 1 || productsToProcess?.length <= 0) {
            toast.warn(`Select Multiple Product(s)`);
            return;
        }
        const confirmed = await showConfirm({
            title,
            confirmText,
            cancelText: `Cancel`,
            message: confirmMessage,
            cancelAction: { color: `var(--buttons)` },
            confirmAction: { color: confirmColor, className: `dialogDeleteAction`, icon: confirmActionIcon },
        });
        if (!confirmed) return;
        showAlert({
            title,
            message: `Please Wait`,
            confirmText: `Hide`,
            content: renderBatchProgress({ actionLabel, processed: 0, failed: 0, total: productsToProcess?.length }),
            className: `dialogAlert dialogCustom`,
        });
        let failed = 0;
        let processed = 0;
        for (const product of productsToProcess) {
            try {
                if (mode == `archive`) {
                    const archived = await updateProductInDatabase(String(product?.id), { status: ProductStatus.Archived }, user, true);
                    if (!archived) failed += 1;
                } else {
                    const deleted = await deleteProductFromDatabase(product, user);
                    if (!deleted) failed += 1;
                }
            } catch {
                failed += 1;
            } finally {
                processed += 1;
                flushSync(() => {
                    setAppDialog((prev: any) => prev ? ({
                        ...prev,
                        content: renderBatchProgress({ actionLabel, failed, processed, total: productsToProcess?.length }),
                    }) : prev);
                });
                await new Promise(resolve => requestAnimationFrame(() => resolve(true)));
            }
        }
        closeAppDialog(true);
        clearProductSelections();
        if (failed > 0) {
            toast.warn(`${actionLabel} ${processed - failed}/${productsToProcess?.length} Product(s)`);
            return;
        }
        toast.success(successMessage);
    };

    const onBatchDeleteProducts = async () => {
        const selectedProducts = products?.filter((product: Product) => selectedInactiveProductIDs?.includes(String(product?.id))) || [];
        const archivedProducts = selectedProducts?.filter((product: Product) => String(product?.status || ``)?.toLowerCase() == ProductStatus.Archived.toLowerCase());
        const blockedCount = selectedProducts?.length - archivedProducts?.length;
        await runProductBatchAction({
            mode: `delete`,
            confirmText: `Delete`,
            actionLabel: `Deleting`,
            title: `Delete Product(s)`,
            confirmColor: `var(--error)`,
            confirmActionIcon: <Delete />,
            productsToProcess: archivedProducts,
            selectedIDs: selectedInactiveProductIDs,
            successMessage: `Deleted ${archivedProducts?.length} Product(s)`,
            confirmMessage: blockedCount > 0
                ? `Delete ${archivedProducts?.length} Archived Product(s)? ${blockedCount} Selected Product(s) Are Not Archived And Will Be Skipped`
                : `Delete ${archivedProducts?.length} Archived Product(s)? This Cannot Be Undone`,
        });
    };

    const onBatchArchiveProducts = async () => {
        const selectedProducts = products?.filter((product: Product) => selectedActiveProductIDs?.includes(String(product?.id))) || [];
        const nonArchivedProducts = selectedProducts?.filter((product: Product) => String(product?.status || ``)?.toLowerCase() != ProductStatus.Archived.toLowerCase());
        const blockedCount = selectedProducts?.length - nonArchivedProducts?.length;
        await runProductBatchAction({
            mode: `archive`,
            confirmText: `Archive`,
            selectedIDs: selectedActiveProductIDs,
            productsToProcess: nonArchivedProducts,
            title: `Archive Product(s)`,
            actionLabel: `Archiving`,
            successMessage: `Archived ${nonArchivedProducts?.length} Product(s)`,
            confirmColor: `var(--links)`,
            confirmActionIcon: <Archive />,
            confirmMessage: blockedCount > 0
                ? `Archive ${nonArchivedProducts?.length} Product(s)? ${blockedCount} Product(s) Already Archived And Will Be Skipped`
                : `Archive ${nonArchivedProducts?.length} Product(s)?`,
        });
    };

    useEffect(() => {
        if (!routeProductID) {
            if (selectedProduct != null) setSelectedProduct(null);
            return;
        }
        if (productsLoading || products?.length == 0) return;
        const matchedProduct = products?.find((product: Product) => String(product?.id) == routeProductID || String(product?.number) == routeProductID) || null;
        if (matchedProduct?.id) {
            setSelectedProduct(prev => String(prev?.id) == String(matchedProduct?.id) ? prev : matchedProduct);
            return;
        }
        setSelectedProduct(null);
    }, [products, productsLoading, routeProductID]);

    useEffect(() => {
        setOptimisticNameByID(prev => {
            let changed = false;
            const next = { ...prev };
            Object.entries(prev).forEach(([id, optimisticName]) => {
                const liveName = String(products?.find((product: Product) => String(product?.id) == id)?.name ?? ``);
                if (liveName == String(optimisticName || ``)) {
                    delete next[id];
                    changed = true;
                }
            });
            return changed ? next : prev;
        });
        setOptimisticPriceByID(prev => {
            let changed = false;
            const next = { ...prev };
            Object.entries(prev).forEach(([id, optimisticPrice]) => {
                const livePrice = Number(products?.find((product: Product) => String(product?.id) == id)?.price ?? NaN);
                if (!Number.isNaN(livePrice) && livePrice == Number(optimisticPrice)) {
                    delete next[id];
                    changed = true;
                }
            });
            return changed ? next : prev;
        });
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
        const productIDs = products?.map((p: Product | null) => p?.id);
        const uniqueIDs: any = [ ...new Set(selectedProductIDs?.filter(id => productIDs?.includes(id))) ];
        onSelectedRowsChange(uniqueIDs);
    }, [products]);

    const onChangeNameDraft = (row: Product, nextName: string) => {
        setPendingNameByID(prev => ({ ...prev, [String(row?.id)]: nextName }));
    };

    const onCancelNameDraft = (row: Product) => {
        const rowID = String(row?.id);
        setPendingNameByID(prev => {
            const next = { ...prev };
            delete next[rowID];
            return next;
        });
    };

    const onSaveNameDraft = (row: Product, nextName: string, originalName: string) => {
        const safeName = String(nextName || ``).trim();
        const rowID = String(row?.id);
        if (safeName == String(originalName || ``).trim()) return onCancelNameDraft(row);
        setOptimisticNameByID(prev => ({ ...prev, [rowID]: safeName }));
        onCancelNameDraft(row);
        updateProductInDatabase(rowID, { name: safeName }, user)?.then(() => {
            toast.success(`Product Name Updated`);
        }).catch(() => {
            setOptimisticNameByID(prev => {
                const next = { ...prev };
                delete next[rowID];
                return next;
            });
            toast.error(`Product Name Update Failed`);
        });
    };

    const onIncreasePriceDraft = (row: Product, currentPrice: number) => {
        const step = 1;
        setPendingPriceByID(prev => ({ ...prev, [String(row?.id)]: Math.max(0, toStep(Number(currentPrice || 0) + step)) }));
    };

    const onDecreasePriceDraft = (row: Product, currentPrice: number) => {
        const step = 1;
        setPendingPriceByID(prev => ({ ...prev, [String(row?.id)]: Math.max(0, toStep(Number(currentPrice || 0) - step)) }));
    };
    const onChangePriceDraft = (row: Product, nextPrice: string | number) => {
        setPendingPriceByID(prev => ({ ...prev, [String(row?.id)]: Math.max(0, toStep(Number(nextPrice || 0))) }));
    };

    const onCancelPriceDraft = (row: Product) => {
        const rowID = String(row?.id);
        setPendingPriceByID(prev => {
            const next = { ...prev };
            delete next[rowID];
            return next;
        });
    };

    const onSavePriceDraft = (row: Product, nextPrice: number, originalPrice: number) => {
        const safePrice = Math.max(0, toStep(Number(nextPrice || 0)));
        const rowID = String(row?.id);
        if (safePrice == Math.max(0, Number(originalPrice || 0))) return onCancelPriceDraft(row);
        setOptimisticPriceByID(prev => ({ ...prev, [rowID]: safePrice }));
        onCancelPriceDraft(row);
        updateProductInDatabase(rowID, { price: safePrice }, user)?.then(() => {
            toast.success(`Product Price Updated`);
        }).catch(() => {
            setOptimisticPriceByID(prev => {
                const next = { ...prev };
                delete next[rowID];
                return next;
            });
            toast.error(`Product Price Update Failed`);
        });
    };

    const onIncreaseStockDraft = (row: Product, currentStock: number) => {
        setPendingStockByID(prev => ({ ...prev, [String(row?.id)]: Math.max(0, toStep(Number(currentStock || 0) + 0.01)) }));
    };

    const onDecreaseStockDraft = (row: Product, currentStock: number) => {
        setPendingStockByID(prev => ({ ...prev, [String(row?.id)]: Math.max(0, toStep(Number(currentStock || 0) - 0.01)) }));
    };
    const onChangeStockDraft = (row: Product, nextStock: string | number) => {
        setPendingStockByID(prev => ({ ...prev, [String(row?.id)]: Math.max(0, toStep(Number(nextStock || 0))) }));
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
        const safeStock = Math.max(0, toStep(Number(nextStock || 0)));
        const rowID = String(row?.id);
        if (safeStock == Math.max(0, Number(originalStock || 0))) return onCancelStockDraft(row);
        const updates: any = { stock: safeStock };
        if (safeStock <= 0 && String(row?.status || ``).toLowerCase() != ProductStatus.Archived.toLowerCase()) updates.status = ProductStatus.Unavailable;
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
            width: 70,
            field: `imageURL`,
            filterable: false,
            headerName: `Image`,
            headerClassName: `imageHeaderCell`,
            renderCell: ({ row }: any) => <ProductImageCell row={row} />,
        },
        {
            flex: 1,
            field: `name`,
            maxWidth: 165,
            headerName: `Name`,
            renderCell: ({ row, value }: any) => (
                <EditableCell
                    mode={`text`}
                    value={value}
                    saveOnEnter={true}
                    showStepper={false}
                    showActions={false}
                    cancelOnBlur={true}
                    placeholder={`Name`}
                    onCancel={() => onCancelNameDraft(row)}
                    canEdit={minRole(user?.role, Roles.Administrator)}
                    onChangeValue={(next: string) => onChangeNameDraft(row, next)}
                    onSave={(next: string, original: string) => onSaveNameDraft(row, next, original)}
                    pendingValue={(pendingNameByID?.[String(row?.id)] ?? optimisticNameByID?.[String(row?.id)])}
                />
            ),
        },
        {
            width: 115,
            field: `price`,
            type: `number`,
            headerName: `Price`,
            headerClassName: `numberHeaderCell`,
            renderCell: ({ row, value }: any) => (
                <ProductStockCell
                    row={row}
                    value={value}
                    placeholder={`Price`}
                    hasRenderedValue={true}
                    onSave={onSavePriceDraft}
                    onCancel={onCancelPriceDraft}
                    onIncrease={onIncreasePriceDraft}
                    onDecrease={onDecreasePriceDraft}
                    onChangeValue={onChangePriceDraft}
                    pendingStock={(pendingPriceByID?.[String(row?.id)] ?? optimisticPriceByID?.[String(row?.id)])}
                    renderValue={(priceCents: number) => (
                        <IconText 
                            dollarSign 
                            format={false} 
                            className={`stockText`} 
                            number={Number(priceCents || 0) / 100} 
                            dollarSignColor={storeDollarSignColor} 
                        />
                    )}
                />
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
                    placeholder={`Quantity`}
                    onSave={onSaveStockDraft}
                    onCancel={onCancelStockDraft}
                    onIncrease={onIncreaseStockDraft}
                    onDecrease={onDecreaseStockDraft}
                    onChangeValue={onChangeStockDraft}
                    pendingStock={(pendingStockByID?.[String(row?.id)] ?? optimisticStockByID?.[String(row?.id)])}
                    renderValue={(qty: number) => (
                        <IconText 
                            format={true}
                            showIcon={false} 
                            number={Number(qty)} 
                            className={`stockText`} 
                        />
                    )}
                />
            ),
        },
        // { field: `created_by`, headerName: `Created By`, width: 145 },
        // { field: `updated_by`, headerName: `Updated By`, width: 145 },
        { field: `created_at`, headerName: `Created`, width: 155 },
        { field: `updated`, headerName: `Updated`, width: 155 },
        // { field: `sku`, headerName: `SKU`, width: 130 },
        { width: 150, field: `status`, headerName: `Status`, renderCell: ({ row, value }: any) => <ProductStatusCell row={row} value={value} /> },
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
            renderCell: ({ row }: any) => (
                <ProductActionsCell 
                    row={row} 
                    onEdit={editProduct} 
                    onAddToCart={onAddToCart} 
                    onBatchDeleteProducts={onBatchDeleteProducts}
                    quickEditing={quickEditProduct?.id == row?.id} 
                    onBatchArchiveProducts={onBatchArchiveProducts}
                    clearSelectedProductRows={clearProductSelections}
                    selectedActiveProductIDs={selectedActiveProductIDs}
                    selectedInactiveProductIDs={selectedInactiveProductIDs}
                />
            ),
        },
    ];

    const onSelectedRowsChange = (selectionModel: GridRowSelectionModel) => {
        const safeSelectionModel = normalizeProductSelectionModel(selectionModel);
        const selectedIDs = getSelectedProductIDs(safeSelectionModel, products);
        const rows = products?.filter((p: Product | null) => selectedIDs?.includes(String(p?.id)));
        const inactiveRows = rows?.filter((p: Product | null) => p?.status == ProductStatus.Archived);
        const activeRows = rows?.filter((p: Product | null) => p?.status != ProductStatus.Archived);
        const inactiveIds = inactiveRows?.map((p: Product | null) => p?.id);
        const activeIds = activeRows?.map((p: Product | null) => p?.id);
        setProductSelectionModel(safeSelectionModel);
        setSelectedProductIDs(selectedIDs);
        setSelectedInactiveProductIDs(inactiveIds);
        setSelectedActiveProductIDs(activeIds);
    }

    return (
        <>
            <Table
                type={type}
                mode={mode}
                rows={products}
                columns={productColumns}
                loading={productsLoading}
                className={`productsTableComponent`}
                gridProps={{
                    renderCard: (params: any) => <ProductCard {...params} />,
                }}
                dataGridProps={{
                    rowSelectionModel: normalizeProductSelectionModel(productSelectionModel),
                    onCellClick: ({ row, field }: any) => {
                        if (field == `actions`) return;
                        openProductDetails(row);
                    },
                    onRowSelectionModelChange: (selectionModel: GridRowSelectionModel) => {
                        onSelectedRowsChange(selectionModel);
                    },
                }}
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
            <ProductDetails
                product={selectedProduct}
                onClose={closeProductDetails}
                open={selectedProduct != null}
            />
        </>
    );
}
