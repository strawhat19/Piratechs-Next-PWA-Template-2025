'use client';

import { Button } from '@mui/material';
import { toast } from 'react-toastify';
import { getIdToken } from 'firebase/auth';
import { GridColDef } from '@mui/x-data-grid';
import Table, { checkboxColumn } from '../table';
import IconText from '../../icon-text/icon-text';
import MenuTrigger from '../../menu/menu-trigger';
import ZeroState from '../../zero-state/zero-state';
import { Roles, Types } from '@/shared/types/types';
import { useContext, useMemo, useState } from 'react';
import TableStatus from '../table-status/table-status';
import { StateGlobals } from '@/shared/global-context';
import { defaultDisplayTypes } from '../../store/store';
import OrderCard from '../../store/order-card/order-card';
import { capWords, minRole } from '@/shared/scripts/constants';
import Icon_Button from '../../buttons/icon-button/icon-button';
import { auth, updateOrderInDatabase } from '@/shared/server/firebase';
import { Order, OrderFulfillmentStatus } from '@/shared/types/models/Order';
import { AltRoute, AssignmentReturn, Cancel, CheckCircle, DoneAll, Inventory2, KeyboardArrowDown, LocalShipping, Lock, PauseCircle, PendingActions, ReceiptLong, Sync } from '@mui/icons-material';

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

const orderFulfillmentStatusColors: Record<OrderFulfillmentStatus, string> = {
    [OrderFulfillmentStatus.Unfulfilled]: `rgba(255,255,255,0.35)`,
    [OrderFulfillmentStatus.Pending]: `var(--links)`,
    [OrderFulfillmentStatus.Processing]: `var(--yellow_neon)`,
    [OrderFulfillmentStatus.OnHold]: `var(--warning)`,
    [OrderFulfillmentStatus.Partial]: `var(--blueneon)`,
    [OrderFulfillmentStatus.Fulfilled]: `var(--success)`,
    [OrderFulfillmentStatus.Shipped]: `var(--links)`,
    [OrderFulfillmentStatus.Delivered]: `var(--green_neon)`,
    [OrderFulfillmentStatus.Returned]: `var(--pink_neon)`,
    [OrderFulfillmentStatus.Canceled]: `var(--error)`,
    [OrderFulfillmentStatus.Closed]: `var(--green_neon)`,
};
const orderFulfillmentStatusIcons: Record<OrderFulfillmentStatus, any> = {
    [OrderFulfillmentStatus.Unfulfilled]: <Inventory2 fontSize={`small`} htmlColor={orderFulfillmentStatusColors?.[OrderFulfillmentStatus.Unfulfilled]} />,
    [OrderFulfillmentStatus.Pending]: <PendingActions fontSize={`small`} htmlColor={orderFulfillmentStatusColors?.[OrderFulfillmentStatus.Pending]} />,
    [OrderFulfillmentStatus.Processing]: <Sync fontSize={`small`} htmlColor={orderFulfillmentStatusColors?.[OrderFulfillmentStatus.Processing]} />,
    [OrderFulfillmentStatus.OnHold]: <PauseCircle fontSize={`small`} htmlColor={orderFulfillmentStatusColors?.[OrderFulfillmentStatus.OnHold]} />,
    [OrderFulfillmentStatus.Shipped]: <LocalShipping fontSize={`small`} htmlColor={orderFulfillmentStatusColors?.[OrderFulfillmentStatus.Shipped]} />,
    [OrderFulfillmentStatus.Delivered]: <CheckCircle fontSize={`small`} htmlColor={orderFulfillmentStatusColors?.[OrderFulfillmentStatus.Delivered]} />,
    [OrderFulfillmentStatus.Returned]: <AssignmentReturn fontSize={`small`} htmlColor={orderFulfillmentStatusColors?.[OrderFulfillmentStatus.Returned]} />,
    [OrderFulfillmentStatus.Canceled]: <Cancel fontSize={`small`} htmlColor={orderFulfillmentStatusColors?.[OrderFulfillmentStatus.Canceled]} />,
    [OrderFulfillmentStatus.Partial]: <AltRoute fontSize={`small`} htmlColor={orderFulfillmentStatusColors?.[OrderFulfillmentStatus.Partial]} />,
    [OrderFulfillmentStatus.Fulfilled]: <DoneAll fontSize={`small`} htmlColor={orderFulfillmentStatusColors?.[OrderFulfillmentStatus.Fulfilled]} />,
    [OrderFulfillmentStatus.Closed]: <Lock fontSize={`small`} htmlColor={orderFulfillmentStatusColors?.[OrderFulfillmentStatus.Closed]} />,
};
const getOrderFulfillmentStatus = (order: Order) => String(order?.customStatus || order?.fulfillmentStatus || order?.fullfilmentStatus || OrderFulfillmentStatus.Unfulfilled);
const getOrderFulfillmentStatusColor = (order: Order) => orderFulfillmentStatusColors?.[getOrderFulfillmentStatus(order) as OrderFulfillmentStatus] || `rgba(255,255,255,0.35)`;

const getOrderStatusColor = (status?: string) => {
    const statusText = String(status || ``).toLowerCase();
    if ([`paid`, `succeeded`, `complete`, `completed`].some(label => statusText.includes(label))) return `var(--green_neon)`;
    if ([`failed`, `canceled`, `cancelled`, `refunded`].some(label => statusText.includes(label))) return `red`;
    return `rgba(255,255,255,0.35)`;
}

