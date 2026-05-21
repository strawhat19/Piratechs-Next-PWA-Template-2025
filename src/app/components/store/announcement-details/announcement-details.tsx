'use client';

import { Button, Dialog } from '@mui/material';
import { Close, Save } from '@mui/icons-material';
import { Announcement } from '@/shared/types/models/Announcement';
import AnnouncementForm from '../announcement-form/announcement-form';

type AnnouncementDetailsProps = {
  open?: boolean;
  onClose?: () => void;
  announcement?: Announcement | null;
};

export default function AnnouncementDetails({
  open = false,
  onClose = () => {},
  announcement = null,
}: AnnouncementDetailsProps) {
  const formId = `announcement-form-dialog-${announcement?.id || `new-announcement`}`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth={`lg`} fullWidth>
      <div className={`productFormDialog`}>
        <Button className={`productDialogClose`} onClick={onClose}>
          <Close fontSize={`small`} />
        </Button>
        {open ? (
          <>
            <AnnouncementForm
              full
              onClose={onClose}
              announcement={announcement}
              key={String(announcement?.id || `new-announcement`)}
              formId={formId}
            />
            <div className={`productFormDialogActions`}>
              <Button className={`productFormButton productCancelButton`} onClick={onClose}>
                <Close fontSize={`small`} /> Close
              </Button>
              <Button
                type={`submit`}
                form={formId}
                className={`productFormButton productSaveButton`}
              >
                <Save fontSize={`small`} /> {announcement?.id ? `Save Changes` : `Save Announcement`}
              </Button>
            </div>
          </>
        ) : <></>}
      </div>
    </Dialog>
  );
}
