'use client';

import { useContext, useState } from 'react';
import Img from '@/app/components/image/image';
import { Checkbox, Skeleton } from '@mui/material';
import { Roles, Types } from '@/shared/types/types';
import { minRole } from '@/shared/scripts/constants';
import { StateGlobals } from '@/shared/global-context';
import { Product } from '@/shared/types/models/Product';
import type { CartItem } from '@/app/components/store/use-store-cart';
import EditableCell from '@/app/components/table/editable-cell/editable-cell';
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

const getProductMediaStyle = (product: Product, showFallback: boolean) => {
    if (!showFallback) return undefined;
    const accentColor = product?.color?.color;
    if (!accentColor) return undefined;
    const accentMix = product?.color?.type == `dark` ? 18 : 12;
    const baseMix = product?.color?.type == `dark` ? 16 : 10;
    return {
        background: `radial-gradient(circle at 22% 18%, color-mix(in srgb, ${accentColor} ${accentMix}%, rgba(255, 255, 255, 0.16)), transparent 34%), linear-gradient(135deg, color-mix(in srgb, ${accentColor} ${baseMix}%, rgba(var(--cool_neon_blue_rgb), 0.16)), rgba(255, 255, 255, 0.045)), var(--navy)`,
    };
};

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
    const { user } = useContext<any>(StateGlobals);
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(Boolean(imageURL));
    const showFallbackImage = !imageURL || imageError;
    return (
        <DataDisplayCard selected={selected} onClick={onCardClick} className={`productGridCard ${product?.featured ? `featured` : ``}`} checkboxAlignmentStart={checkboxAlignmentStart}>
            <div className={`productGridCardMedia`} style={getProductMediaStyle(product, showFallbackImage)}>
                {(selectable && (user != null && minRole(user?.role, Roles.Editor))) ? (
                    <label className={`dataDisplayCardSelect productGridCardSelect`} onClick={(event) => event?.stopPropagation()}>
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
                {!showFallbackImage ? (
                    <Img
                        width={520}
                        height={420}
                        src={imageURL}
                        useLazyLoad={true}
                        alt={product?.name || Types.Product}
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
                <div className={`productGridCardName`}>
                    {renderColumn(`name`, ``, { showLabel: user != null && minRole(user?.role, Roles.Editor) })}
                </div>
                {(user != null && minRole(user?.role, Roles.Editor)) && <>
                    <div className={`productGridCardTop`}>
                        <span className={`productGridCardNumber cardNumber`}>
                            {product?.number || 0}
                        </span>
                        <span>
                            {product?.featured ? `Featured` : `Feat.`}
                        </span>
                        {renderColumn(`featured`)}
                        {renderColumn(`status`, `cardNumber productGridCardStatus`)}
                    </div>
                    <div className={`productGridCardMeta`}>
                        {renderColumn(`category`, `productGridCardMetaField`)}
                        {renderColumn(`productType`, `productGridCardMetaField`)}
                    </div>
                </>}
                <div className={`productGridCardMetrics`}>
                    {(user != null && minRole(user?.role, Roles.Editor)) && <>
                        <div className={`productGridCardMetric`}>
                            {renderColumn(`stock`, ``, { showLabel: true })}
                        </div>
                    </>}
                    <div className={`productGridCardMetric`}>
                        {renderColumn(`price`, ``, { showLabel: user != null && minRole(user?.role, Roles.Editor) })}
                    </div>
                </div>
                {(user != null && minRole(user?.role, Roles.Editor)) && <>
                    <div className={`storeGridCardMeta`}>
                        <div className={`storeGridCardMetaItem`}>
                            <span>Created</span>
                            {renderColumn(`created_at`)}
                        </div>
                        <div className={`storeGridCardMetaItem`}>
                            <span>Updated</span>
                            {renderColumn(`updated`)}
                        </div>
                    </div>
                </>}
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