const OrderFulfillmentStatusCell = ({ row }: any) => {
    const { user } = useContext<any>(StateGlobals);
    const canManageOrders = minRole(user?.role, Roles.Administrator);
    const currentValue = getOrderFulfillmentStatus(row) as OrderFulfillmentStatus;
    const statusOptions = Object.values(OrderFulfillmentStatus)?.filter(option => option != currentValue);
    const statusItems = statusOptions?.map((status: OrderFulfillmentStatus | string) => ({
        id: status,
        label: status,
        icon: orderFulfillmentStatusIcons?.[status as OrderFulfillmentStatus],
        onClick: () => {
            const updates: Partial<Order> = {
                customStatus: status == OrderFulfillmentStatus.Closed ? status : ``,
                fulfillmentStatus: status,
                fullfilmentStatus: status,
            };
            updateOrderInDatabase(String(row?.id), updates, true)?.then(() => toast.success(`Order Status Updated`));
        },
    }));
    if (!canManageOrders) return <TableStatus label={currentValue} color={getOrderFulfillmentStatusColor(row)} title={currentValue} />;
    return (
        <MenuTrigger
            colors={true}
            search={false}
            topOffset={0.5}
            menuItems={statusItems}
            className={`roleDropdownMenu`}
            targetID={`order-fulfillment-status-menu-${row?.id}`}
            id={`order-fulfillment-status-menu-trigger-${row?.id}`}
            renderTrigger={({ id, onClick, searchValue }) => (
                <Button
                    id={id}
                    size={`small`}
                    onClick={onClick}
                    endIcon={<KeyboardArrowDown />}
                    className={`tableDropDown roleDropdownButton orderFulfillmentStatusCellField`}
                    startIcon={orderFulfillmentStatusIcons?.[currentValue]}
                    style={{ color: getOrderFulfillmentStatusColor(row) }}
                >
                    <span className={`dropDownBtnLabel`}>
                        {searchValue || currentValue}
                    </span>
                </Button>
            )}
        />
    );
};

export default function OrdersTable({
    type = Types.Order,
    onOpenOrderDetails = () => {},
    mode = defaultDisplayTypes?.orders,
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
        { field: `number`, headerName: `ID`, width: 50 },
        { field: `amountTotal`, headerName: `Total`, width: 75, renderCell: ({ row }: any) => (
            <IconText format={false} dollarSign number={Number(row?.amountTotal || row?.amount || 0) / 100} dollarSignColor={storeDollarSignColor} className={`stockText`} />
        )},
        { field: `userEmail`, headerName: `Customer`, width: 175 },
        { field: `description`, headerName: `Description`, width: 230, flex: 1, valueGetter: (_value: any, row: any) => orderDescriptionLabel(row) },
        { field: `paymentMethod`, headerName: `Method`, width: 85, valueGetter: (_value: any, row: any) => paymentMethodLabel(row) },
        { field: `fulfillmentStatus`, headerName: `Status`, width: 150, valueGetter: (_value: any, row: any) => getOrderFulfillmentStatus(row), renderCell: ({ row }: any) => <OrderFulfillmentStatusCell row={row} /> },
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
                    <Icon_Button
                        size={26}
                        target={`_blank`}
                        title={`View Receipt`}
                        url={row?.stripe_receipt_url}
                        disabled={!row?.stripe_receipt_url}
                        className={`actionIconButton archiveAction ${row?.stripe_receipt_url ? `` : `grayAction`}`}
                        onClick={(event: any) => {
                            event.stopPropagation();
                        }}
                    >
                        <ReceiptLong fontSize={`small`} />
                    </Icon_Button>
                </div>
            ),
        },
        checkboxColumn,
        // { field: `id`, headerName: `Firestore ID`, width: 260 },
        // { field: `stripe_order_id`, headerName: `Stripe Order ID`, width: 245 },
        // { field: `currency`, headerName: `Currency`, width: 95, valueGetter: (value: any) => String(value || `usd`).toUpperCase() },
        // { field: `stripe_payment_intent_id`, headerName: `Payment Intent`, width: 245 },
        // { field: `stripe_checkout_session_id`, headerName: `Checkout Session`, width: 245 },
        // { field: `stripe_charge_id`, headerName: `Charge`, width: 190 },
    ];

    if (user == null && !ordersLoading) {
        return <ZeroState type={Types.Order} />
    }

    return (
        <div className={`ordersTableWrap`}>
            <Table 
                type={type} 
                mode={mode}
                rows={visibleOrders} 
                columns={orderColumns} 
                loading={ordersLoading}
                selectable={canManageOrders}
                gridProps={{
                    renderCard: (params: any) => <OrderCard {...params} />,
                }}
                className={`ordersTableComponent`} 
                pagination_options={{ page: 0, pageSize: 10 }} 
                emptyRowsLabel={`(${visibleOrders?.length}) ${type}(s), Sign In or Check Role Permission(s)`} 
                dataGridProps={{
                    onCellClick: ({ row, field }: any) => {
                        if (field == `actions`) return;
                        onOpenOrderDetails(row);
                    },
                }}
                title={(
                    <div className={`tableHeaderComponent tableHeaderSimple contentAtEnd`}>
                        {type}(s)
                        {canManageOrders ? (
                            <div className={`tableControls`} style={{ display: `flex`, justifyContent: `flex-end` }}>
                                <Button className={`tableControlsButton`} size={`small`} variant={`outlined`} disabled={syncing} onClick={syncStripeOrders} startIcon={<Sync />}>
                                    {syncing ? `Syncing` : `Sync Stripe`}
                                </Button>
                            </div>
                        ) : <></>}
                    </div>
                )}
            />
        </div>
    );
}
