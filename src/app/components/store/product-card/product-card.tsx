'use client';

import { useState } from 'react';
import Img from '@/app/components/image/image';
import { Checkbox, Skeleton } from '@mui/material';
import { Product } from '@/shared/types/models/Product';
import EditableCell from '@/app/components/table/editable-cell/editable-cell';
import type { CartItem } from '@/app/components/store/use-store-cart';
import { TableGridCardParams } from '@/app/components/table/table-grid/table-grid';
import DataDisplayCard from '@/app/components/table/data-display-card/data-display-card';

const getProductImageURL = (product: Product) => (
    product?.attachments?.[0]?.value ||
    product?.imageURL ||
    product?.imageURLs?.[0] ||
    product?.images?.[0]?.src ||
    product?.images?.[0]?.url ||
    ``
);

type ProductCardProps = TableGridCardParams & {
    cartItem?: CartItem | null;
    onSaveCartQuantity?: (product: Product | CartItem, quantity: number) => boolean;
    onIncreaseCartQuantity?: (item: CartItem) => boolean;
    onDecreaseCartQuantity?: (item: CartItem) => boolean;
};

export default function ProductCard({
    row,
    selected,
    onSelect,
    selectable,
    onCardClick,
    renderColumn,
    cartItem = null,
    checkboxAlignmentStart,
    onSaveCartQuantity = () => false,
    onIncreaseCartQuantity = () => false,
    onDecreaseCartQuantity = () => false,
}: ProductCardProps) {
    const product = row as Product;
    const imageURL = getProductImageURL(product);
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(Boolean(imageURL));
    return (
        <DataDisplayCard selected={selected} onClick={onCardClick} className={`productGridCard ${product?.featured ? `featured` : ``}`} checkboxAlignmentStart={checkboxAlignmentStart}>
            <div className={`productGridCardMedia`}>
                {selectable ? (
                    <label className={`dataDisplayCardSelect productGridCardSelect`} onClick={(event) => event.stopPropagation()}>
                        <Checkbox
                            size={`small`}
                            checked={selected}
                            onChange={onSelect}
                            className={`dataDisplayCardCheckbox`}
                        />
                    </label>
                ) : <></>}
                {imageLoading ? (
                    <Skeleton variant={`rectangular`} animation={`wave`} className={`productGridCardImageSkeleton h100`} />
                ) : <></>}
                {imageURL && !imageError ? (
                    <Img
                        width={520}
                        height={420}
                        src={imageURL}
                        useLazyLoad={true}
                        alt={product?.name || `Product`}
                        onImageLoad={() => setImageLoading(false)}
                        className={`productGridCardImage ${imageLoading ? `loading` : ``}`}
                        onImageError={() => {
                            setImageError(true);
                            setImageLoading(false);
                        }}
                    />
                ) : (
                    <div className={`productGridCardImageEmpty`}>
                        {product?.name?.[0] || `P`}
                    </div>
                )}
            </div>
            <div className={`productGridCardBody`}>
                <div className={`productGridCardTop`}>
                    <span className={`productGridCardNumber`}>
                        {product?.number || `New`}
                    </span>
                    <span>{product?.featured ? `Featured` : `Feat.`}</span>
                    {renderColumn(`featured`)}
                    {renderColumn(`status`, `productGridCardStatus`)}
                </div>
                <div className={`productGridCardName`}>
                    {renderColumn(`name`, ``, { showLabel: true })}
                </div>
                <div className={`productGridCardMetrics`}>
                    <div className={`productGridCardMetric`}>
                        {renderColumn(`price`, ``, { showLabel: true })}
                    </div>
                    <div className={`productGridCardMetric`}>
                        {renderColumn(`stock`, ``, { showLabel: true })}
                    </div>
                </div>
                <div className={`productGridCardMeta`}>
                    {renderColumn(`category`, `productGridCardMetaField`)}
                    {renderColumn(`productType`, `productGridCardMetaField`)}
                </div>
                <div className={`productGridCardActions`}>
                    {renderColumn(`actions`)}
                    {cartItem ? (
                        <div className={`productGridCardMetric productGridCardCartMetric`}>
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
                                onIncrease={() => onIncreaseCartQuantity(cartItem)}
                                onDecrease={() => onDecreaseCartQuantity(cartItem)}
                                onSave={(quantity: number) => onSaveCartQuantity(cartItem || product, quantity)}
                            />
                        </div>
                    ) : <></>}
                </div>
            </div>
        </DataDisplayCard>
    );
}
