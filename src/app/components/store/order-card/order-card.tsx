'use client';

import { useContext } from 'react';
import { Checkbox } from '@mui/material';
import { Order } from '@/shared/types/models/Order';
import { colors } from '@/shared/scripts/constants';
import { StateGlobals } from '@/shared/global-context';
import { Person, ReceiptLong } from '@mui/icons-material';
import { TableGridCardParams } from '@/app/components/table/table-grid/table-grid';
import DataDisplayCard from '@/app/components/table/data-display-card/data-display-card';
import { User } from '@/shared/types/models/User';

const getOrderCardStatusClass = (order: Order) => {
    const statusText = [
        order?.status, 
        order?.paymentStatus, 
        order?.stripe_status, 
        order?.stripeStatus,
    ].map(status => String(status || ``)).join(` `).toLowerCase();
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
    const { user, users = [] } = useContext<any>(StateGlobals);
    const lineItemCount = order?.lineItems?.length || order?.cartItems?.length || 0;

    const getAccColor = (email: string) => {
        let color = colors?.info?.color;
        if (user != null) {
            if (user?.email?.toLowerCase() == email?.toLowerCase()) {
                color = `var(--links)`;
                return color;
            }
        }
        if (users) {
            if (users?.length > 0) {
                let usr: User = users?.find((u: User) => u?.email?.toLowerCase() == email?.toLowerCase());
                if (usr) {
                    if (usr?.color?.color) {
                        color = usr?.color?.color;
                    }
                }
            }
        }
        return color;
    }

    return (
        <DataDisplayCard selected={selected} onClick={onCardClick} className={`storeGridCard orderGridCard`} checkboxAlignmentStart={checkboxAlignmentStart}>
            <div className={`storeGridCardHero orderGridCardHero ${statusClass}`}>
                {selectable ? (
                    <label className={`dataDisplayCardSelect storeGridCardSelect`} onClick={(event) => event.stopPropagation()}>
                        <Checkbox
                            size={`small`}
                            checked={selected}
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
                    <strong className={`cardNumber`} style={{ fontSize: 16, color: getAccColor(String(order?.userEmail)) }}>
                        {order?.number || 0}
                    </strong>
                </div>
            </div>
            <div className={`storeGridCardBody`}>
                {/* <div className={`storeGridCardTop`}>
                    <span className={`storeGridCardNumber cardNumber`}>
                        {order?.number || 0}
                    </span>
                </div> */}
                <div className={`storeGridCardTitle flex alignCenter gap5`}>
                    {/* <span className={`storeGridCardNumber cardNumber`}>
                        {order?.number || 0}
                    </span> */}
                    <Person fontSize={`small`} htmlColor={getAccColor(String(order?.userEmail))} />
                    <span className={`lineClamp1`}>
                        {order?.userEmail || order?.userName || `Customer`}
                    </span>
                </div>
                <div className={`storeGridCardField orderGridCardFulfillment`}>
                    <span>Status</span>
                    <div className={`flex alignCenter gap15`}>
                        {renderColumn(`actions`, `storeGridCardActionsCompact`)}
                        <div style={{ minWidth: 130 }}>
                            {renderColumn(`fulfillmentStatus`, `orderGridCardFulfillmentStatus`)}
                        </div>
                    </div>
                </div>
                <div className={`storeGridCardMetrics`}>
                    <div className={`storeGridCardMetric`}>
                        <span>Items</span>
                        <strong>{lineItemCount || 0}</strong>
                    </div>
                    <div className={`storeGridCardMetric`}>
                        <span>Total</span>
                        {renderColumn(`amountTotal`)}
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
