import './dialog.scss';

import { useContext } from 'react';
import { Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { Types } from '@/shared/types/types';
import { dev } from '@/shared/scripts/constants';
import { List } from '@/shared/types/models/List';
import { Item } from '@/shared/types/models/Item';
import { Task } from '@/shared/types/models/Task';
import { Board } from '@/shared/types/models/Board';
import { Close, Delete } from '@mui/icons-material';
import DialogTitle from '@mui/material/DialogTitle';
import { StateGlobals } from '@/shared/global-context';
import Icon_Button from '../buttons/icon-button/icon-button';
import ImagesCarousel from '../slider/images-carousel/images-carousel';
import StatusTag, { statusIconSize, statusLineHeight } from '../board/status/status';

export interface SimpleDialogProps {
  open: boolean;
  onClose: () => void;
  selected: Board | List | Item | Task | any;
}

function SimpleDialog(props: SimpleDialogProps) {
  const { open, selected, onClose } = props;

  const deleteSelected = (e: any, selected: Board | List | Item | Task | any) => {
    selected?.delete(selected);
    onClose();
  }

  return (
    <Dialog onClose={onClose} open={open}>
      {selected != null && <>
        <div style={{ flex: 1 }} className={`dialogContent`}>
          <div className={`dialogRow dialogHeader`}>
            <DialogTitle className={`dialogTitle flexCenter gap15`}>
              <div className={`dialogRow dialogField dialogTitleIndex`}>
                <h4 className={`main`}>
                  <strong>#</strong>
                </h4>
                <p>{selected?.number}</p>
              </div>
              <strong className={`dialogTitleName lineClamp1`}>
                {selected?.name}
              </strong>
              {selected?.type == Types.Item && <StatusTag item={selected} disabled={false} className={`thiccTag`} />}
            </DialogTitle>
            <div className={`dialogCloseButton`}>
              <StatusTag 
                item={selected} 
                disabled={false} 
                label={`Delete`} 
                style={{ marginRight: 25 }} 
                title={`Delete ${selected?.type}`} 
                className={`thiccTag deleteDialogTag`} 
                onClick={(e: any) => deleteSelected(e, selected)}
                icon={<Delete style={{ fontSize: statusIconSize + 3, lineHeight: statusLineHeight }} />}
              />
              <Icon_Button title={``} onClick={onClose}>
                <Close style={{ fontSize: 20 }} className={`linkHover cursorPointer`} />
              </Icon_Button>
            </div>
          </div>
          <div style={{ flex: 1 }} className={`dialogCenterContent w100 mxauto dialogDefaultTitlePadding`}>
            <div className={`dialogFieldGroup gap15 dialogRow simpleFieldGroup`}>
              <div className={`dialogRow dialogField gap15 smallDataField`}>
                <h4 className={`main`}>
                  <strong>Title</strong>
                </h4>
                <p>{selected?.name}</p>
              </div>
              <div className={`dialogRow dialogField gap15 smallDataField`}>
                <h4 className={`main`}>
                  <strong>Type</strong>
                </h4>
                <p>{selected?.type}</p>
              </div>
              <div className={`dialogRow dialogField gap15`}>
                <h4 className={`main`}>
                  <strong>Author</strong>
                </h4>
                <p>{selected?.createdBy}</p>
              </div>
            </div>
            <div className={`dialogFieldGroup gap15 dialogRow simpleFieldGroup`}>
              <div className={`dialogRow dialogField gap15 smallDataField`}>
                <h4 className={`main`}>
                  <strong>Created</strong>
                </h4>
                <p>{String(selected?.created)}</p>
              </div>
              <div className={`dialogRow dialogField gap15 smallDataField`}>
                <h4 className={`main`}>
                  <strong>Updated</strong>
                </h4>
                <p>{String(selected?.updated)}</p>
              </div>
              <div className={`dialogRow dialogField gap15`}>
                <h4 className={`main`}>
                  <strong>ID</strong>
                </h4>
                <p>{selected?.id}</p>
              </div>
            </div>
            <div className={`dialogFieldGroup gap15 dialogRow column mt15`}>
              {selected?.description && selected?.description != `` && (
                <div className={`dialogRow dialogField gap10 column alignStartI justifyStart`}>
                  <h4 className={`main`}>
                    <strong>Description</strong>
                  </h4>
                  <p>{selected?.description}</p>
                </div>
              )}
              {selected?.imageURLs?.length > 0 && (
                <div className={`dialogRow dialogField gap10 column alignStartI justifyStart`}>
                  <h4>
                    <strong>Images</strong> <span className={`main`} style={{ fontSize: 12 }}><i>({selected?.imageURLs.length})</i></span>
                  </h4>
                  <ImagesCarousel imageURLs={selected?.imageURLs} heightContainer={`dialogContent`} />
                </div>
              )}
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
  let { selected, setSelected } = useContext<any>(StateGlobals);
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