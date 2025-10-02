'use client';

import { Button } from '@mui/material';
import Logo from '@/app/components/logo/logo';
import { useContext, useMemo, useState } from 'react';
import ItemComponent, { Item, type } from '../item/item';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { State } from '@/app/components/container/container';
import { constants, genID, randomNumber } from '@/shared/scripts/constants';
import { imagesObject } from '@/app/components/slider/images-carousel/images-carousel';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DndContext, DragEndEvent, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

export default function ListComponent() {
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
      imageURLs: [imageURLs[randomNumber(imageURLs?.length)]], 
      description: `This is First Item in the Board List Component`, 
    }),
    new Item({ 
      number: 2, 
      name: `Second Item`, 
      id: genID(type, 2, `Second`)?.id, 
      imageURLs: [imageURLs[randomNumber(imageURLs?.length)]], 
      description: `This is Second Item in the Board List Component`, 
    }),
    new Item({ 
      number: 3, 
      name: `Third Item`, 
      id: genID(type, 3, `Third`)?.id, 
      imageURLs: [imageURLs[randomNumber(imageURLs?.length)]], 
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
      let updatedItems = [...prev, new Item({ type, imageURLs: images, id: newID?.id, name: newTitle, number: newIndex, description: newDescription })];
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
    fontFamily: `var(--font)`,
    // borderTopRightRadius: 0,
    border: `1px solid var(--bg)`,
    // borderBottomRightRadius: 0,
    background: `var(--background)`,
    maxHeight: width <= constants?.breakpoints?.mobile ? (isPWA ? 400 : 300) : 600,
  }), []);

  return (
    <div className={`listComponent dndBoardList`} style={{ width: `100%` }}>
      <div className={`boardListFormContainer boardFormContainer flexCenter gap5 spaceBetween`} style={{ width: `95%`, padding: `10px 16px`, margin: `10px auto 0` }}>
        <Logo label={`To Do`} />
        <span className={`flexCenter gap5`}>
            <span className={`main`}>
                {items.length}
            </span> Item(s)
        </span>
      </div>
      <div className={`dndBoardListContext dndContainer componentContainer`} style={box}>
        <DndContext modifiers={[restrictToVerticalAxis]} sensors={sensors} onDragEnd={onDragEnd}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className={`itemsGrid`} style={{ display: `grid`, gap: 8 }}>
              {items.map(item => (
                <ItemComponent 
                    item={item} 
                    id={item.id} 
                    key={item.id} 
                    setItems={setItems} 
                    onClick={() => setSelected(item)} 
                    onDelete={() => deleteItem(item.id)} 
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      <div className={`boardListFormContainer boardFormContainer`} style={{ width: `95%`, padding: `10px 16px`, margin: `0 auto` }}>
        <form className={`boardListForm boardForm boardFormField`} onInput={(e) => updateForm(e)} onSubmit={(e) => onItemFormSubmit(e)}>
          <input name={`name`} type={`text`} className={`nameField`} placeholder={`Name`} style={{ maxHeight: 45, maxWidth: 300 }} required />
          <input name={`description`} type={`text`} className={`descriptionField`} placeholder={`Description`} style={{ maxHeight: 45 }} />
          <input name={`imageURL`} type={`url`} className={`imageURLField`} placeholder={`Image URL`} style={{ maxHeight: 45 }} />
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