'use client';

import { Button, Dialog } from '@mui/material';
import { User } from '@/shared/types/models/User';
import { Close } from '@mui/icons-material';

type UserDetailsProps = {
  open?: boolean;
  onClose?: () => void;
  user?: User | null;
};

const DetailRow = ({ label, value }: { label: string; value?: any }) => (
  <div className={`detailRow`} style={{ display: `flex`, flexDirection: `column`, gap: 4 }}>
    <strong style={{ fontSize: 12, opacity: 0.75 }}>{label}</strong>
    <span>{String(value ?? `-`)}</span>
  </div>
);

export default function UserDetails({
  open = false,
  onClose = () => {},
  user = null,
}: UserDetailsProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={`sm`}>
      <div style={{ padding: 20, display: `flex`, flexDirection: `column`, gap: 16 }}>
        <div style={{ display: `flex`, alignItems: `start`, justifyContent: `space-between`, gap: 12 }}>
          <div>
            <h3 style={{ margin: 0 }}>User Details</h3>
            <div style={{ opacity: 0.7, marginTop: 4 }}>{user?.name || `Unnamed User`}</div>
          </div>
          <Button onClick={onClose} className={`dialogButton`} startIcon={<Close />}>
            Close
          </Button>
        </div>
        <div style={{ display: `grid`, gridTemplateColumns: `repeat(2, minmax(0, 1fr))`, gap: 12 }}>
          <DetailRow label={`Name`} value={user?.name} />
          <DetailRow label={`Email`} value={user?.email} />
          <DetailRow label={`Role`} value={user?.role} />
          <DetailRow label={`Signed In`} value={user?.signedIn ? `Yes` : `No`} />
          <DetailRow label={`Created`} value={user?.created} />
          <DetailRow label={`Updated`} value={user?.updated} />
          <DetailRow label={`UUID`} value={user?.id} />
          <DetailRow label={`Last Sign In`} value={user?.lastSignIn} />
        </div>
      </div>
    </Dialog>
  );
}
