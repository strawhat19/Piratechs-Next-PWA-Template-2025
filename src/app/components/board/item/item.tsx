import Img from '../../image/image';
import { CSS } from '@dnd-kit/utilities';
import { Types } from '@/shared/types/types';
import { useSortable } from '@dnd-kit/sortable';
import StatusTag, { Status, statuses } from '../status/status';
import { useEffect } from 'react';

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
  onClick: () => void;
  onDelete: () => void;
//   children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    gap: 10,
    transition,
    cursor: `grab`,
    display: `flex`,
    borderRadius: 12,
    padding: `0 12px`,
    userSelect: `none`,
    background: `black`,
    alignItems: `center`,
    opacity: isDragging ? 0.85 : 1,
    border: `1px solid var(--background)`,
    transform: CSS.Transform.toString(transform),
  };

  const statusChange = (e: any, itm: Item) => {
    itm.status = statuses[itm.status].transition;
    setItems((prevItems: Item[]) => prevItems?.map((it: Item) => it?.id == itm?.id ? new Item(itm) : it));
  }

  useEffect(() => {
    item.onClick = statusChange;
  }, [])

  return (
    <div ref={setNodeRef} className={`itemComponent draggableItem`} style={style} {...attributes} {...listeners}>
      <div style={{ flex: 1, display: `flex`, alignItems: `center`, justifyContent: `space-between`, gap: 10 }} onClick={onClick}>
        <div
          aria-hidden
          title={`Drag`}
          className={`flexCenter gap5`}
          style={{
            width: 25, 
            height: 25, 
            fontSize: 12,
            borderRadius: 4, 
            border: `0px solid #555`, 
          }}
        >
          <span className={`main`}>
            ⇅
          </span> 
          {item?.number}
        </div>
        {item?.imageURLs?.length > 0 && (
          <Img alt={item?.name} src={item?.imageURLs[0]} width={`auto`} height={`150px`} />
        )}
        <div style={{ flex: 1, gap: 8, paddingLeft: 10, display: `flex`, flexDirection: `column` }}>
          <div style={{ flex: 1 }}>
            <h3 className={`flexCenter`}>
                <strong>
                    {item?.name}
                </strong>
                <StatusTag item={item} style={{ marginLeft: 15 }} />
            </h3>
          </div>
          <div style={{ flex: 1 }}>
            {item?.description}
          </div>
        </div>
      </div>
      <StatusTag item={item} disabled={false} currentStatus={false} onClick={(e: any) => statusChange(e, item)} />
      <button
        onClick={onDelete}
        aria-label={`Delete`}
        style={{
          border: `0px solid #444`, background: `var(--bg)`, color: `inherit`,
          padding: `6px 10px`, borderRadius: 8, cursor: `pointer`
        }}
      >
        ✕
      </button>
    </div>
  );
}