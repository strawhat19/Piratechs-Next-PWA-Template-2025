'use client';

import { Button } from '@mui/material';
import { CSS } from '@dnd-kit/utilities';
import { Types } from '@/shared/types/types';
import Img from '@/app/components/image/image';
import { useContext, useMemo, useState } from 'react';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { State } from '@/app/components/container/container';
import { constants, genID } from '@/shared/scripts/constants';
import { imagesObject } from '@/app/components/slider/images-carousel/images-carousel';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DndContext, DragEndEvent, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

export class Item { 
  id: string = ``; 
  name: string = ``; 
  number: number = 0; 
  urls: string[] = []; 
  tags: string[] = []; 
  images: string[] = []; 
  description: string = ``; 
  type: Types | string = Types.Item;
  constructor(data: Partial<Item>) {
    Object.assign(this, data);
  }
};

const type = Types.Item;

function SortableRow({
  id,
  item,
  children,
  onClick,
  onDelete,
}: {
  item: Item;
  id: string;
  children: React.ReactNode;
  onClick: () => void;
  onDelete: () => void;
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

  return (
    <div ref={setNodeRef} className={`draggableItem`} style={style} {...attributes} {...listeners}>
      <div style={{ flex: 1, display: `flex`, alignItems: `center`, justifyContent: `space-between`, gap: 10 }} onClick={onClick}>
        <div
          aria-hidden
          title={`Drag`}
          style={{
            width: 25, height: 25, borderRadius: 4, border: `0px solid #555`,
            display: `grid`, placeItems: `center`, fontSize: 10, flex: `0 0 auto`
          }}
        >
          ⇅ {item?.number}
        </div>
        <Img alt={`Image`} src={imagesObject.vertical.ocean} width={`auto`} height={`150px`} />
        <div style={{ flex: 1 }}>
          <div style={{ flex: 1 }}>
            <h3>
              <strong>{children}</strong>
            </h3>
          </div>
          <div style={{ flex: 1 }}>
            {item?.name}
          </div>
        </div>
      </div>
      <button
        onClick={onDelete}
        aria-label={`Delete`}
        style={{
          border: `0px solid #444`, background: `transparent`, color: `inherit`,
          padding: `6px 10px`, borderRadius: 8, cursor: `pointer`
        }}
      >
        ✕
      </button>
    </div>
  );
}

export default function DndKitSimpleDemo() {
  let { width, isPWA, setSelected } = useContext<any>(State);

  const [items, setItems] = useState<Item[]>(() => [
    new Item({ number: 1, type: type, name: `First Item`, id: genID(type, 1, `First`)?.id, description: `This is First Item in the Board List Component` }),
    new Item({ number: 2, type: type, name: `Second Item`, id: genID(type, 2, `Second`)?.id, description: `This is Second Item in the Board List Component` }),
    new Item({ number: 3, type: type, name: `Third Item`, id: genID(type, 3, `Third`)?.id, description: `This is Third Item in the Board List Component` }),
  ]);

  const desktopSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const mobileSensors = useSensors(
    // useSensor(MouseSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 5 } })
  );
  const sensors = (isPWA || width <= constants?.breakpoints?.mobile) ? mobileSensors : desktopSensors;

  const addItem = () => {
    setItems((prev: any) => {
      let newIndex = prev.length + 1;
      let newTitle = `${type} ${newIndex}`;
      let newID = genID(type, newIndex, newTitle);
      let updatedItems = [...prev, { id: newID?.id, title: newTitle, type: type, number: newIndex }];
      return updatedItems;
    });
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setItems(prev => {
      const oldIndex = prev.findIndex(i => i.id === active.id);
      const newIndex = prev.findIndex(i => i.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const box: React.CSSProperties = useMemo(() => ({
    padding: 16,
    maxWidth: `100%`,
    borderRadius: 14,
    overflowY: `auto`,
    color: `#eaeaea`,
    margin: `30px auto`,
    border: `1px solid var(--bg)`,
    background: `var(--background)`,
    fontFamily: `system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif`,
    maxHeight: width <= constants?.breakpoints?.mobile ? (isPWA ? 400 : 300) : 800,
  }), []);

  const onItemFormSubmit = (e: any) => {
    e?.preventDefault();
    console.log(`onItemFormSubmit`, e);
  }

  return (
    <div className={`dndContainer componentContainer`} style={box}>
      <DndContext modifiers={[restrictToVerticalAxis]} sensors={sensors} onDragEnd={onDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className={`itemsGrid`} style={{ display: `grid`, gap: 8 }}>
            {items.map(item => (
              <SortableRow key={item.id} item={item} id={item.id} onClick={() => setSelected(item)} onDelete={() => deleteItem(item.id)}>
                {item?.name}
              </SortableRow>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className={`boardFormContainer`}>
        <form className={`boardForm boardFormField`} onSubmit={(e) => onItemFormSubmit(e)}>
          <input name={`name`} type={`text`} className={`nameField`} placeholder={`Item Name`} required />
          <input name={`description`} type={`text`} className={`descriptionField`} placeholder={`Item Description`} required />
        </form>
        <Button
          // disabled={}
          onClick={addItem}
          className={`fontI boardFormField`}
          style={{
            width: `100%`,
            maxWidth: `fit-content`,
            padding: `10px 14px`, borderRadius: 8, border: `0px solid #444`,
            background: `black`, color: `inherit`, cursor: `pointer`
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
}