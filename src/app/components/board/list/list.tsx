'use client';

import BoardForm from '../form/board-form';
import { useContext, useMemo } from 'react';
import Logo from '@/app/components/logo/logo';
import ItemComponent, { Item, type } from '../item/item';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { State } from '@/app/components/container/container';
import { constants, genID, randomNumber } from '@/shared/scripts/constants';
import { imagesObject } from '@/app/components/slider/images-carousel/images-carousel';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DndContext, DragEndEvent, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

export default function ListComponent({
  title = `To Do`,
}: any) {
  const { width, boardForm, isPWA, setSelected, boardItems, setBoardItems } = useContext<any>(State);

  const desktopSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const mobileSensors = useSensors(
    // useSensor(MouseSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 5 } })
  );
  const sensors = (isPWA || width <= constants?.breakpoints?.mobile) ? mobileSensors : desktopSensors;

  const imageURLs = Object.values(imagesObject.vertical);

  const addItem = () => {
    setBoardItems((prev: any) => {
      let newIndex = prev.length + 1;
      let randomImage = imageURLs[randomNumber(imageURLs?.length)];
      let newImageURL = boardForm?.imageURL == `` ? randomImage : boardForm?.imageURL;
      let images = [newImageURL]?.filter(val => val != ``);
      let newTitle = boardForm?.name == `` ? `${type} ${newIndex}` : boardForm?.name;
      let newDescription = boardForm?.description == `` ? newTitle : boardForm?.description;
      let newID = genID(type, newIndex, newTitle);
      let updatedItems = [...prev, new Item({ type, imageURLs: images, id: newID?.id, name: newTitle, number: newIndex, description: newDescription })];
      return updatedItems;
    });
  };

  const deleteItem = (id: string) => {
    setBoardItems((prev: Item[]) => prev.filter(i => i.id !== id));
  };

  const onItemClick = (e: any, item: Item | any) => {
    let clicked = e?.target;
    if (clicked) {
        let clickedClasses = String(clicked?.className);
        console.log(`onItemClick`, {class: clicked?.className, clickedClasses});
        if (clickedClasses && (clickedClasses.length > 0)) {
            if (!clickedClasses.includes(`itemButton`)) {
                setSelected(item);
            }
        }
    }
  }

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setBoardItems((prev: Item[]) => {
      const oldIndex = prev.findIndex(i => i.id === active.id);
      const newIndex = prev.findIndex(i => i.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const box: React.CSSProperties = useMemo(() => ({
    padding: 16,
    maxWidth: `100%`,
    borderRadius: 8,
    color: `#eaeaea`,
    overflowY: `auto`,
    margin: `10px auto`,
    fontFamily: `var(--font)`,
    // borderTopRightRadius: 0,
    border: `1px solid var(--bg)`,
    // borderBottomRightRadius: 0,
    background: `var(--background)`,
    minHeight: width <= constants?.breakpoints?.mobile ? (isPWA ? 400 : 300) : 600,
    maxHeight: width <= constants?.breakpoints?.mobile ? (isPWA ? 400 : 300) : 600,
  }), []);

  return (
    <div className={`listComponent dndBoardList`} style={{ width: `100%` }}>
      <div className={`listTitle boardListFormContainer boardFormContainer flexCenter gap5 spaceBetween`} style={{ width: `95%`, padding: `10px 16px`, margin: `10px auto 0` }}>
        <Logo label={title} />
        <span className={`flexCenter gap5`}>
            <span className={`main`}>
                {boardItems.length}
            </span> Item(s)
        </span>
      </div>
      <div className={`dndBoardListContext dndContainer componentContainer`} style={box}>
        <DndContext modifiers={[restrictToVerticalAxis]} sensors={sensors} onDragEnd={onDragEnd}>
          <SortableContext items={boardItems} strategy={verticalListSortingStrategy}>
            <div className={`itemsGrid`} style={{ display: `grid`, gap: 8 }}>
              {boardItems.map((item: Item, itemIndex: number) => (
                <ItemComponent 
                    item={item} 
                    id={item.id} 
                    key={item.id} 
                    itemIndex={itemIndex}
                    setItems={setBoardItems} 
                    onDelete={() => deleteItem(item.id)} 
                    onClick={(e: any) => onItemClick(e, item)} 
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      <BoardForm onClick={addItem} />
      {/* {(isPWA || width <= constants?.breakpoints?.mobile) ? <></> : <BoardForm onClick={addItem} />} */}
    </div>
  );
}