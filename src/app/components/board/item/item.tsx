import './item.scss';

import Img from '../../image/image';
import { CSS } from '@dnd-kit/utilities';
import { Types } from '@/shared/types/types';
import { Button, Tooltip } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import StatusTag, { Status } from '../status/status';
import { StateGlobals } from '@/shared/global-context';
import { DateRangeSharp, Delete } from '@mui/icons-material';
import { useContext, useEffect, useRef, useState } from 'react';

export const type = Types.Item;

export class Item { 
    onClick: any;
    id: string = ``; 
    uid: string = ``;
    name: string = ``; 
    uuid: string = ``;
    number: number = 0; 
    rating: number = 5;
    urls: string[] = []; 
    tags: string[] = []; 
    itemIndex?: number = 0; 
    imageURLs: string[] = []; 
    description: string = ``; 
    type: Types | string = type;
    created: Date | string = ``;
    updated: Date | string = ``;
    status: Status | string = Status.ToDo;
    constructor(data: Partial<Item>) {
        Object.assign(this, data);
    }
};

export default function ItemComponent({
    id,
    item,
    onClick,
    onDelete,
    itemIndex,
    statusChange,
}: {
    item: Item;
    id: string;
    itemIndex: number;
    onDelete: () => void;
      statusChange?: any;
    onClick: (e: any) => void;
    //   children: React.ReactNode;
}) {
    const smallStartW = 300;
    const itemStartEl = useRef(null);
    const { width } = useContext<any>(StateGlobals);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const [startW, setStartW] = useState(smallStartW);

    const detectItemSizes = () => {
        if (itemStartEl != null) {
            let itmStrt: any = itemStartEl?.current;
            if (itmStrt) {
                let itmStrtW = itmStrt?.clientWidth;
                setStartW(itmStrtW);
            }
        }
    }

    useEffect(() => {
        detectItemSizes();
    }, [width])

    const scale = isDragging ? 1.04 : 1;
    const transformStr = CSS.Transform.toString(transform);
    const style: React.CSSProperties = {
        transition,
        // opacity: isDragging ? 0.95 : 1,
        transform: transformStr
            ? `${transformStr} scale(${scale})`
            : `scale(${scale})`,
        transformOrigin: `center center`,
        zIndex: isDragging ? 9 : `auto`,
        boxShadow: isDragging
            ? `0 10px 24px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.2)`
            : `none`,
        willChange: `transform`
    };

    // ${isDragging ? `swiper-no-swiping` : ``}

  return (
    <div ref={setNodeRef} className={`itemComponent draggableItem swiper-no-swiping`} style={style} {...attributes} {...listeners}>
      <div className={`itemInner`} onClick={onClick}>
        <div className={`itemTypeIndexImages flexCenter gap5`}>
            <div className={`itemBadges`}>
                <div aria-hidden className={`itemTypeIndex flexCenter justifyCenter gap5 itemNumberIndex ${item?.number < 10 ? `smallItmIndx` : `medItmIndx`}`}>
                    {item?.number < 10 && (
                        <span className={`itemTypeIcon main`}>
                            {item?.type[0]}
                        </span>
                    )} 
                    <span className={`itemIndex`}>
                        <i>{item?.number}</i>
                    </span> 
                </div>
                <div aria-hidden className={`itemTypeIndex flexCenter gap5`}>
                    <span className={`itemTypeIcon main`}>
                        ⇅
                    </span> 
                    <span className={`itemIndex`}>
                        {itemIndex + 1}
                    </span>
                </div>
            </div>
            {item?.imageURLs?.length > 0 && (
                <Img alt={item?.name} src={item?.imageURLs[0]} width={`auto`} height={`160px`} />
            )}
        </div>
        <div className={`itemContent width100 itemNameStatusDescriptionEnd flexCenter gap5 spaceBetween`}>
            <div ref={itemStartEl} className={`itemStart itemNameStatusDescription`}>
                <div className={`itemNameStatus`} style={{ flex: 1 }}>
                    <h3 className={`itemNameStatusRow flexCenter`}>
                        <strong className={`itemName lineClamp2`}>
                            {item?.name}
                        </strong>
                        {(startW > smallStartW) && (
                            <StatusTag 
                                item={item} 
                                dateTag={true}
                                showIcon={false}
                                label={item?.updated}
                                style={{ marginLeft: 15 }} 
                                className={`itemNameDateTag itemDateTag`}
                                icon={<DateRangeSharp style={{ fontSize: 18 }} />}
                            />
                        )}
                    </h3>
                </div>
                <div className={`itemDescription lineClamp2`} style={{ flex: 1 }}>
                    {item?.description}
                </div>
            </div>
            <div className={`itemEndContainer`}>
                {(startW <= smallStartW) && (
                    <StatusTag 
                        item={item} 
                        dateTag={true}
                        showIcon={false}
                        label={item?.updated}
                        style={{ marginLeft: 15 }} 
                        className={`itemEndDateTag itemDateTag`}
                        icon={<DateRangeSharp style={{ fontSize: 18 }} />}
                    />
                )}
                <div className={`itemEnd flexCenter gap10`}>
                    <StatusTag item={item} disabled={false} thiccBtn={true} onClick={(e: any) => statusChange(e, item)} />
                    <Tooltip placement={`top`} title={`Delete Item #${item?.number} "${item?.name}"`} arrow>
                        <Button
                            onClick={onDelete}
                            aria-label={`Delete`}
                            className={`itemButton itemDeleteButton`}
                        >
                            <Delete style={{ fontSize: 18 }} className={`itemDeleteIcon main`} />
                        </Button>
                    </Tooltip>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}