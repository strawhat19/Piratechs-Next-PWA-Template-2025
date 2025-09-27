import './dialog.scss';

import { useContext } from 'react';
import { Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { Close } from '@mui/icons-material';
import { State } from '../container/container';
import DialogTitle from '@mui/material/DialogTitle';
import Icon_Button from '../buttons/icon-button/icon-button';

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
        <div className={`dialogContent`}>
          <div className={`dialogRow dialogHeader`}>
            <DialogTitle className={`dialogTitle`}>
              <strong>{selected?.title}</strong>
            </DialogTitle>
            <div className={`dialogDefaultTitlePadding`}>
              <Icon_Button title={``} onClick={onClose}>
                <Close style={{ fontSize: 20 }} className={`linkHover cursorPointer`} />
              </Icon_Button>
            </div>
          </div>
          <div className={`dialogCenterContent w100 mxauto dialogDefaultTitlePadding`}>
            <div className={`dialogFieldGroup gap15 dialogRow`}>
              <div className={`dialogRow dialogField gap15`}>
                <h4>
                  <strong>#</strong>
                </h4>
                <p>{selected?.number}</p>
              </div>
              <div className={`dialogRow dialogField gap15`}>
                <h4>
                  <strong>Type</strong>
                </h4>
                <p>{selected?.type}</p>
              </div>
            </div>
            <div className={`dialogFieldGroup gap15 dialogRow`}>
              <div className={`dialogRow dialogField gap15`}>
                <h4>
                  <strong>Title</strong>
                </h4>
                <p>{selected?.title}</p>
              </div>
              <div className={`dialogRow dialogField gap15`}>
                <h4>
                  <strong>ID</strong>
                </h4>
                <p>{selected?.id}</p>
              </div>
            </div>
          </div>
          <div className={`dialogFooter w100 mxauto dialogDefaultTitlePadding`}>
            <Button className={`dialogButton w100`} onClick={onClose}>
              <strong>Close</strong>
            </Button>
          </div>
        </div>
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