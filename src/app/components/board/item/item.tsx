import { useEffect } from 'react';
import Img from '../../image/image';
import { Button } from '@mui/material';
import { CSS } from '@dnd-kit/utilities';
import { Delete } from '@mui/icons-material';
import { Types } from '@/shared/types/types';
import { useSortable } from '@dnd-kit/sortable';
import StatusTag, { Status, statuses } from '../status/status';

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
  setItems,
}: {
  item: Item;
  id: string;
  setItems: any;
  onDelete: () => void;
  onClick: (e: any) => void;
//   children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    gap: 10,
    transition,
    cursor: `grab`,
    display: `flex`,
    borderRadius: 12,
    userSelect: `none`,
    alignItems: `center`,
    padding: `0 9px 0 7px`,
    background: `var(--navy)`,
    opacity: isDragging ? 0.85 : 1,
    border: `1px solid var(--background)`,
    transform: CSS.Transform.toString(transform),
  };

  const statusChange = (e: any, itm: Item) => {
    itm.status = statuses[itm.status].transition;
    setItems((prevItems: Item[]) => prevItems?.map((it: Item) => it?.id == itm?.id ? new Item(itm) : it));
  }

//   useEffect(() => {
//     item.onClick = statusChange;
//   }, [])

  return (
    <div ref={setNodeRef} className={`itemComponent draggableItem`} style={style} {...attributes} {...listeners}>
      <div className={`itemInner`} style={{ flex: 1, display: `flex`, alignItems: `center`, justifyContent: `space-between`, gap: 10 }} onClick={onClick}>
        <div className={`itemTypeIndexImages flexCenter gap5`}>
            <div
                aria-hidden
                title={`Drag`}
                className={`itemTypeIndex flexCenter gap5`}
                style={{
                    height: 25, 
                    fontSize: 12,
                    width: `auto`, 
                    borderRadius: 4, 
                    border: `0px solid #555`, 
                }}
            >
                <span className={`itemTypeIcon main`}>
                    ⇅
                </span> 
                <span className={`itemIndex`}>
                    {item?.number}
                </span>
            </div>
            {item?.imageURLs?.length > 0 && (
                <Img alt={item?.name} src={item?.imageURLs[0]} width={`auto`} height={`160px`} />
            )}
        </div>
        <div className={`itemContent width100 itemNameStatusDescriptionEnd flexCenter gap5 spaceBetween`}>
            <div className={`itemNameStatusDescription`} style={{ flex: 1, gap: 8, paddingLeft: 10, display: `flex`, flexDirection: `column` }}>
                <div className={`itemNameStatus`} style={{ flex: 1 }}>
                    <h3 className={`itemNameStatusRow flexCenter`}>
                        <strong className={`itemName`}>
                            {item?.name}
                        </strong>
                        <StatusTag item={item} style={{ marginLeft: 15 }} />
                    </h3>
                </div>
                <div className={`itemDescription lineClamp2`} style={{ flex: 1 }}>
                    {item?.description}
                </div>
            </div>
            <div className={`itemEnd flexCenter gap10`}>
                <StatusTag item={item} disabled={false} currentStatus={false} onClick={(e: any) => statusChange(e, item)} />
                <Button
                    onClick={onDelete}
                    aria-label={`Delete`}
                    className={`itemButton itemDeleteButton`}
                    style={{
                        border: `0px solid #444`, background: `var(--bg)`, color: `inherit`,
                        padding: `6px 10px`, borderRadius: 4, cursor: `pointer`
                    }}
                >
                    <Delete style={{ fontSize: 18 }} className={`itemDeleteIcon main`} />
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}