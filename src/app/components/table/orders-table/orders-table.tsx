'use client';

import Table from '../table';
import { Button } from '@mui/material';
import { toast } from 'react-toastify';
import Loader from '../../loaders/loader';
import { getIdToken } from 'firebase/auth';
import { GridColDef } from '@mui/x-data-grid';
import { auth } from '@/shared/server/firebase';
import IconText from '../../icon-text/icon-text';
import { Roles, Types } from '@/shared/types/types';
import { Order } from '@/shared/types/models/Order';
import { useContext, useMemo, useState } from 'react';
import TableStatus from '../table-status/table-status';
import { StateGlobals } from '@/shared/global-context';
import { Sync, ReceiptLong } from '@mui/icons-material';
import { capWords, minRole } from '@/shared/scripts/constants';
import Icon_Button from '../../buttons/icon-button/icon-button';

const storeDollarSignColor = `var(--green_neon)`;

const formatDate = (date?: string | number | Date) => {
    if (!date) return ``;
    const parsedDate = typeof date == `number` ? new Date(date * 1000) : new Date(date);
    return isNaN(parsedDate.getTime()) ? String(date) : parsedDate.toLocaleString();
};

const paymentMethodLabel = (order: Order) => {
    const method = order?.paymentMethod || {};
    const brand = method?.brand ? method?.brand?.toUpperCase() : capWords(method?.type || `Payment`);
    return method?.last4 ? `${brand} **** ${method.last4}` : brand;
};

const orderDescriptionLabel = (order: Order) => order?.description || order?.stripeDescription || order?.lineItems?.map(item => `${item?.name} x${item?.quantity}`).join(`, `) || ``;

const getOrderStatusColor = (status?: string) => {
    const statusText = String(status || ``).toLowerCase();
    if ([`paid`, `succeeded`, `complete`, `completed`].some(label => statusText.includes(label))) return `var(--green_neon)`;
    if ([`failed`, `canceled`, `cancelled`, `refunded`].some(label => statusText.includes(label))) return `red`;
    return `rgba(255,255,255,0.35)`;
}

export default function OrdersTable({
    type = Types.Order,
}: any) {
    const { user, orders = [], ordersLoading = false } = useContext<any>(StateGlobals);
    const [syncing, setSyncing] = useState(false);
    const canManageOrders = minRole(user?.role, Roles.Administrator);
    const visibleOrders = useMemo(() => {
        if (!canManageOrders && !user) return [];
        const userOrders = canManageOrders ? orders : orders.filter((order: Order) => Boolean(order?.userID) && [user?.id, user?.uid].includes(order?.userID) || Boolean(order?.userEmail && user?.email && order?.userEmail == user?.email));
        return userOrders.map((order: Order, index: number) => ({ ...order, tableID: order?.id || order?.stripePaymentIntentID || `order-${index}` }));
    }, [canManageOrders, orders, user?.email, user?.id, user?.uid]);
    const syncStripeOrders = async () => {
        if (!canManageOrders) return toast.warn(`Editor Access Required`);
        try {
            setSyncing(true);
            const token = auth?.currentUser ? await getIdToken(auth?.currentUser) : user?.uid;
            const response = await fetch(`/api/store/stripe/orders/sync`, { method: `POST`, headers: { Authorization: `Bearer ${token}`, [`Content-Type`]: `application/json` }, body: JSON.stringify({ limit: 100 }) });
            const data = await response.json();
            if (!response.ok || data?.ok == false) throw new Error(data?.message || `Unable To Sync Stripe Order(s)`);
            toast.success(`Synced ${data?.count || 0} Stripe Order(s)${(data?.normalizedCount || 0) > 0 ? `, Normalized ${data?.normalizedCount || 0}` : ``}`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : `Unable to Sync Stripe Orders`);
        } finally {
            setSyncing(false);
        }
    };
    const orderColumns: GridColDef[] = [
        { field: `number`, headerName: `ID`, width: 87, },
        { field: `amountTotal`, headerName: `Total`, width: 75, renderCell: ({ row }: any) => (
            <IconText format={false} dollarSign number={Number(row?.amountTotal || row?.amount || 0) / 100} dollarSignColor={storeDollarSignColor} className={`stockText`} />
        )},
        { field: `userEmail`, headerName: `Customer`, width: 175 },
        { field: `description`, headerName: `Description`, width: 230, flex: 1, valueGetter: (_value: any, row: any) => orderDescriptionLabel(row) },
        { field: `paymentMethod`, headerName: `Method`, width: 85, valueGetter: (_value: any, row: any) => paymentMethodLabel(row) },
        { field: `id`, headerName: `UUID`, width: 333, flex: 1 },
        { field: `created`, headerName: `Date`, width: 175, valueGetter: (_value: any, row: any) => formatDate(row?.stripe_created || row?.stripeCreated || row?.created) },
        {
            width: 110,
            minWidth: 110,
            sortable: true,
            field: `actions`,
            filterable: false,
            headerName: `Action(s)`,
            valueGetter: (_value: any, row: any) => row?.status || ``,
            renderCell: ({ row }: any) => (
                <div className={`actionsCell orderActionsCell`}>
                    <TableStatus label={row?.status} color={getOrderStatusColor(row?.status)} title={row?.status} />
                    {row?.stripe_receipt_url ? (
                        <Icon_Button
                            size={26}
                            target={`_blank`}
                            title={`View Receipt`}
                            url={row?.stripe_receipt_url}
                            className={`actionIconButton archiveAction`}
                            onClick={(event: any) => {
                                event.stopPropagation();
                            }}
                        >
                            <ReceiptLong fontSize={`small`} />
                        </Icon_Button>
                        // <Button className={`orderActionButton`} size={`small`} href={row?.stripe_receipt_url} target={`_blank`} rel={`noreferrer`} startIcon={<ReceiptLong />}>
                        //     Open
                        // </Button>
                    ) : <></>}
                </div>
            ),
        },
        // { field: `id`, headerName: `Firestore ID`, width: 260 },
        // { field: `stripe_order_id`, headerName: `Stripe Order ID`, width: 245 },
        // { field: `currency`, headerName: `Currency`, width: 95, valueGetter: (value: any) => String(value || `usd`).toUpperCase() },
        // { field: `stripe_payment_intent_id`, headerName: `Payment Intent`, width: 245 },
        // { field: `stripe_checkout_session_id`, headerName: `Checkout Session`, width: 245 },
        // { field: `stripe_charge_id`, headerName: `Charge`, width: 190 },
    ];

    if (ordersLoading) return <Loader height={250} label={`${type}(s) Loading`} />;

    return (
        <div className={`ordersTableWrap`}>
            {canManageOrders ? <div className={`tableControls`} style={{ display: `flex`, justifyContent: `flex-end`, marginBottom: 8 }}>
                <Button size={`small`} variant={`outlined`} disabled={syncing} onClick={syncStripeOrders} startIcon={<Sync />}>{syncing ? `Syncing` : `Sync Stripe`}</Button>
            </div> : <></>}
            <Table type={type} title={`${type}(s)`} rows={visibleOrders} columns={orderColumns} className={`ordersTableComponent`} selectable={canManageOrders} pagination_options={{ page: 0, pageSize: 10 }} />
        </div>
    );
}
