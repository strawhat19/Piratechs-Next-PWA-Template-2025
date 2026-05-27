'use client';

import { useState } from 'react';

import Img from '@/app/components/image/image';
import IconText from '@/app/components/icon-text/icon-text';
import type { CartItem } from '@/app/components/store/use-store-cart';
import { Product, ProductStatus } from '@/shared/types/models/Product';
import EditableCell from '@/app/components/table/editable-cell/editable-cell';
import { richTextToPlainText } from '@/app/components/rich-text/rich-text';
import {
    AddShoppingCart,
    Inventory2,
    Palette,
    Star,
} from '@mui/icons-material';

const activeProductStatus = ProductStatus.Active.toLowerCase();

const getProductImageURL = (product: Product) => (
    product?.attachments?.[0]?.value ||
    product?.imageURL ||
    product?.imageURLs?.[0] ||
    product?.images?.[0]?.src ||
    product?.images?.[0]?.url ||
    ``
);

const getProductDescription = (product: Product) => (
    richTextToPlainText(product?.shortDescription || product?.description || product?.bodyHTML || ``)
);

export const isActiveProduct = (product: Product) => (
    String(product?.status || ``).toLowerCase() == activeProductStatus
);

type StorefrontProductMediaProps = {
    product: Product;
    featured?: boolean;
};

export const StorefrontProductMedia = ({
    product,
    featured = false,
}: StorefrontProductMediaProps) => {
    const imageURL = getProductImageURL(product);
    const [imageError, setImageError] = useState(false);
    const showFallback = !imageURL || imageError;
    if (showFallback) {
        return (
            <div className={`storefrontProductMedia storefrontProductMediaEmpty ${featured ? `featured` : ``}`.trim()}>
                <Palette fontSize={`small`} />
                <strong>{product?.name?.[0] || `A`}</strong>
            </div>
        );
    }
    return (
        <div className={`storefrontProductMedia ${featured ? `featured` : ``}`.trim()}>
            <Img
                src={imageURL}
                useLazyLoad={true}
                width={featured ? 680 : 460}
                height={featured ? 520 : 420}
                alt={product?.name || `Art product`}
                className={`storefrontProductImage`}
                onImageError={() => setImageError(true)}
            />
        </div>
    );
};

export type StorefrontProductCardProps = {
    product: Product;
    featured?: boolean;
    cartQuantity?: number;
    cartItem?: CartItem | null;
    onAddToCart: (product: Product) => void;
    onSaveCartQuantity?: (product: Product | CartItem, quantity: number) => boolean;
    onIncreaseCartQuantity?: (item: CartItem) => boolean;
    onDecreaseCartQuantity?: (item: CartItem) => boolean;
};

export const StorefrontProductCard = ({
    product,
    onAddToCart,
    featured = false,
    cartQuantity = 0,
    cartItem = null,
    onSaveCartQuantity = () => false,
    onIncreaseCartQuantity = () => false,
    onDecreaseCartQuantity = () => false,
}: StorefrontProductCardProps) => {
    const description = getProductDescription(product);
    const stock = Number(product?.stock ?? product?.inventoryQuantity ?? product?.totalInventory ?? 0);
    const canAddToCart = isActiveProduct(product) && stock > 0;
    const price = Number(product?.price || 0);
    const compareAtPrice = Number(product?.compareAtPrice || 0);
    const currentCartQuantity = Number(cartItem?.quantity ?? cartQuantity ?? 0);

    return (
        <article className={`storefrontProductCard ${featured ? `featured` : `standard`}`.trim()}>
            {featured ? (
                <div className={`storefrontProductRibbon`}>
                    <Star fontSize={`small`} />
                    Featured
                </div>
            ) : <></>}
            <StorefrontProductMedia product={product} featured={featured} />
            <div className={`storefrontProductBody`}>
                <div className={`storefrontProductIdentifiers`}>
                    <div className={`storefrontProductTopline`}>
                        <span># {product?.category || `Art`}</span>
                        {product?.productType ? <span># {product.productType}</span> : <></>}
                    </div>
                    <h3>{product?.name || `Untitled Piece`}</h3>
                    {description ? (
                        <p className={`lineClamp3`}>
                            {description}
                        </p>
                    ) : (
                        <p className={`lineClamp3`}>
                            Enter Product Description here for {`"${product?.name}"`}, this is just a placeholder.
                        </p>
                    )}
                </div>
                <div className={`storefrontProductMetrics`}>
                    <div className={`storefrontProductMeta`}>
                        <div className={`storefrontProductStock ${canAddToCart ? (stock > 25 ? `colorWarning` : ``) : `muted`}`.trim()}>
                            <Inventory2 fontSize={`small`} />
                            {canAddToCart ? (stock > 25 ? `Almost Out` : `In Stock`) : `Sold Out`}
                            {/* {canAddToCart ? `${stock} Available` : `Sold Out`} */}
                        </div>
                        <div className={`storefrontProductPrice`}>
                            <IconText
                                dollarSign
                                format={false}
                                number={price / 100}
                                className={`stockText`}
                            />
                            {compareAtPrice > price ? (
                                <IconText
                                    dollarSign
                                    format={false}
                                    className={`stockText`}
                                    number={compareAtPrice / 100}
                                />
                            ) : <></>}
                        </div>
                    </div>
                    <div className={`storeFrontProductCardCartOptions`}>
                        <button
                            type={`button`}
                            disabled={!canAddToCart}
                            className={`storefrontAddButton`}
                            onClick={() => onAddToCart(product)}
                            aria-label={`${canAddToCart ? `Add` : `Unavailable`} ${product?.name || `product`} to cart`}
                        >
                            <AddShoppingCart fontSize={`small`} />
                            {currentCartQuantity > 0 ? `Add Another` : `Add To Cart`}
                        </button>
                        {cartItem ? (
                            <div className={`productGridCardMetric productGridCardCartMetric storefrontProductCartMetric`}>
                                <EditableCell
                                    min={0}
                                    step={1}
                                    mode={`number`}
                                    showLabel={true}
                                    showStepper={true}
                                    saveOnEnter={true}
                                    placeholder={`In Cart`}
                                    value={cartItem?.quantity}
                                    pendingValue={cartItem?.quantity}
                                    onIncrease={() => onIncreaseCartQuantity?.(cartItem)}
                                    onDecrease={() => onDecreaseCartQuantity?.(cartItem)}
                                    onSave={(quantity: number) => onSaveCartQuantity?.(cartItem || product, quantity)}
                                />
                            </div>
                        ) : <></>}
                    </div>
                </div>
            </div>
        </article>
    );
};
