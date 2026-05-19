'use client';

import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Roles } from '@/shared/types/types';
import { Button, Dialog } from '@mui/material';
import { StateGlobals } from '@/shared/global-context';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Add, Close, OpenInFull, Remove, Save } from '@mui/icons-material';
import { ChangeEvent, FormEvent, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { addProductToDatabase, storage, updateProductInDatabase } from '@/shared/server/firebase';
import { capWords, customDate, getNextCollectionNumber, minRole, stringNoSpaces } from '@/shared/scripts/constants';
import { Product, ProductCategory, ProductImage, ProductStatus, ProductType, ProductVariant } from '@/shared/types/models/Product';

type ProductFormProps = {
    full?: boolean;
    open?: boolean;
    widget?: boolean;
    funsized?: boolean;
    className?: string;
    onClose?: () => void;
    fullFormURL?: string;
    product?: Product | null;
    onCancelEdit?: () => void;
    onSaved?: (product: Product) => void;
    onFullEdit?: (product: Product | null) => void;
};

type ProductFormVariant = {
    sku: string;
    title: string;
    price: string;
    option1: string;
    taxable: boolean;
    inventoryQuantity: string;
    requiresShipping: boolean;
};

const centsToDollars = (value?: number | string) => ((Number(value || 0) / 100) || 0).toFixed(2);
const dollarsToCents = (value?: number | string) => Math.round(Number(String(value || `0`).replace(/[^0-9.-]/g, ``) || 0) * 100);
const parseList = (value?: string) => String(value || ``).split(/[\n,]/).map(item => item.trim()).filter(Boolean);
const getFiles = (event: ChangeEvent<HTMLInputElement>) => Array.from(event?.target?.files || []);
const comparableFormValue = (value: any) => JSON.stringify(value ?? ``);

const getVariantForm = (variant?: ProductVariant, product?: Product): ProductFormVariant => ({
    sku: variant?.sku || product?.sku || ``,
    title: variant?.title || `Default`,
    price: centsToDollars(variant?.price || product?.price),
    option1: variant?.option1 || `Default`,
    taxable: variant?.taxable ?? product?.taxable ?? true,
    inventoryQuantity: String(variant?.inventoryQuantity ?? variant?.inventory_quantity ?? product?.stock ?? 0),
    requiresShipping: variant?.requiresShipping ?? variant?.requires_shipping ?? product?.requiresShipping ?? false,
});

const getProductForm = (product: Product | null | undefined, number: number) => ({
    number: Number(product?.number || number),
    sku: product?.sku || ``,
    name: product?.name || ``,
    tags: product?.tags?.join(`, `) || ``,
    cost: centsToDollars(product?.cost),
    stock: String(product?.stock ?? 0),
    price: centsToDollars(product?.price),
    brand: product?.brand || product?.vendor || ``,
    status: product?.status || ProductStatus.Active,
    weight: String(product?.weight ?? 0),
    vendor: product?.vendor || product?.brand || ``,
    currency: product?.currency || `usd`,
    category: product?.category || ProductCategory.Art,
    imageURLs: product?.imageURLs?.join(`\n`) || product?.imageURL || ``,
    taxable: product?.taxable ?? true,
    compareAtPrice: centsToDollars(product?.compareAtPrice),
    productType: product?.productType || ProductType.Sticker,
    description: product?.description || product?.bodyHTML || ``,
    allowBackorder: product?.allowBackorder ?? false,
    requiresShipping: product?.requiresShipping ?? false,
    trackInventory: product?.trackInventory ?? true,
    shortDescription: product?.shortDescription || ``,
    lowStockThreshold: String(product?.lowStockThreshold ?? 5),
});

const getImageObjects = (product: Product, imageURLs: string[]): ProductImage[] => imageURLs.map((src, index) => ({
    src,
    url: src,
    alt: product?.name,
    position: index + 1,
    productID: product?.id,
    product_id: product?.id,
    createdAt: product?.created,
    updatedAt: customDate()?.datetime,
    id: `${product?.id}_Image_${index + 1}`,
}));

const uploadProductImages = async (files: File[], product: Product, startIndex = 0): Promise<ProductImage[]> => {
    const uploads = files.map(async (file, index) => {
        const position = startIndex + index + 1;
        const storagePath = `products/${product?.id}/${Date.now()}_${position}_${stringNoSpaces(file?.name)}`;
        const productImageRef = ref(storage, storagePath);
        await uploadBytes(productImageRef, file, { contentType: file?.type, customMetadata: { productID: String(product?.id), productName: product?.name || `` } });
        const src = await getDownloadURL(productImageRef);
        return { src, url: src, storagePath, alt: product?.name, position, productID: product?.id, product_id: product?.id, id: `${product?.id}_Image_${position}`, createdAt: customDate()?.datetime, updatedAt: customDate()?.datetime };
    });
    return Promise.all(uploads);
}

const ProductField = ({ label, showInput = true, funsized = false, ...props }: any) => (
    <label className={`productField`}>
        {!funsized && <span>{label}</span>}
        {showInput && <input placeholder={label} {...props} />}
    </label>
);

const ProductTextAreaField = ({ label, ...props }: any) => (
    <label className={`productField productTextAreaField`}>
        <span>{label}</span>
        <textarea placeholder={label} {...props} />
    </label>
);

const ProductSelectField = ({ label, children, ...props }: any) => (
    <label className={`productField`}>
        <span>{label}</span>
        <select {...props}>{children}</select>
    </label>
);

export default function ProductForm({
    full = false,
    product = null,
    widget = false,
    funsized = false,
    onClose = () => {},
    onSaved = () => {},
    onFullEdit = undefined,
    onCancelEdit = undefined,
    className = `productFormComponent`,
    fullFormURL = `/store/product-form`,
}: ProductFormProps) {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement | null>(null);
    const preserveFormOnProductClearRef = useRef(false);

    const { user, products = [] } = useContext<any>(StateGlobals);

    const canManageProducts = minRole(user?.role, Roles.Administrator);
    const nextProductNumber = useMemo(() => getNextCollectionNumber(products), [products]);

    const [files, setFiles] = useState<File[]>([]);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState(() => getProductForm(product, nextProductNumber));
    const [variants, setVariants] = useState<ProductFormVariant[]>(() => (
        product?.variants?.length ? product.variants : [{} as ProductVariant]).map(
            variant => getVariantForm(variant, product || undefined)
        )
    );

    const compact = widget || !full;
    const resetProductForm = (productToUse: Product | null | undefined = product) => {
        formRef?.current?.reset();
        setFiles([]);
        setForm(getProductForm(productToUse, productToUse?.number || nextProductNumber));
        setVariants((productToUse?.variants?.length ? productToUse.variants : [{} as ProductVariant]).map(variant => getVariantForm(variant, productToUse || undefined)));
    }
    const openFullForm = () => {
        if (product?.id && onFullEdit) {
            onFullEdit(product);
            return;
        }
        router.push(fullFormURL);
    }
    const updateForm = (event: any) => {
        const target = event?.target;
        const value = target?.type == `checkbox` ? target?.checked : target?.value;
        setForm(prev => ({ ...prev, [target?.name]: value }));
    }
    const updateVariant = (index: number, field: keyof ProductFormVariant, value: string | boolean) => setVariants(prev => prev.map((variant, variantIndex) => variantIndex == index ? { ...variant, [field]: value } : variant));
    const addVariant = () => setVariants(prev => [...prev, getVariantForm(undefined, new Product({ name: form?.name, sku: form?.sku, price: dollarsToCents(form?.price), stock: Number(form?.stock || 0) }))]);
    const removeVariant = (index: number) => setVariants(prev => prev.length > 1 ? prev.filter((_, variantIndex) => variantIndex != index) : prev);
    const cancelProductEdit = () => {
        preserveFormOnProductClearRef.current = false;
        resetProductForm(null);
        onCancelEdit?.();
    }
    const clearProductForm = () => {
        resetProductForm(product);
    }

    const requiredFieldsFilled = () => form?.name?.trim() && Number(form?.price || 0) >= 0;
    const formMatchesProduct = () => {
        if (!product?.id) return false;
        const currentForm = getProductForm(product, product?.number || nextProductNumber);
        return [`name`, `price`, `stock`, `category`, `productType`, `status`, `imageURLs`].every(key => comparableFormValue((form as any)?.[key]) == comparableFormValue((currentForm as any)?.[key]));
    }

    useEffect(() => {
        if (!product?.id && preserveFormOnProductClearRef.current) {
            preserveFormOnProductClearRef.current = false;
            return;
        }
        resetProductForm(product);
    }, [product?.id, product?.updated, nextProductNumber]);

    const buildVariants = (productID: string | number, productSKU = form?.sku) => variants.map((variant, index) => ({
        productID,
        position: index + 1,
        product_id: productID,
        taxable: variant?.taxable,
        sku: variant?.sku || productSKU,
        title: variant?.title || `Default`,
        option1: variant?.option1 || `Default`,
        id: `${productID}_Variant_${index + 1}`,
        requiresShipping: variant?.requiresShipping,
        requires_shipping: variant?.requiresShipping,
        price: dollarsToCents(variant?.price || form?.price),
        available: Number(variant?.inventoryQuantity || form?.stock || 0) > 0,
        inventoryQuantity: Number(variant?.inventoryQuantity || form?.stock || 0),
        inventory_quantity: Number(variant?.inventoryQuantity || form?.stock || 0),
    }));

    const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!canManageProducts) return toast.error(`Product Form Restricted`);
        if (!requiredFieldsFilled()) return toast.error(`Required Product Field(s) Missing`);
        if (formMatchesProduct()) return toast.error(`Product Unchanged`);
        setSaving(true);
        try {
            const editing = product != null;
            const stock = Number(form?.stock || 0);
            const price = dollarsToCents(form?.price);
            const username = (user != null ? user?.email : Roles.Guest);
            const number = Number(form?.number || product?.number || nextProductNumber);
            const productDraft = new Product({
                ...product,
                // number,
                price,
                stock,
                sku: form?.sku,
                name: form?.name,
                brand: form?.brand,
                updated_by: username,
                status: form?.status,
                vendor: form?.vendor,
                taxable: form?.taxable,
                category: form?.category,
                currency: form?.currency,
                tags: parseList(form?.tags),
                title: capWords(form?.name),
                productType: form?.productType,
                description: form?.description,
                cost: dollarsToCents(form?.cost),
                weight: Number(form?.weight || 0),
                allowBackorder: form?.allowBackorder,
                trackInventory: form?.trackInventory,
                requiresShipping: form?.requiresShipping,
                shortDescription: form?.shortDescription,
                categories: [form?.category].filter(Boolean),
                ...(editing ? {} : { created_by: username, }),
                compareAtPrice: dollarsToCents(form?.compareAtPrice),
                lowStockThreshold: Number(form?.lowStockThreshold || 5),
            });
            const urlImages = getImageObjects(productDraft, parseList(form?.imageURLs));
            const uploadedImages = await uploadProductImages(files, productDraft, urlImages?.length);
            const images = [...urlImages, ...uploadedImages];
            const productToSave = new Product({
                ...productDraft,
                images,
                image: images?.[0],
                imageURL: images?.[0]?.src || ``,
                variants: buildVariants(productDraft?.id, productDraft?.sku),
                imageURLs: images?.map(image => image?.src || image?.url || ``).filter(Boolean),
            });
            const savedProduct = product?.id ? await updateProductInDatabase(String(product?.id), productToSave, user) : await addProductToDatabase(productToSave, user);
            if (!savedProduct) throw new Error(`Product Save Failed`);
            toast.success(`Product Saved`);
            onSaved(savedProduct);
            if (!product?.id) {
                setFiles([]);
                setForm(getProductForm(null, Number(number) + 1));
                setVariants([getVariantForm(undefined, new Product({ price, stock, name: form?.name, sku: form?.sku }))]);
            }
            onClose?.();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : `Product Save Failed`);
        } finally {
            setSaving(false);
        }
    }

    if (!canManageProducts) return compact ? null : (
        <div className={`productFormRestricted`}>
            Product Form Restricted
        </div>
    );

    return (
        <div className={`${className} ${funsized ? `funsized` : ``} ${compact ? `productFormWidget` : `productFormFull`} ${product?.id ? `productFormEditing pulsate` : ``}`}>
            <form ref={formRef} onSubmit={saveProduct}>
                <div className={`productFormHeader`}>
                    {!funsized && (
                        <div className={`productFormTitle`}>
                            <h3>
                                {product?.id ? `Editing Product #${form?.number} "${form?.name}"` : (
                                    compact ? `Create Product (${form?.number})` : `Product Form`
                                )}
                            </h3>
                        </div>
                    )}
                    <div className={`productFormActions`}>
                        {compact ? (
                            <Button type={`button`} className={`productFormButton`} onClick={openFullForm}>
                                <OpenInFull fontSize={`small`} /> Full
                            </Button>
                        ) : <></>}
                        {product == null ? (
                            <Button disabled={saving || !requiredFieldsFilled() || formMatchesProduct()} type={`button`} className={`productFormButton productCancelButton ${(saving || !requiredFieldsFilled() || formMatchesProduct()) ? `disabled` : ``}`} onClick={clearProductForm}>
                                <Close fontSize={`small`} /> Clear
                            </Button>
                        ) : <></>}
                        {product?.id && onCancelEdit ? <Button type={`button`} className={`productFormButton productCancelButton`} onClick={cancelProductEdit}>
                            <Close fontSize={`small`} /> Cancel
                        </Button> : <></>}
                        <Button type={`submit`} disabled={saving || !requiredFieldsFilled() || formMatchesProduct()} className={`productFormButton productSaveButton ${(saving || !requiredFieldsFilled() || formMatchesProduct()) ? `disabled` : ``}`}>
                            <Save fontSize={`small`} /> {saving ? `Saving` : `Save`}
                        </Button>
                    </div>
                </div>
                <div className={`productFormGrid`}>
                    {!compact ? <ProductField funsized={funsized} disabled={true} label={`Number`} name={`number`} type={`number`} value={form?.number} onChange={updateForm} /> : <></>}
                    <ProductField funsized={funsized} label={`Product Name`} name={`name`} type={`text`} value={form?.name} onChange={updateForm} required />
                    <ProductField funsized={funsized} label={`Price`} name={`price`} type={`number`} min={`0`} step={`0.01`} value={form?.price} onChange={updateForm} required />
                    <ProductField funsized={funsized} label={`Stock`} name={`stock`} type={`number`} min={`0`} step={`1`} value={form?.stock} onChange={updateForm} />
                    {!funsized && product != null && <>
                        <ProductSelectField label={`Category`} name={`category`} value={form?.category} onChange={updateForm}>
                            {Object.values(ProductCategory).map(category => <option key={category} value={category}>{category}</option>)}
                        </ProductSelectField>
                        <ProductSelectField label={`Type`} name={`productType`} value={form?.productType} onChange={updateForm}>
                            {Object.values(ProductType).map(type => <option key={type} value={type}>{type}</option>)}
                        </ProductSelectField>
                        <ProductSelectField label={`Status`} name={`status`} value={form?.status} onChange={updateForm}>
                            {Object.values(ProductStatus).map(status => <option key={status} value={status}>{status}</option>)}
                        </ProductSelectField>
                    </>}
                    <ProductField funsized={funsized} label={`Image(s)`} name={`imageURLs`} type={`upload`} value={form?.imageURLs} onChange={updateForm} showInput={true} />
                    {/* <div>
                        <span className={`productFieldLabelText`}>Image(s)</span>
                        <label className={`productUploadField`}>
                            <UploadFile fontSize={`small`} />
                            <span className={`productUploadText`}>{files?.length > 0 ? `${files.length} Image(s)` : `Image(s)`}</span>
                            <input multiple type={`file`} accept={`image/*`} onChange={(event) => setFiles(getFiles(event))} />
                        </label>
                    </div> */}
                </div>
                {!compact ? <>
                    <div className={`productFormGrid`}>
                        <ProductField funsized={funsized} label={`SKU`} name={`sku`} type={`text`} value={form?.sku} onChange={updateForm} />
                        <ProductField funsized={funsized} label={`Vendor`} name={`vendor`} type={`text`} value={form?.vendor} onChange={updateForm} />
                        <ProductField funsized={funsized} label={`Brand`} name={`brand`} type={`text`} value={form?.brand} onChange={updateForm} />
                        <ProductField funsized={funsized} label={`Tag(s)`} name={`tags`} type={`text`} value={form?.tags} onChange={updateForm} />
                    </div>
                    <div className={`productFormGrid`}>
                        <ProductField funsized={funsized} label={`Cost`} name={`cost`} type={`number`} min={`0`} step={`0.01`} value={form?.cost} onChange={updateForm} />
                        <ProductField funsized={funsized} label={`Weight`} name={`weight`} type={`number`} min={`0`} step={`0.01`} value={form?.weight} onChange={updateForm} />
                        <ProductField funsized={funsized} label={`Currency`} name={`currency`} type={`text`} value={form?.currency} onChange={updateForm} />
                        <ProductField funsized={funsized} label={`Compare At`} name={`compareAtPrice`} type={`number`} min={`0`} step={`0.01`} value={form?.compareAtPrice} onChange={updateForm} />
                        <ProductField funsized={funsized} label={`Low Stock`} name={`lowStockThreshold`} type={`number`} min={`0`} step={`1`} value={form?.lowStockThreshold} onChange={updateForm} />
                    </div>
                    <div className={`productFormChecks`}>
                        <label><input name={`taxable`} type={`checkbox`} checked={form?.taxable} onChange={updateForm} /> Taxable</label>
                        <label><input name={`trackInventory`} type={`checkbox`} checked={form?.trackInventory} onChange={updateForm} /> Track Inventory</label>
                        <label><input name={`allowBackorder`} type={`checkbox`} checked={form?.allowBackorder} onChange={updateForm} /> Allow Backorder</label>
                        <label><input name={`requiresShipping`} type={`checkbox`} checked={form?.requiresShipping} onChange={updateForm} /> Requires Shipping</label>
                    </div>
                    <div className={`productFormGrid productTextGrid`}>
                        <ProductTextAreaField label={`Short Description`} name={`shortDescription`} value={form?.shortDescription} onChange={updateForm} />
                        <ProductTextAreaField label={`Description`} name={`description`} value={form?.description} onChange={updateForm} />
                        <ProductTextAreaField label={`Image URL(s)`} name={`imageURLs`} value={form?.imageURLs} onChange={updateForm} />
                    </div>
                    <div className={`productVariantSection`}>
                        <div className={`productVariantHeader`}>
                            <strong>Variant(s)</strong>
                            <Button type={`button`} className={`productFormButton`} onClick={addVariant}><Add fontSize={`small`} /> Add</Button>
                        </div>
                        {variants.map((variant, index) => (
                            <div key={`${index}_${variant?.sku}`} className={`productVariantRow`}>
                                <ProductField funsized={funsized} label={`Title`} value={variant?.title} onChange={(event: any) => updateVariant(index, `title`, event?.target?.value)} />
                                <ProductField funsized={funsized} label={`Option`} value={variant?.option1} onChange={(event: any) => updateVariant(index, `option1`, event?.target?.value)} />
                                <ProductField funsized={funsized} label={`SKU`} value={variant?.sku} onChange={(event: any) => updateVariant(index, `sku`, event?.target?.value)} />
                                <ProductField funsized={funsized} label={`Price`} type={`number`} min={`0`} step={`0.01`} value={variant?.price} onChange={(event: any) => updateVariant(index, `price`, event?.target?.value)} />
                                <ProductField funsized={funsized} label={`Qty`} type={`number`} min={`0`} step={`1`} value={variant?.inventoryQuantity} onChange={(event: any) => updateVariant(index, `inventoryQuantity`, event?.target?.value)} />
                                <label><input type={`checkbox`} checked={variant?.taxable} onChange={(event) => updateVariant(index, `taxable`, event?.target?.checked)} /> Tax</label>
                                <label><input type={`checkbox`} checked={variant?.requiresShipping} onChange={(event) => updateVariant(index, `requiresShipping`, event?.target?.checked)} /> Ship</label>
                                <Button type={`button`} className={`productFormButton productRemoveButton`} onClick={() => removeVariant(index)}><Remove fontSize={`small`} /></Button>
                            </div>
                        ))}
                    </div>
                </> : <></>}
            </form>
        </div>
    )
}

export const ProductFormDialog = ({ open = false, onClose = () => {}, product = null }: ProductFormProps) => (
    <Dialog open={open} onClose={onClose} maxWidth={`lg`} fullWidth>
        <div className={`productFormDialog`}>
            <Button className={`productDialogClose`} onClick={onClose}><Close fontSize={`small`} /></Button>
            {open ? <ProductForm full key={String(product?.id || `new-product`)} product={product} onClose={onClose} /> : <></>}
        </div>
    </Dialog>
);
