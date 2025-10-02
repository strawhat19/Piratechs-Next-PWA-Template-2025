import { Button } from '@mui/material';
import { Check, Circle, List } from '@mui/icons-material';

export const statusIconSize = 14;

export enum Status {
    ToDo = `Idea`,
    Active = `Active`,
    Done = `Complete`,
}

export const statuses: any = {
  [Status.ToDo]: {
    name: Status.ToDo,
    transition: Status.Active,
    icon: <List style={{ fontSize: statusIconSize }} />,
    iconTransition: <Circle style={{ fontSize: statusIconSize }} />,
  },
  [Status.Active]: {
    name: Status.Active,
    transition: Status.Done,
    icon: <Circle style={{ fontSize: statusIconSize }} />,
    iconTransition: <Check style={{ fontSize: statusIconSize }} />,
  },
  [Status.Done]: {
    name: Status.Done,
    transition: Status.ToDo,
    icon: <Check style={{ fontSize: statusIconSize }} />,
    iconTransition: <List style={{ fontSize: statusIconSize }} />,
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
        <div style={style} className={`statusTagContainer ${className}Container ${disabled ? `pointerEventsNone` : ``}`}>
            <Button
                onClick={onClick}
                disabled={disabled}
                className={`itemButton statusTag ${className} flexCenter gap1`}
                style={{
                    borderRadius: 8, 
                    color: `inherit`,
                    cursor: `pointer`,
                    padding: `6px 10px`, 
                    border: `0px solid #444`, 
                }}
            >
                <span className={`main`} style={{ maxHeight: 18 }}>
                    {currentStatus ? statuses[item?.status]?.icon : statuses[item?.status]?.iconTransition}
                </span>
                <span style={{ fontWeight: 300, fontSize: 14 }}>
                    <i>{currentStatus ? item?.status : statuses[item?.status].transition}</i>
                </span>
            </Button>
        </div>
    )
}