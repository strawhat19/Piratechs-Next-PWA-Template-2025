'use client';

import Table from '../table';
import { toast } from 'react-toastify';
import { useContext, useMemo, useState } from 'react';
import Loader from '../../loaders/loader';
import { Button } from '@mui/material';
import { getIdToken } from 'firebase/auth';
import { Roles } from '@/shared/types/types';
import { GridColDef } from '@mui/x-data-grid';
import { Sync, ReceiptLong } from '@mui/icons-material';
import { minRole } from '@/shared/scripts/constants';
import { StateGlobals } from '@/shared/global-context';
import { auth } from '@/shared/server/firebase';
import { Order } from '@/shared/types/models/Order';

const formatMoney = (amount = 0, currency = `usd`) => new Intl.NumberFormat(`en-US`, { style: `currency`, currency: currency?.toUpperCase() || `USD` }).format(Number(amount || 0) / 100);

const formatDate = (date?: string | number | Date) => {
    if (!date) return ``;
    const parsedDate = typeof date == `number` ? new Date(date * 1000) : new Date(date);
    return isNaN(parsedDate.getTime()) ? String(date) : parsedDate.toLocaleString();
};

const paymentMethodLabel = (order: Order) => {
    const method = order?.paymentMethod || {};
    const brand = method?.brand ? method.brand.toUpperCase() : method?.type || `Payment`;
    return method?.last4 ? `${brand} **** ${method.last4}` : brand;
};

export default function OrdersTable({ type = `Order` }: any) {
    const { user, orders = [], ordersLoading = false } = useContext<any>(StateGlobals);
    const [syncing, setSyncing] = useState(false);
    const canManageOrders = minRole(user?.role, Roles.Editor);
    const visibleOrders = useMemo(() => {
        if (!canManageOrders && !user) return [];
        const userOrders = canManageOrders ? orders : orders.filter((order: Order) => Boolean(order?.userID) && [user?.id, user?.uid].includes(order.userID) || Boolean(order?.userEmail && user?.email && order.userEmail == user.email));
        return userOrders.map((order: Order, index: number) => ({ ...order, tableID: order?.id || order?.stripePaymentIntentID || `order-${index}` }));
    }, [canManageOrders, orders, user?.email, user?.id, user?.uid]);
    const syncStripeOrders = async () => {
        if (!canManageOrders) return toast.warn(`Editor access is required to sync Stripe orders.`);
        try {
            setSyncing(true);
            const token = auth?.currentUser ? await getIdToken(auth.currentUser) : user?.uid;
            const response = await fetch(`/api/store/stripe/orders/sync`, { method: `POST`, headers: { Authorization: `Bearer ${token}`, [`Content-Type`]: `application/json` }, body: JSON.stringify({ limit: 50 }) });
            const data = await response.json();
            if (!response.ok || data?.ok == false) throw new Error(data?.message || `Unable to sync Stripe orders.`);
            toast.success(`Synced ${data?.count || 0} Stripe order(s).`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : `Unable to sync Stripe orders.`);
        } finally {
            setSyncing(false);
        }
    };
    const orderColumns: GridColDef[] = [
        { field: `created`, headerName: `Created`, width: 175, valueGetter: (_value: any, row: any) => formatDate(row?.stripeCreated || row?.created) },
        { field: `id`, headerName: `Order ID`, width: 190 },
        { field: `userEmail`, headerName: `Customer`, width: 210, flex: 1 },
        { field: `amountTotal`, headerName: `Total`, width: 105, valueGetter: (_value: any, row: any) => formatMoney(row?.amountTotal || row?.amount, row?.currency) },
        { field: `status`, headerName: `Order Status`, width: 125 },
        { field: `paymentSummary`, headerName: `Payment`, width: 180, valueGetter: (_value: any, row: any) => `${row?.paymentStatus || `pending`} / ${paymentMethodLabel(row)}` },
        {
            field: `receiptURL`,
            headerName: `Receipt`,
            width: 105,
            sortable: false,
            filterable: false,
            renderCell: ({ value }: any) => value ? <Button size={`small`} href={value} target={`_blank`} rel={`noreferrer`} startIcon={<ReceiptLong />}>Open</Button> : <></>,
        },
        // { field: `currency`, headerName: `Currency`, width: 95, valueGetter: (value: any) => String(value || `usd`).toUpperCase() },
        // { field: `paymentMethod`, headerName: `Method`, width: 145, valueGetter: (_value: any, row: any) => paymentMethodLabel(row) },
        // { field: `stripePaymentIntentID`, headerName: `Payment Intent`, width: 245 },
        // { field: `stripeCheckoutSessionID`, headerName: `Checkout Session`, width: 245 },
        // { field: `stripeChargeID`, headerName: `Charge`, width: 190 },
    ];

    if (ordersLoading) return <Loader height={250} label={`${type}(s) Loading`} />;

    return (
        <div className={`ordersTableWrap`}>
            {canManageOrders ? <div className={`tableControls`} style={{ display: `flex`, justifyContent: `flex-end`, marginBottom: 8 }}>
                <Button size={`small`} variant={`outlined`} disabled={syncing} onClick={syncStripeOrders} startIcon={<Sync />}>{syncing ? `Syncing` : `Sync Stripe`}</Button>
            </div> : <></>}
            <Table title={`${type}(s)`} rows={visibleOrders} columns={orderColumns} className={`ordersTableComponent`} selectable={canManageOrders} pagination_options={{ page: 0, pageSize: 10 }} />
        </div>
    );
}
