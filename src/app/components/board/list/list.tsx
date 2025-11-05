'use client';

import './list.scss';

import { toast } from 'react-toastify';
import BoardForm from '../form/board-form';
import { statuses } from '../status/status';
import Logo from '@/app/components/logo/logo';
import { Item } from '@/shared/types/models/Item';
import ItemComponent, { type } from '../item/item';
import { StateGlobals } from '@/shared/global-context';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { addItemToDatabase, db, itemConverter, Tables } from '@/shared/server/firebase';
import Icon_Button from '../../buttons/icon-button/icon-button';
import { ArrowDropDownTwoTone, Settings } from '@mui/icons-material';
import { useContext, useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { imagesObject } from '@/app/components/slider/images-carousel/images-carousel';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DndContext, DragEndEvent, DragStartEvent, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { constants, countPropertiesInObject, errorToast, genID, getIDParts, logToast, randomNumber } from '@/shared/scripts/constants';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

export default function ListComponent({
  list,
  title = `To Do`,
}: any) {
  const listScroll = useRef(null);
  const { mobile } = constants?.breakpoints;
  const { user, width, boardForm, isPWA, setSelected } = useContext<any>(StateGlobals);

  const desktopSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const mobileSensors = useSensors(
    // useSensor(MouseSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 5 } })
    // useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );
  const sensors = (isPWA || width <= mobile) ? mobileSensors : desktopSensors;

  const imageURLs = Object.values(imagesObject.vertical);

  const modifiers = useMemo(() => [restrictToVerticalAxis], []);

  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const itemsRef = collection(db, Tables.items).withConverter(itemConverter);
    const itemsQuery = query(itemsRef, where(`listID`, `==`, list?.id));
    const unsubItemsArr = onSnapshot(itemsQuery, itemSnap => {
      const ordItms: Item[] = [];
      const itms = itemSnap.docs.map(d => new Item({ ...d.data(), board: user?.data.board, list }));
      list?.itemIDs?.forEach((id: string) => {
        let itm = itms?.find(i => i?.id == id);
        if (itm) {
          ordItms.push(itm);
        }
      })
      setItems(ordItms);
    })
    return () => {
      unsubItemsArr();
    }
  }, [])

  // useEffect(() => {
  //   let brdItms = user?.data?.items;
  //   let brdLstItms = brdItms && Array.isArray(brdItms) ? brdItms : [];
  //   let filtBrdLstItms = brdLstItms?.length > 0 ? brdLstItms?.filter(i => i?.listID == list?.id) : brdLstItms;
  //   let itms = list?.items && Array.isArray(list?.items) ? list?.items : filtBrdLstItms;
  //   setItems(itms);
  // }, [list, list?.items, user?.data?.lists, user?.data?.items])

  const onDragStart = useCallback((e: DragStartEvent) => {
    // keep or log if you want; the key is to ALWAYS pass this prop
    // const { active, activatorEvent } = e;
    // console.log(`onDragStart`, { e, active, activatorEvent });
  }, []);

  const scrollListTo = (bottom = true) => {
    if (listScroll && listScroll != null && listScroll?.current) {
      let listEl: any = listScroll?.current;
      if (listEl) {
        listEl.scrollTop = bottom ? listEl.scrollHeight : 0;
      }
    }
  }

  const addItem = async (e?: any) => {
    let number = list?.itemIDs?.length + 1;
    let randomImage = imageURLs[randomNumber(imageURLs?.length)];
    let name = boardForm?.name == `` ? `${type} ${number}` : boardForm?.name;
    let imageURL = boardForm?.imageURL == `` ? randomImage : boardForm?.imageURL;
    let imagesURLs = [imageURL]?.filter(val => val != ``);
    let description = boardForm?.description == `` ? name : boardForm?.description;
    let newItemID = genID(type, number, name);
    let newItem = new Item({ 
      type,
      name, 
      number, 
      description, 
      userID: user?.id,
      listID: list?.id,
      id: newItemID?.id, 
      userIDs: [user?.id],
      listIDs: [list?.id],
      createdBy: user?.id,
      updatedBy: user?.id,
      imageURLs: imagesURLs, 
      uuid: newItemID?.uuid,
      created: newItemID?.date, 
      updated: newItemID?.date, 
      boardID: user?.data?.board?.id,
      boardIDs: [user?.data?.board?.id],
    });
    newItem.properties = countPropertiesInObject(newItem);
    await addItemToDatabase(newItem, user).then(async response => {
      setTimeout(() => {
        toast?.dismiss();
        logToast(`Added Item`, newItem);
        setTimeout(() => {
          scrollListTo();
        }, 250)
      }, 500);
      return response;
    }).catch(error => {
      let errorMessage = `Error on Create Item`;
      errorToast(errorMessage, error);
      return;
    });
  };

  const deleteItem = (id: string) => {
    // setBoardItems((prev: Item[]) => prev.filter(i => i.id !== id));
  };

  const statusChange = (e: any, itm: Item) => {
    let { date } = getIDParts();
    itm.updated = date;
    itm.status = statuses[itm.status].transition;
    // setBoardItems((prevItems: Item[]) => prevItems?.map((it: Item) => it?.id == itm?.id ? new Item(itm) : it));
  }

  const onItemClick = (e: any, item: Item | any) => {
    let clicked = e?.target;
    if (clicked) {
      let clickedClasses = String(clicked?.className);
      if (clickedClasses && (clickedClasses.length > 0)) {
        if (!clickedClasses.includes(`itemButton`)) {
          console.log(`Item`, item);
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
    // let { date } = getIDParts();
    let currentArr: string[] = list?.itemIDs;
    let oldI = currentArr?.findIndex(i => i == active?.id);
    let newII = currentArr?.findIndex(i => i == over?.id);
    // let updArr = arrayMove(currentArr, oldI, newII);
    setItems(prev => arrayMove(prev, oldI, newII));
  }, []);

  return (
    <div className={`listComponent dndBoardList`}>
      <div className={`boardListTitle listTitle boardListFormContainer boardFormContainer flexCenter gap5 spaceBetween`}>
        <Logo label={title} />
        <span className={`listTitleRowData flexCenter gap5`}>
          <Icon_Button title={`List Settings`} style={{ marginRight: 5 }}>
            <Settings className={`settingsIcon`} style={{ fontSize: 20 }} />
          </Icon_Button>
          <span className={`main`}>
            {items?.length}
          </span> Item(s)
          <Icon_Button size={22} title={`Lists`} style={{ marginLeft: 5, marginRight: 2, }}>
            <ArrowDropDownTwoTone className={`arrowIcon`} style={{ fontSize: 20 }} />
          </Icon_Button>
        </span>
      </div>
      <div ref={listScroll} className={`dndBoardListContext dndContainer componentContainer`}>
        <DndContext sensors={sensors} modifiers={modifiers} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          {items?.length > 0 ? (
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
              <div className={`itemsGrid`} style={{ display: `grid`, gap: 8 }}>
                {items?.map((item: Item, itemIndex: number) => (
                  <ItemComponent 
                    item={item} 
                    id={item?.id} 
                    key={item?.id} 
                    itemIndex={itemIndex}
                    statusChange={statusChange}
                    onDelete={() => deleteItem(item?.id)} 
                    onClick={(e: any) => onItemClick(e, item)} 
                  />
                ))}
              </div>
            </SortableContext>
          ) : <></>}
        </DndContext>
      </div>
      <BoardForm onClick={addItem} className={`addItemForm`} />
    </div>
  );
}