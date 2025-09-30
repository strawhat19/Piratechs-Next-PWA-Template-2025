'use client';

import { Button } from '@mui/material';
import { CSS } from '@dnd-kit/utilities';
import { Types } from '@/shared/types/types';
import Logo from '@/app/components/logo/logo';
import Img from '@/app/components/image/image';
import { useContext, useMemo, useState } from 'react';
import { Check, Circle, List } from '@mui/icons-material';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { State } from '@/app/components/container/container';
import { constants, genID, randomNumber } from '@/shared/scripts/constants';
import { imagesObject } from '@/app/components/slider/images-carousel/images-carousel';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DndContext, DragEndEvent, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

const type = Types.Item;

export const statuses: any = {
  Idea: {
    transition: `Active`,
    iconTransition: <Circle style={{ fontSize: 18 }} />,
  },
  Active: {
    transition: `Complete`,
    iconTransition: <Check style={{ fontSize: 18 }} />,
  },
  Complete: {
    transition: `Idea`,
    iconTransition: <List style={{ fontSize: 18 }} />,
  },
}

export class Item { 
  id: string = ``; 
  name: string = ``; 
  number: number = 0; 
  urls: string[] = []; 
  tags: string[] = []; 
  images: string[] = []; 
  status: string = `Idea`;
  description: string = ``; 
  type: Types | string = type;
  constructor(data: Partial<Item>) {
    Object.assign(this, data);
  }
};

function SortableRow({
  id,
  item,
  children,
  onClick,
  onDelete,
  setItems,
}: {
  item: Item;
  id: string;
  setItems: any;
  onClick: () => void;
  onDelete: () => void;
  children: React.ReactNode;
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

  return (
    <div ref={setNodeRef} className={`draggableItem`} style={style} {...attributes} {...listeners}>
      <div style={{ flex: 1, display: `flex`, alignItems: `center`, justifyContent: `space-between`, gap: 10 }} onClick={onClick}>
        <div
          aria-hidden
          title={`Drag`}
          style={{
            width: 25, height: 25, borderRadius: 4, border: `0px solid #555`,
            display: `grid`, placeItems: `center`, fontSize: 12, flex: `0 0 auto`
          }}
        >
          ⇅ {item?.number}
        </div>
        {item?.images?.length > 0 && (
          <Img alt={item?.name} src={item?.images[0]} width={`auto`} height={`150px`} />
        )}
        <div style={{ flex: 1, gap: 8, paddingLeft: 10, display: `flex`, flexDirection: `column` }}>
          <div style={{ flex: 1 }}>
            <h3>
              <strong>{children}</strong> <span style={{ fontWeight: 300, fontSize: 14, marginLeft: 15 }}><i>{item?.status}</i></span>
            </h3>
          </div>
          <div style={{ flex: 1 }}>
            {item?.description}
          </div>
        </div>
      </div>
      <button
        onClick={(e) => statusChange(e, item)}
        style={{
          border: `0px solid #444`, background: `transparent`, color: `inherit`,
          padding: `6px 10px`, borderRadius: 8, cursor: `pointer`
        }}
      >
        {statuses[item?.status]?.iconTransition}
      </button>
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
  const { width, isPWA, setSelected } = useContext<any>(State);

  const desktopSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const mobileSensors = useSensors(
    // useSensor(MouseSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 5 } })
  );
  const sensors = (isPWA || width <= constants?.breakpoints?.mobile) ? mobileSensors : desktopSensors;

  const imageURLs = Object.values(imagesObject.vertical);

  const [items, setItems] = useState<Item[]>(() => [
    new Item({ 
      number: 1, 
      name: `First Item`, 
      id: genID(type, 1, `First`)?.id, 
      images: [imageURLs[randomNumber(imageURLs?.length)]], 
      description: `This is First Item in the Board List Component`, 
    }),
    new Item({ 
      number: 2, 
      name: `Second Item`, 
      id: genID(type, 2, `Second`)?.id, 
      images: [imageURLs[randomNumber(imageURLs?.length)]], 
      description: `This is Second Item in the Board List Component`, 
    }),
    new Item({ 
      number: 3, 
      name: `Third Item`, 
      id: genID(type, 3, `Third`)?.id, 
      images: [imageURLs[randomNumber(imageURLs?.length)]], 
      description: `This is Third Item in the Board List Component`,
    }),
  ]);

  const [form, setForm] = useState({ name: ``, description: ``, imageURL: `` });

  const updateForm = (e: any) => {
    const formField = e?.target;
    setForm(prevFormData => ({ ...prevFormData, [formField?.name]: formField?.value }));
  }

  const onItemFormSubmit = (e: any) => {
    e?.preventDefault();
    const form = e?.target;
    const formData = new FormData(form);
    const formValues: any = Object.fromEntries(formData?.entries());
    setForm(formValues);
  }

  const addItem = () => {
    setItems((prev: any) => {
      let newIndex = prev.length + 1;
      let randomImage = imageURLs[randomNumber(imageURLs?.length)];
      let newImageURL = form?.imageURL == `` ? randomImage : form?.imageURL;
      let images = [newImageURL]?.filter(val => val != ``);
      let newTitle = form?.name == `` ? `${type} ${newIndex}` : form?.name;
      let newDescription = form?.description == `` ? newTitle : form?.description;
      let newID = genID(type, newIndex, newTitle);
      let updatedItems = [...prev, new Item({ type, images, id: newID?.id, name: newTitle, number: newIndex, description: newDescription })];
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
    color: `#eaeaea`,
    overflowY: `auto`,
    margin: `10px auto`,
    borderTopRightRadius: 0,
    fontFamily: `var(--font)`,
    borderBottomRightRadius: 0,
    border: `1px solid var(--bg)`,
    background: `var(--background)`,
    maxHeight: width <= constants?.breakpoints?.mobile ? (isPWA ? 400 : 300) : 600,
  }), []);

  return (
    <div className={`dndBoard`} style={{ width: `100%` }}>
      <div className={`boardFormContainer`} style={{ width: `95%`, padding: `10px 16px`, margin: `10px auto 0` }}>
        <Logo label={`To Do`} />
      </div>
      <div className={`dndContainer componentContainer`} style={box}>
        <DndContext modifiers={[restrictToVerticalAxis]} sensors={sensors} onDragEnd={onDragEnd}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className={`itemsGrid`} style={{ display: `grid`, gap: 8 }}>
              {items.map(item => (
                <SortableRow key={item.id} item={item} id={item.id} setItems={setItems} onClick={() => setSelected(item)} onDelete={() => deleteItem(item.id)}>
                  {item?.name}
                </SortableRow>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      <div className={`boardFormContainer`} style={{ width: `95%`, padding: `10px 16px`, margin: `0 auto` }}>
        <form className={`boardForm boardFormField`} onInput={(e) => updateForm(e)} onSubmit={(e) => onItemFormSubmit(e)}>
          <input name={`name`} type={`text`} className={`nameField`} placeholder={`Item Name`} style={{ maxWidth: 300 }} required />
          <input name={`description`} type={`text`} className={`descriptionField`} placeholder={`Item Description`} />
          <input name={`imageURL`} type={`url`} className={`imageURLField`} placeholder={`Public Image URL`} />
          <Button
            type={`submit`}
            onClick={addItem}
            disabled={form?.name == ``}
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
        </form>
      </div>
    </div>
  );
}