'use client';

import './list.scss';

import { toast } from 'react-toastify';
import BoardForm from '../form/board-form';
import Logo from '@/app/components/logo/logo';
import { List } from '@/shared/types/models/List';
import { Item } from '@/shared/types/models/Item';
import ItemComponent, { type } from '../item/item';
import { StateGlobals } from '@/shared/global-context';
import StatusTag, { statuses } from '../status/status';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import Icon_Button from '../../buttons/icon-button/icon-button';
import { ArrowDropDownTwoTone, Settings } from '@mui/icons-material';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { useContext, useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { imagesObject } from '@/app/components/slider/images-carousel/images-carousel';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DndContext, DragEndEvent, DragStartEvent, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { constants, countPropertiesInObject, dev, errorToast, genID, getIDParts, logToast, randomNumber } from '@/shared/scripts/constants';
import { addItemToDatabase, db, deleteItemFromDatabase, itemConverter, listConverter, Tables, updateItemInDatabase, updateListInDatabase } from '@/shared/server/firebase';

export default function ListComponent({
  list: listObj,
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
  const [list, setList] = useState<List>(listObj);

  useEffect(() => {
    if (!listObj?.id) return;

    let latestList = listObj;
    const listDocRef = doc(db, Tables.lists, String(listObj.id)).withConverter(listConverter as any);
    const unsubList = onSnapshot(listDocRef, snap => {
      if (!snap.exists()) {
        setList(listObj);
        return;
      }
      latestList = snap.data();
      setList(latestList);
    });

    const itemsRef = collection(db, Tables.items).withConverter(itemConverter);
    const itemsQuery = query(itemsRef, where(`listID`, `==`, latestList?.id));
    const unsubItemsArr = onSnapshot(itemsQuery, itemSnap => {
      const listsOrderedItems: Item[] = [];
      const itms = itemSnap.docs.map(d => new Item({ ...d.data(), board: user?.data.board, list: latestList, }));
      latestList?.itemIDs?.forEach((id: string) => {
        let itm = itms?.find(i => i?.id == id);
        if (itm) {
          listsOrderedItems.push(itm);
        }
      })
      setItems(listsOrderedItems);
    })

    return () => {
      unsubList();
      unsubItemsArr();
    }
  }, [])

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
      imageURLs: [], 
      description: ``, 
      userID: user?.id,
      listID: list?.id,
      id: newItemID?.id, 
      userIDs: [user?.id],
      listIDs: [list?.id],
      createdBy: user?.id,
      updatedBy: user?.id,
      uuid: newItemID?.uuid,
      created: newItemID?.date, 
      updated: newItemID?.date, 
      boardID: user?.data?.board?.id,
      boardIDs: [user?.data?.board?.id],
    });
    newItem.properties = countPropertiesInObject(newItem);
    setItems(prev => [ ...prev, newItem ]);
    setList(prev => ({ ...prev, itemIDs: [...prev?.itemIDs, newItem?.id] }));
    await addItemToDatabase(newItem, user).then(async response => {
      setTimeout(() => {
        toast?.dismiss();
        logToast(`Added Item`, {newItem, list});
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

  const deleteItem = async (itm: Item) => {
    setItems((prev: Item[]) => prev.filter(i => i.id !== itm?.id));
    toast.info(`Deleting Item`);
    await deleteItemFromDatabase(itm, user)?.then(async response => {
      setTimeout(() => {
        toast?.dismiss();
        logToast(`Deleted Item`, response);
      }, 500);
      return response;
    })?.catch(error => {
      toast?.dismiss();
      let errorMessage = `Error on Delete Item`;
      errorToast(errorMessage, error);
      return;
    });
  };

  const statusChange = async (e: any, itm: Item) => {
    toast.info(`Updating Item`);
    let { date } = getIDParts();
    let newStatus = statuses[itm.status].transition;
    let updates = { status: newStatus, updated: date };
    setItems((prev: Item[]) => prev.map(i => (i.id == itm?.id ? ({ ...i, ...updates }) : i)));
    await updateItemInDatabase({ id: itm?.id, ...updates }, user)?.then(data => {
      setTimeout(() => {
        toast?.dismiss();
        logToast(`Updated Item`, data);
      }, 500);
      return data;
    });
  }

  const onItemClick = (e: any, item: Item | any) => {
    let clicked = e?.target;
    if (clicked) {
      let clickedClasses = String(clicked?.className);
      if (clickedClasses && (clickedClasses.length > 0)) {
        if (!clickedClasses.includes(`itemButton`)) {
          dev() && console.log(`Item Click`, item);
          setSelected({
            ...item,
            statusChange,
          });
        }
      }
    }
  }

  const onDragEnd = useCallback(async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    let { date: updated } = getIDParts();
    toast.info(`Updating List`);
    let itmIDs: string[] = items?.map(i => i?.id);
    let oldI = itmIDs?.findIndex(i => i == active?.id);
    let newII = itmIDs?.findIndex(i => i == over?.id);
    let itemIDs = arrayMove(itmIDs, oldI, newII);
    setItems(prev => arrayMove(prev, oldI, newII));
    let id = list?.id;
    let updates = { updated, itemIDs };
    await updateListInDatabase(id, updates)?.then(async response => {
      setTimeout(() => {
        toast?.dismiss();
        logToast(`Updated List`, { id, ...updates });
      }, 500);
      return response;
    })?.catch(error => {
      let errorMessage = `Error on Update List`;
      errorToast(errorMessage, error);
      return;
    });
  }, [items]);

  return (
    <div className={`listComponent dndBoardList`}>
      <div className={`boardListTitle listTitle boardListFormContainer boardFormContainer flexCenter gap5 spaceBetween`}>
        <Logo label={title} />
        <span className={`listTitleRowData flexCenter gap5`}>
          <StatusTag 
            item={list} 
            dateTag={true}
            label={list?.updated}
            className={`listDateTag`}
          />
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
                    onDelete={() => deleteItem(item)} 
                    onClick={(e: any) => onItemClick(e, item)} 
                  />
                ))}
              </div>
            </SortableContext>
          ) : <></>}
        </DndContext>
      </div>
      <BoardForm onClick={addItem} className={`addItemForm`} autoFocus={true} disabled={!boardForm?.form?.includes(`addItemForm`)} />
    </div>
  );
}