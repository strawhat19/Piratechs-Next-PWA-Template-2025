import './dialog.scss';

import { Button } from '@mui/material';
import React, { useContext } from 'react';
import Dialog from '@mui/material/Dialog';
import Backdrop, { BackdropProps } from '@mui/material/Backdrop';
import { Types } from '@/shared/types/types';
import TextField from '@mui/material/TextField';
import DialogContent from '@mui/material/DialogContent';
import { List } from '@/shared/types/models/List';
import { Item } from '@/shared/types/models/Item';
import { Task } from '@/shared/types/models/Task';
import { User } from '@/shared/types/models/User';
import { Board } from '@/shared/types/models/Board';
import DialogTitle from '@mui/material/DialogTitle';
import { StateGlobals } from '@/shared/global-context';
import { Product } from '@/shared/types/models/Product';
import Icon_Button from '../buttons/icon-button/icon-button';
import { Close, Delete, DoDisturb } from '@mui/icons-material';
import ImagesCarousel from '../slider/images-carousel/images-carousel';
import StatusTag, { statusIconSize, statusLineHeight } from '../board/status/status';

export interface SimpleDialogProps {
  open: boolean;
  onClose: () => void;
  selected: Board | List | Item | Task | any;
}

function SimpleDialog(props: SimpleDialogProps) {
  const { open, selected, onClose } = props;

  const deleteSelected = (e: any, selected: User | Board | List | Item | Task | Product | any) => {
    selected?.delete(selected);
    onClose();
  }

  return (
    <Dialog onClose={onClose} open={open}>
      {selected != null && <>
        <div style={{ flex: 1 }} className={`dialogContent `}>
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
  let { selected, setSelected, appDialog, closeAppDialog } = useContext<any>(StateGlobals);
  const FastBackdrop = (props: BackdropProps) => <Backdrop {...props} transitionDuration={0} />;
  return (
    <div className={`dialogComponent`}>
      <SimpleDialog
        selected={selected}
        open={selected != null}
        onClose={() => setSelected(null)}
      />
      <Dialog
        open={appDialog != null}
        keepMounted
        fullWidth
        maxWidth={`xs`}
        className={`fastDialog`}
        transitionDuration={0}
        slots={{ backdrop: FastBackdrop }}
        onClose={() => closeAppDialog(appDialog?.mode == `alert` ? true : null)}
      >
        <AppDialogContent appDialog={appDialog} closeAppDialog={closeAppDialog} />
      </Dialog>
    </div>
  );
}

const AppDialogContent = ({ appDialog, closeAppDialog }: any) => {
  const [value, setValue] = React.useState(``);
  const confirmAction = appDialog?.confirmAction || {};
  const cancelAction = appDialog?.cancelAction || {};
  const confirmLabel = confirmAction?.label || appDialog?.confirmText || `OK`;
  const cancelLabel = cancelAction?.label || appDialog?.cancelText || `Cancel`;
  const confirmClassName = confirmAction?.className || ``;
  const cancelClassName = cancelAction?.className || ``;
  const customContent = appDialog?.content;
  const confirmColor = confirmAction?.color || (String(confirmLabel || ``).toLowerCase().includes(`delete`) ? `var(--error)` : `var(--success)`);
  const cancelColor = cancelAction?.color || `var(--buttons)`;
  const confirmIcon = confirmAction?.icon || <Close fontSize={`inherit`} style={{ color: `white` }} />;
  const cancelIcon = cancelAction?.icon || <DoDisturb fontSize={`inherit`} style={{ color: `white` }} />;

  React.useEffect(() => {
    setValue(appDialog?.defaultValue || ``);
  }, [appDialog?.defaultValue, appDialog?.mode]);

  if (!appDialog) return null;

  return (
    <div className={`dialogContent ${appDialog?.className}`} style={{ padding: 16, minWidth: 320 }}>
      <h3 style={{ margin: 0, fontSize: 18 }}>
        {appDialog?.title || `Dialog`}
      </h3>
      {appDialog?.message ? <p style={{ margin: `10px 0 0`, lineHeight: 1.45 }}>{appDialog?.message}</p> : <></>}
      {customContent ? (
        <DialogContent sx={{ p: 0, mt: 1.5 }}>
          {typeof customContent == `function`
            ? customContent({ closeAppDialog, value, setValue, appDialog })
            : customContent}
        </DialogContent>
      ) : <></>}
      {appDialog?.mode == `prompt` ? (
        <TextField
          autoFocus
          fullWidth
          size={`small`}
          value={value}
          variant={`outlined`}
          style={{ marginTop: 12 }}
          onChange={(event: any) => setValue(event?.target?.value || ``)}
          onKeyDown={(event: any) => {
            if (event?.key == `Enter`) closeAppDialog(value);
          }}
        />
      ) : <></>}
      <div style={{ gap: 8, display: `flex`, marginTop: 14, justifyContent: `flex-end` }}>
        <Icon_Button
          button
          size={32}
          title={confirmLabel}
          className={`dialogActionButton dialogConfirmButton ${confirmClassName}`}
          style={{ gap: 6, color: `white`, padding: `0 12px`, background: confirmColor }}
          onClick={() => {
            const result = appDialog?.mode == `prompt` ? value : true;
            confirmAction?.onClick?.(result, { closeAppDialog, value, appDialog });
            closeAppDialog(result);
          }}
        >
          {confirmIcon}
          <span>{confirmLabel}</span>
        </Icon_Button>
        {appDialog?.mode != `alert` ? (
          <Icon_Button
            button
            size={32}
            title={cancelLabel}
            className={`dialogActionButton dialogCancelButton ${cancelClassName}`}
            style={{ gap: 6, color: `white`, padding: `0 12px`, background: cancelColor }}
            onClick={() => {
              cancelAction?.onClick?.(null, { closeAppDialog, value, appDialog });
              closeAppDialog(null);
            }}
          >
            {cancelIcon}
            <span>{cancelLabel}</span>
          </Icon_Button>
        ) : <></>}
      </div>
    </div>
  );
}
