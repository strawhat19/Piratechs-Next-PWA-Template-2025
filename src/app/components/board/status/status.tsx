import { Button, Tooltip } from '@mui/material';
import { Check, Circle, List } from '@mui/icons-material';

export const statusIconSize = 14;
export const statusLineHeight = 1.4;

export enum Status {
    ToDo = `Idea`,
    Active = `Active`,
    Done = `Done`,
}

export const statuses: any = {
  [Status.ToDo]: {
    name: Status.ToDo,
    transition: Status.Active,
    icon: <List style={{ fontSize: statusIconSize + 4, lineHeight: statusLineHeight }} />,
    iconTransition: <Circle style={{ fontSize: statusIconSize - 2, lineHeight: statusLineHeight }} />,
  },
  [Status.Active]: {
    name: Status.Active,
    transition: Status.Done,
    icon: <Circle style={{ fontSize: statusIconSize - 2, lineHeight: statusLineHeight }} />,
    iconTransition: <Check style={{ fontSize: statusIconSize, lineHeight: statusLineHeight }} />,
  },
  [Status.Done]: {
    name: Status.Done,
    transition: Status.ToDo,
    icon: <Check style={{ fontSize: statusIconSize, lineHeight: statusLineHeight }} />,
    iconTransition: <List style={{ fontSize: statusIconSize + 4, lineHeight: statusLineHeight }} />,
  },
}

export default function StatusTag({ 
    item, 
    style = {}, 
    disabled = true, 
    onClick = () => {}, 
    currentStatus = true, 
    className = `statusTagComponent`, 
}: any) {
    return (
        <Tooltip placement={`top`} title={currentStatus ? `` : `Change Status from "${item?.status}" to "${statuses[item?.status]?.transition}"`} arrow>
            <Button
                onClick={onClick}
                disabled={disabled}
                className={`statusTag ${currentStatus ? `currentStatusTag` : `changeStatusTag`} flexCenter itemButton ${className} ${disabled ? `pointerEventsNone` : ``}`}
                style={{
                    ...style,
                    borderRadius: 4, 
                    color: `inherit`,
                    cursor: `pointer`,
                    padding: `0 10px`, 
                    border: `0px solid #444`, 
                }}
            >
                <div className={`tagContent flexCenter gap5 pointerEventsNone`}>
                    <span className={`tagIcon main flexCenter`} style={{ maxHeight: 18 }}>
                        {currentStatus ? statuses[item?.status]?.icon : statuses[item?.status]?.iconTransition}
                    </span>
                    <span className={`tagName`} style={{ maxHeight: 18, fontWeight: 300, fontSize: 14, lineHeight: 1.4 }}>
                        <i>{currentStatus ? item?.status : statuses[item?.status].transition}</i>
                    </span>
                </div>
            </Button>
        </Tooltip>
    )
}