'use client';

import BoardForm from '../form/board-form';
import { statuses } from '../status/status';
import Logo from '@/app/components/logo/logo';
import { Settings } from '@mui/icons-material';
import { StateGlobals } from '@/shared/global-context';
import ItemComponent, { Item, type } from '../item/item';
import { useContext, useMemo, useCallback } from 'react';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import Icon_Button from '../../buttons/icon-button/icon-button';
import { imagesObject } from '@/app/components/slider/images-carousel/images-carousel';
import { constants, genID, getIDParts, randomNumber } from '@/shared/scripts/constants';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DndContext, DragEndEvent, DragStartEvent, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

export default function ListComponent({
  title = `To Do`,
}: any) {
  const { width, boardForm, isPWA, setSelected, boardItems, setBoardItems } = useContext<any>(StateGlobals);

  const desktopSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const mobileSensors = useSensors(
    // useSensor(MouseSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 5 } })
  );
  const sensors = (isPWA || width <= constants?.breakpoints?.mobile) ? mobileSensors : desktopSensors;

  const imageURLs = Object.values(imagesObject.vertical);

  const modifiers = useMemo(() => [restrictToVerticalAxis], []);

  const onDragStart = useCallback((e: DragStartEvent) => {
    // keep or log if you want; the key is to ALWAYS pass this prop
    // const { active, activatorEvent } = e;
    // console.log(`onDragStart`, { e, active, activatorEvent });
  }, []);

  const addItem = () => {
    setBoardItems((prev: any) => {
      let newIndex = prev.length + 1;
      let randomImage = imageURLs[randomNumber(imageURLs?.length)];
      let newImageURL = boardForm?.imageURL == `` ? randomImage : boardForm?.imageURL;
      let images = [newImageURL]?.filter(val => val != ``);
      let newTitle = boardForm?.name == `` ? `${type} ${newIndex}` : boardForm?.name;
      let newDescription = boardForm?.description == `` ? newTitle : boardForm?.description;
      let newID = genID(type, newIndex, newTitle);
      let updatedItems = [
        ...prev, 
        new Item({ 
          type, 
          id: newID?.id, 
          name: newTitle, 
          number: newIndex, 
          imageURLs: images, 
          created: newID?.date, 
          updated: newID?.date, 
          description: newDescription, 
        }),
      ];
      return updatedItems;
    });
  };

  const deleteItem = (id: string) => {
    setBoardItems((prev: Item[]) => prev.filter(i => i.id !== id));
  };

  const statusChange = (e: any, itm: Item) => {
    let { date } = getIDParts();
    itm.updated = date;
    itm.status = statuses[itm.status].transition;
    setBoardItems((prevItems: Item[]) => prevItems?.map((it: Item) => it?.id == itm?.id ? new Item(itm) : it));
  }

  const onItemClick = (e: any, item: Item | any) => {
    let clicked = e?.target;
    if (clicked) {
      let clickedClasses = String(clicked?.className);
      if (clickedClasses && (clickedClasses.length > 0)) {
        if (!clickedClasses.includes(`itemButton`)) {
          setSelected({
            ...item,
            statusChange,
          });
        }
      }
    }
  }

  const onDragEnd = useCallback((e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setBoardItems((prev: Item[]) => {
      const oldIndex = prev.findIndex(i => i.id === active.id);
      const newIndex = prev.findIndex(i => i.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, [setBoardItems]);

  return (
    <div className={`listComponent dndBoardList`}>
      <div className={`boardListTitle listTitle boardListFormContainer boardFormContainer flexCenter gap5 spaceBetween`}>
        <Logo label={title} />
        <span className={`flexCenter gap5`}>
          <Icon_Button title={`List Settings`}>
            <Settings className={`settingsIcon`} style={{ fontSize: 20 }} />
          </Icon_Button>
          <span className={`main`}>
            {boardItems.length}
          </span> Item(s)
        </span>
      </div>
      <div className={`dndBoardListContext dndContainer componentContainer`}>
        <DndContext sensors={sensors} modifiers={modifiers} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <SortableContext items={boardItems} strategy={verticalListSortingStrategy}>
            <div className={`itemsGrid`} style={{ display: `grid`, gap: 8 }}>
              {boardItems.map((item: Item, itemIndex: number) => (
                <ItemComponent 
                  item={item} 
                  id={item.id} 
                  key={item.id} 
                  itemIndex={itemIndex}
                  statusChange={statusChange}
                  onDelete={() => deleteItem(item.id)} 
                  onClick={(e: any) => onItemClick(e, item)} 
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      <BoardForm onClick={addItem} />
    </div>
  );
}