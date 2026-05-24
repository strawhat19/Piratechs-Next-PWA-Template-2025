'use client';

import { Checkbox } from '@mui/material';
import { ReceiptLong } from '@mui/icons-material';
import { Order } from '@/shared/types/models/Order';
import DataDisplayCard from '@/app/components/table/data-display-card/data-display-card';
import { TableGridCardParams } from '@/app/components/table/table-grid/table-grid';

const getOrderCardStatusClass = (order: Order) => {
    const statusText = [order?.status, order?.paymentStatus, order?.stripe_status, order?.stripeStatus].map(status => String(status || ``)).join(` `).toLowerCase();
    if ([`failed`, `canceled`, `cancelled`, `refunded`].some(label => statusText.includes(label))) return `orderStatusFailed`;
    if ([`paid`, `succeeded`, `complete`, `completed`].some(label => statusText.includes(label))) return `orderStatusPaid`;
    return `orderStatusNeutral`;
};

export default function OrderCard({
    row,
    selected,
    onSelect,
    selectable,
    onCardClick,
    renderColumn,
    checkboxAlignmentStart,
}: TableGridCardParams) {
    const order = row as Order;
    const statusClass = getOrderCardStatusClass(order);
    const lineItemCount = order?.lineItems?.length || order?.cartItems?.length || 0;

    return (
        <DataDisplayCard selected={selected} onClick={onCardClick} className={`storeGridCard orderGridCard`} checkboxAlignmentStart={checkboxAlignmentStart}>
            <div className={`storeGridCardHero orderGridCardHero ${statusClass}`}>
                {selectable ? (
                    <label className={`dataDisplayCardSelect storeGridCardSelect`} onClick={(event) => event.stopPropagation()}>
                        <Checkbox
                            checked={selected}
                            size={`small`}
                            onChange={onSelect}
                            className={`dataDisplayCardCheckbox`}
                        />
                    </label>
                ) : <></>}
                <div className={`storeGridCardHeroIcon orderGridCardIcon ${statusClass}`}>
                    <ReceiptLong />
                </div>
                <div className={`storeGridCardHeroText`}>
                    <span>Order</span>
                    <strong>#{order?.number || `New`}</strong>
                </div>
            </div>
            <div className={`storeGridCardBody`}>
                <div className={`storeGridCardTop`}>
                    <span className={`storeGridCardNumber`}>#{order?.number || `New`}</span>
                    {renderColumn(`actions`, `storeGridCardActionsCompact`)}
                </div>
                <div className={`storeGridCardTitle lineClamp1`}>
                    {order?.userEmail || order?.userName || `Customer`}
                </div>
                <div className={`storeGridCardMetrics`}>
                    <div className={`storeGridCardMetric`}>
                        <span>Total</span>
                        {renderColumn(`amountTotal`)}
                    </div>
                    <div className={`storeGridCardMetric`}>
                        <span>Items</span>
                        <strong>{lineItemCount || `-`}</strong>
                    </div>
                </div>
                <div className={`storeGridCardField`}>
                    <span>Description</span>
                    {renderColumn(`description`, `lineClamp2`)}
                </div>
                <div className={`storeGridCardMeta`}>
                    <div className={`storeGridCardMetaItem`}>
                        <span>Method</span>
                        {renderColumn(`paymentMethod`)}
                    </div>
                    <div className={`storeGridCardMetaItem`}>
                        <span>Date</span>
                        {renderColumn(`created`)}
                    </div>
                </div>
            </div>
        </DataDisplayCard>
    );
}
