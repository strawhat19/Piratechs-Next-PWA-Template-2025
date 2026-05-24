'use client';

import { useState } from 'react';
import Img from '@/app/components/image/image';
import { Checkbox, Skeleton } from '@mui/material';
import { Product } from '@/shared/types/models/Product';
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

export default function ProductCard({
    row,
    selected,
    onSelect,
    selectable,
    onCardClick,
    renderColumn,
    checkboxAlignmentStart,
}: TableGridCardParams) {
    const product = row as Product;
    const imageURL = getProductImageURL(product);
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(Boolean(imageURL));
    return (
        <DataDisplayCard selected={selected} onClick={onCardClick} className={`productGridCard`} checkboxAlignmentStart={checkboxAlignmentStart}>
            <div className={`productGridCardMedia`}>
                {selectable ? (
                    <label className={`dataDisplayCardSelect productGridCardSelect`} onClick={(event) => event.stopPropagation()}>
                        <Checkbox
                            checked={selected}
                            size={`small`}
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
                        className={`productGridCardImage ${imageLoading ? `loading` : ``}`}
                        onImageLoad={() => setImageLoading(false)}
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
                    <span className={`productGridCardNumber`}>#{product?.number || `New`}</span>
                    {renderColumn(`status`, `productGridCardStatus`)}
                </div>
                <div className={`productGridCardName`}>
                    {renderColumn(`name`)}
                </div>
                <div className={`productGridCardMetrics`}>
                    <div className={`productGridCardMetric`}>
                        <span>Price</span>
                        {renderColumn(`price`)}
                    </div>
                    <div className={`productGridCardMetric`}>
                        <span>Qty</span>
                        {renderColumn(`stock`)}
                    </div>
                </div>
                <div className={`productGridCardMeta`}>
                    {renderColumn(`category`, `productGridCardMetaField`)}
                    {renderColumn(`productType`, `productGridCardMetaField`)}
                </div>
                <div className={`productGridCardActions`}>
                    {renderColumn(`actions`)}
                </div>
            </div>
        </DataDisplayCard>
    );
}
