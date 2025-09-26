import { useContext } from 'react';
import { Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { State } from '../container/container';
import DialogTitle from '@mui/material/DialogTitle';

export interface SimpleDialogProps {
  open: boolean;
  selected: any;
  onClose: () => void;
}

function SimpleDialog(props: SimpleDialogProps) {
  const { open, selected, onClose } = props;

  return (
    <Dialog onClose={onClose} open={open}>
      {selected != null && <>
        <DialogTitle>
            {selected?.id}
        </DialogTitle>
        <Button onClick={onClose}>
            Close
        </Button>
      </>}
    </Dialog>
  );
}

export default function DialogComponent() {
  let { selected, setSelected } = useContext<any>(State);
  return (
    <div className={`dialogComponent`}>
      <SimpleDialog
        selected={selected}
        open={selected != null}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}