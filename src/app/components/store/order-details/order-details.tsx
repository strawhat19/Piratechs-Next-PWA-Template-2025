'use client';

import { Button, Dialog } from '@mui/material';
import { Close } from '@mui/icons-material';
import { Order } from '@/shared/types/models/Order';

type OrderDetailsProps = {
  open?: boolean;
  onClose?: () => void;
  order?: Order | null;
};

const DetailRow = ({ label, value }: { label: string; value?: any }) => (
  <div className={`detailRow`} style={{ display: `flex`, flexDirection: `column`, gap: 4 }}>
    <strong style={{ fontSize: 12, opacity: 0.75 }}>{label}</strong>
    <span>{String(value ?? `-`)}</span>
  </div>
);

const formatMoney = (value?: number) => `$${((Number(value || 0) || 0) / 100).toFixed(2)}`;

export default function OrderDetails({
  open = false,
  onClose = () => {},
  order = null,
}: OrderDetailsProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={`sm`}>
      <div style={{ padding: 20, display: `flex`, flexDirection: `column`, gap: 16 }}>
        <div style={{ display: `flex`, alignItems: `start`, justifyContent: `space-between`, gap: 12 }}>
          <div>
            <h3 style={{ margin: 0 }}>Order Details</h3>
            <div style={{ opacity: 0.7, marginTop: 4 }}>{order?.status || `Unknown Status`}</div>
          </div>
          <Button onClick={onClose} className={`dialogButton`} startIcon={<Close />}>
            Close
          </Button>
        </div>
        <div style={{ display: `grid`, gridTemplateColumns: `repeat(2, minmax(0, 1fr))`, gap: 12 }}>
          <DetailRow label={`Order ID`} value={order?.number || order?.id} />
          <DetailRow label={`Customer`} value={order?.userEmail || order?.userName} />
          <DetailRow label={`Status`} value={order?.status} />
          <DetailRow label={`Total`} value={formatMoney(order?.amountTotal || order?.amount)} />
          <DetailRow label={`Payment`} value={order?.paymentMethod?.brand || order?.paymentMethod?.type} />
          <DetailRow label={`Created`} value={order?.stripeCreated || order?.created} />
          <DetailRow label={`UUID`} value={order?.id} />
          <DetailRow label={`Receipt`} value={order?.stripe_receipt_url || order?.receiptURL || `-`} />
        </div>
        {order?.stripe_receipt_url ? (
          <Button href={order?.stripe_receipt_url} target={`_blank`} rel={`noreferrer`} variant={`outlined`}>
            Open Receipt
          </Button>
        ) : <></>}
      </div>
    </Dialog>
  );
}
