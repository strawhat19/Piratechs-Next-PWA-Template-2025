'use client';

import './tag.scss';

import { useContext } from 'react';
import { Button, Tooltip } from '@mui/material';
import { StateGlobals } from '@/shared/global-context';
import { Check, Circle, List } from '@mui/icons-material';
import { isDate, parseDateFromStr } from '@/shared/scripts/constants';

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
    label = ``,
    dateTag = false,
    showIcon = true,
    disabled = true, 
    thiccBtn = false,
    icon = undefined,
    onClick = () => {}, 
    currentStatus = true, 
    className = `statusTagComponent`, 
}: any) {
    let { selected } = useContext<any>(StateGlobals);

    const getLabel = () => label != `` ? label : (currentStatus ? item?.status : statuses[item?.status].transition);

    const getDateFromLabel = () => {
        let lbl = getLabel();
        if (lbl && lbl != ``) {
            let lblIsDate = isDate(lbl);
            if (lblIsDate) {
                let dateObj = parseDateFromStr(lbl);
                if (dateObj) {
                    let { time, date } = dateObj;
                    let { hour, xm, minute } = time;
                    let { month, day, year } = date;
                    return (
                        <div className={`dateTag`}>
                            <span>{hour}</span>
                            <span className={`main`}>:</span>
                            <span>{minute}</span> 
                            <span> {xm}</span>
                            <span> {month}</span>
                            <span className={`main`}>/</span>
                            <span>{day}</span>
                            <span className={`main`}>/</span>
                            <span>{year}</span>
                        </div>
                    )
                }
            }
        }
        return lbl;
    }

    return (
        <Tooltip placement={`top`} title={disabled ? `` : `Change Status from "${item?.status}" to "${statuses[item?.status]?.transition}"`} arrow>
            <Button
                onClick={selected != null && selected?.statusChange ? (e) => selected?.statusChange(e, selected) : onClick}
                disabled={disabled}
                className={`
                    statusTag 
                    flexCenter 
                    itemButton 
                    ${className} 
                    ${thiccBtn ? `thiccBtn` : ``} 
                    ${disabled ? `pointerEventsNone` : ``} 
                    ${currentStatus ? `currentStatusTag` : `changeStatusTag`}  
                `}
                style={{
                    ...style,
                    borderRadius: 4, 
                    color: `inherit`,
                    cursor: `pointer`,
                    minWidth: `fit-content`,
                    border: `0px solid #444`, 
                    padding: `0 ${thiccBtn ? `10px` : `5px`}`, 
                }}
            >
                <div className={`tagContent flexCenter gap5 pointerEventsNone`}>
                    {showIcon && (
                        <span className={`tagIcon main flexCenter`} style={{ maxHeight: 18 }}>
                            {icon != undefined ? icon : (currentStatus ? statuses[item?.status]?.icon : statuses[item?.status]?.iconTransition)}
                        </span>
                    )}
                    <span className={`tagName`} style={{ fontSize: getLabel()?.length > 7 ? (getLabel()?.length > 10 ? 11 : 12) : 14 }}>
                        <i>{dateTag ? getDateFromLabel() : getLabel()}</i>
                    </span>
                </div>
            </Button>
        </Tooltip>
    )
}